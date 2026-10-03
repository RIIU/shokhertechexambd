"use client";

import { useCallback, useEffect, useReducer } from "react";
import type { Answers, OptionId } from "@/lib/types";

/**
 * Answer-sheet state for one attempt, kept in sessionStorage so a refresh
 * restores answers, flags and position. Timing is NOT stored here: the
 * deadline comes from the server-side attempt.
 */

export interface ExamSessionState {
  hydrated: boolean;
  answers: Answers;
  flags: Record<string, boolean>;
  current: number;
  /** +1 when moving forward, -1 when moving back; drives the slide animation. */
  direction: number;
  strikes: number;
}

type Action =
  | { type: "hydrate"; state: Partial<ExamSessionState> }
  | { type: "select"; questionId: string; optionId: OptionId | null }
  | { type: "flag"; questionId: string }
  | { type: "goto"; index: number; total: number }
  | { type: "strikes"; count: number };

const INITIAL: ExamSessionState = {
  hydrated: false,
  answers: {},
  flags: {},
  current: 0,
  direction: 1,
  strikes: 0,
};

function reducer(state: ExamSessionState, action: Action): ExamSessionState {
  switch (action.type) {
    case "hydrate":
      return { ...INITIAL, ...action.state, hydrated: true };
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

const storageKey = (attemptId: string) => `attempt:${attemptId}`;

function read(attemptId: string | null): Partial<ExamSessionState> {
  if (!attemptId) return {};
  try {
    const raw = window.sessionStorage.getItem(storageKey(attemptId));
    return raw ? (JSON.parse(raw) as Partial<ExamSessionState>) : {};
  } catch {
    return {};
  }
}

export function clearExamSession(attemptId: string) {
  try {
    window.sessionStorage.removeItem(storageKey(attemptId));
  } catch {
    /* storage unavailable */
  }
}

export function useExamSession(attemptId: string | null, totalQuestions: number) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  useEffect(() => {
    dispatch({ type: "hydrate", state: read(attemptId) });
  }, [attemptId]);

  useEffect(() => {
    if (!state.hydrated || !attemptId) return;
    const { hydrated: _h, direction: _d, ...persisted } = state;
    try {
      window.sessionStorage.setItem(storageKey(attemptId), JSON.stringify(persisted));
    } catch {
      /* storage full or blocked: the attempt still works, it just won't survive a reload */
    }
  }, [attemptId, state]);

  return {
    state,
    select: useCallback(
      (questionId: string, optionId: OptionId | null) => dispatch({ type: "select", questionId, optionId }),
      [],
    ),
    toggleFlag: useCallback((questionId: string) => dispatch({ type: "flag", questionId }), []),
    goTo: useCallback((index: number) => dispatch({ type: "goto", index, total: totalQuestions }), [totalQuestions]),
    setStrikes: useCallback((count: number) => dispatch({ type: "strikes", count }), []),
  };
}
