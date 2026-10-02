"use client";

import { useCallback, useEffect, useReducer } from "react";
import type { Answers, OptionId } from "@/lib/types";

/**
 * Exam attempt state, persisted to sessionStorage so a refresh resumes the
 * same attempt with the same deadline and strike count.
 *
 * In production the server owns `startedAt` (and therefore the deadline);
 * the client copy only drives the UI.
 */

export interface ExamSessionState {
  hydrated: boolean;
  startedAt: number | null;
  endsAt: number | null;
  answers: Answers;
  flags: Record<string, boolean>;
  current: number;
  /** +1 when moving forward, -1 when moving back; drives the slide animation. */
  direction: number;
  strikes: number;
}

type Action =
  | { type: "hydrate"; state: Partial<ExamSessionState> }
  | { type: "start"; now: number; durationSec: number }
  | { type: "select"; questionId: string; optionId: OptionId | null }
  | { type: "flag"; questionId: string }
  | { type: "goto"; index: number; total: number }
  | { type: "strikes"; count: number };

const INITIAL: ExamSessionState = {
  hydrated: false,
  startedAt: null,
  endsAt: null,
  answers: {},
  flags: {},
  current: 0,
  direction: 1,
  strikes: 0,
};

function reducer(state: ExamSessionState, action: Action): ExamSessionState {
  switch (action.type) {
    case "hydrate":
      return { ...state, ...action.state, hydrated: true };
    case "start":
      if (state.startedAt) return state; // resuming keeps the original deadline
      return { ...state, startedAt: action.now, endsAt: action.now + action.durationSec * 1000 };
    case "select":
      return { ...state, answers: { ...state.answers, [action.questionId]: action.optionId } };
    case "flag":
      return { ...state, flags: { ...state.flags, [action.questionId]: !state.flags[action.questionId] } };
    case "goto": {
      const index = Math.min(Math.max(0, action.index), action.total - 1);
      if (index === state.current) return state;
      return { ...state, current: index, direction: index > state.current ? 1 : -1 };
    }
    case "strikes":
      return { ...state, strikes: action.count };
  }
}

const storageKey = (examId: string) => `exam:${examId}:session`;

/** Where the graded result is kept for the result page. */
export const resultStorageKey = (examId: string) => `exam:${examId}:result`;

function read(examId: string): Partial<ExamSessionState> {
  try {
    const raw = window.sessionStorage.getItem(storageKey(examId));
    return raw ? (JSON.parse(raw) as Partial<ExamSessionState>) : {};
  } catch {
    return {};
  }
}

export function clearExamSession(examId: string) {
  try {
    window.sessionStorage.removeItem(storageKey(examId));
  } catch {
    /* storage unavailable */
  }
}

export function useExamSession(examId: string, durationSec: number, totalQuestions: number) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  useEffect(() => {
    dispatch({ type: "hydrate", state: read(examId) });
  }, [examId]);

  useEffect(() => {
    if (!state.hydrated || !state.startedAt) return;
    const { hydrated: _h, direction: _d, ...persisted } = state;
    try {
      window.sessionStorage.setItem(storageKey(examId), JSON.stringify(persisted));
    } catch {
      /* storage full or blocked: the attempt still works, it just won't survive a reload */
    }
  }, [examId, state]);

  return {
    state,
    start: useCallback(() => dispatch({ type: "start", now: Date.now(), durationSec }), [durationSec]),
    select: useCallback(
      (questionId: string, optionId: OptionId | null) => dispatch({ type: "select", questionId, optionId }),
      [],
    ),
    toggleFlag: useCallback((questionId: string) => dispatch({ type: "flag", questionId }), []),
    goTo: useCallback((index: number) => dispatch({ type: "goto", index, total: totalQuestions }), [totalQuestions]),
    setStrikes: useCallback((count: number) => dispatch({ type: "strikes", count }), []),
  };
}
