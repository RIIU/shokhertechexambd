"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { addQuestionAction, createExamAction, updateExamAction, type AdminFormState } from "@/app/admin/actions";
import { EXAM_TYPES, EXAM_TYPE_META, LEVELS, STREAMS, STREAM_IDS, getSubjects } from "@/lib/data/catalog";
import { OPTION_LABEL_BN, cn } from "@/lib/utils";
import type { ExamType, Level, StreamId } from "@/lib/types";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      <span lang="bn">{label}</span>
    </button>
  );
}

function Err({ state, name }: { state: AdminFormState; name: string }) {
  const m = state.fieldErrors?.[name];
  return m ? (
    <p lang="bn" className="field-error">
      {m}
    </p>
  ) : null;
}

function Saved({ state }: { state: AdminFormState }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!state.ok) return;
    setShow(true);
    const t = window.setTimeout(() => setShow(false), 2500);
    return () => window.clearTimeout(t);
  }, [state.ok]);
  return show ? (
    <span lang="bn" className="inline-flex items-center gap-1 text-sm text-brand-300">
      <CheckCircle2 className="h-4 w-4" /> সংরক্ষিত
    </span>
  ) : null;
}

export interface ExamMetaDefaults {
  id?: string;
  titleBn: string;
  titleEn: string;
  level: Level;
  stream: StreamId;
  subjectId: string;
  type: ExamType;
  minutes: number;
  negativeMark: number;
  maxWarnings: number;
  showSolutions?: boolean;
  isPaid?: boolean;
  price?: number;
}

const BLANK: ExamMetaDefaults = {
  titleBn: "",
  titleEn: "",
  level: "ssc",
  stream: "science",
  subjectId: "",
  type: "practice",
  minutes: 20,
  negativeMark: 0.25,
  maxWarnings: 3,
  showSolutions: true,
  isPaid: false,
  price: 50,
};

/** Create / edit exam details. Subject list follows the chosen level + stream. */
export function ExamMetaForm({ defaults = BLANK }: { defaults?: ExamMetaDefaults }) {
  const editing = Boolean(defaults.id);
  const [state, action] = useFormState(editing ? updateExamAction : createExamAction, {});
  const [level, setLevel] = useState<Level>(defaults.level);
  const [stream, setStream] = useState<StreamId>(defaults.stream);
  const [isPaidState, setIsPaidState] = useState<boolean>(Boolean(defaults.isPaid));
  const subjects = getSubjects(level, stream);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {editing && <input type="hidden" name="id" value={defaults.id} />}
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="titleBn" lang="bn">
          শিরোনাম (বাংলা)
        </label>
        <input id="titleBn" name="titleBn" defaultValue={defaults.titleBn} required className="field" lang="bn" placeholder="যেমন: রসায়ন মডেল টেস্ট ১" />
        <Err state={state} name="titleBn" />
      </div>
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="titleEn" lang="bn">
          শিরোনাম (ইংরেজি, ঐচ্ছিক)
        </label>
        <input id="titleEn" name="titleEn" defaultValue={defaults.titleEn} className="field" placeholder="Chemistry Model Test 1" />
      </div>
      <div>
        <label className="field-label" htmlFor="level" lang="bn">
          স্তর
        </label>
        <select id="level" name="level" value={level} onChange={(e) => setLevel(e.target.value as Level)} className="field" lang="bn">
          {(["ssc", "hsc"] as const).map((l) => (
            <option key={l} value={l}>
              {LEVELS[l].nameBn}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="field-label" htmlFor="stream" lang="bn">
          বিভাগ
        </label>
        <select id="stream" name="stream" value={stream} onChange={(e) => setStream(e.target.value as StreamId)} className="field" lang="bn">
          {STREAM_IDS.map((s) => (
            <option key={s} value={s}>
              {STREAMS[s].nameBn}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="field-label" htmlFor="subjectId" lang="bn">
          বিষয়
        </label>
        <select
          id="subjectId"
          name="subjectId"
          key={`${level}-${stream}`}
          defaultValue={subjects.some((s) => s.id === defaults.subjectId) ? defaults.subjectId : ""}
          className="field"
          lang="bn"
        >
          <option value="" disabled>
            বেছে নাও
          </option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nameBn}
            </option>
          ))}
        </select>
        <Err state={state} name="subjectId" />
      </div>
      <div>
        <label className="field-label" htmlFor="type" lang="bn">
          পরীক্ষার ধরন
        </label>
        <select id="type" name="type" defaultValue={defaults.type} className="field" lang="bn">
          {EXAM_TYPES.map((t) => (
            <option key={t} value={t}>
              {EXAM_TYPE_META[t].nameBn}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="field-label" htmlFor="minutes" lang="bn">
          সময় (মিনিট)
        </label>
        <input id="minutes" name="minutes" type="number" min={1} max={300} defaultValue={defaults.minutes} className="field" />
        <Err state={state} name="minutes" />
      </div>
      <div>
        <label className="field-label" htmlFor="negativeMark" lang="bn">
          প্রতি ভুলে নম্বর কাটা
        </label>
        <input id="negativeMark" name="negativeMark" type="number" step="0.05" min={0} max={1} defaultValue={defaults.negativeMark} className="field" />
        <Err state={state} name="negativeMark" />
      </div>
      <div>
        <label className="field-label" htmlFor="maxWarnings" lang="bn">
          সর্বোচ্চ সতর্কতা (তারপর অটো-সাবমিট)
        </label>
        <input id="maxWarnings" name="maxWarnings" type="number" min={1} max={10} defaultValue={defaults.maxWarnings} className="field" />
        <Err state={state} name="maxWarnings" />
      </div>
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="showSolutions" lang="bn">
          পরীক্ষার পর সঠিক উত্তর ও সমাধান দেখানো হবে কি না?
        </label>
        <select
          id="showSolutions"
          name="showSolutions"
          defaultValue={defaults.showSolutions !== false ? "true" : "false"}
          className="field"
          lang="bn"
        >
          <option value="true">✅ হ্যাঁ — পরীক্ষার পর সঠিক উত্তর ও ব্যাখ্যা দেখতে পারবে</option>
          <option value="false">🔒 না — উত্তর গোপন থাকবে (শিক্ষার্থী শুধু স্কোর ও র‍্যাংক দেখবে)</option>
        </select>
        <p className="mt-1 text-xs text-ink-subtle" lang="bn">
          লাইভ বা প্রতিযোগিতামূলক পরীক্ষার সময় উত্তর বন্ধ রাখতে পারো। পরবর্তীতে চাইলে প্রকাশ করা যাবে।
        </p>
      </div>

      <div className="sm:col-span-2 rounded-2xl border border-surface-border bg-obsidian-950/60 p-4 space-y-3">
        <label className="field-label text-sm font-semibold" htmlFor="isPaid" lang="bn">
          পরীক্ষার অ্যাক্সেস ও ফি (Free নাকি Paid?)
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <select
              id="isPaid"
              name="isPaid"
              value={isPaidState ? "true" : "false"}
              onChange={(e) => setIsPaidState(e.target.value === "true")}
              className="field"
              lang="bn"
            >
              <option value="false">🟢 ফ্রি পরীক্ষা (Free Exam — যেকেউ অংশ নিতে পারবে)</option>
              <option value="true">💳 পেইড পরীক্ষা (Paid Live Exam — ফি প্রদান সাপেক্ষে)</option>
            </select>
          </div>
          {isPaidState && (
            <div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-amber-400">
                  ৳
                </span>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min={1}
                  max={5000}
                  defaultValue={defaults.price || 50}
                  placeholder="পরীক্ষার ফি (টাকা)"
                  className="field pl-8"
                  required={isPaidState}
                />
              </div>
              <p className="mt-1 text-[11px] text-ink-subtle" lang="bn">
                শিক্ষার্থীদের এই ফি প্রদান করে লাইভ পরীক্ষায় অংশ নিতে হবে।
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 sm:col-span-2">
        <Submit label={editing ? "পরিবর্তন সংরক্ষণ করো" : "পরীক্ষা তৈরি করো"} />
        <Saved state={state} />
      </div>
    </form>
  );
}

/** Add one MCQ. Clears itself after a successful save. */
export function QuestionForm({ examId }: { examId: string }) {
  const [state, action] = useFormState(addQuestionAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <input type="hidden" name="examId" value={examId} />
      <div>
        <label className="field-label" htmlFor="text" lang="bn">
          প্রশ্ন
        </label>
        <textarea id="text" name="text" rows={3} required className="field" lang="bn" />
        <Err state={state} name="text" />
      </div>
      <fieldset>
        <legend className="field-label" lang="bn">
          অপশন ও সঠিক উত্তর
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["a", "b", "c", "d"] as const).map((k) => (
            <div key={k}>
              <div className="flex items-center gap-2">
                <label className="flex shrink-0 cursor-pointer items-center" title="সঠিক উত্তর">
                  <input type="radio" name="correct" value={k} required className="peer sr-only" />
                  <span
                    lang="bn"
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border border-surface-border font-bold text-ink-muted transition-colors",
                      "peer-checked:border-brand-400 peer-checked:bg-brand-400 peer-checked:text-forest peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400/50",
                    )}
                  >
                    {OPTION_LABEL_BN[k]}
                  </span>
                </label>
                <input name={k} aria-label={`Option ${k.toUpperCase()}`} required className="field" lang="bn" />
              </div>
              <Err state={state} name={k} />
            </div>
          ))}
        </div>
        <p lang="bn" className="mt-2 text-xs text-ink-subtle">
          সঠিক উত্তরের অক্ষরে (ক/খ/গ/ঘ) ক্লিক করো।
        </p>
        <Err state={state} name="correct" />
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <div>
          <label className="field-label" htmlFor="topic" lang="bn">
            টপিক / অধ্যায়
          </label>
          <input id="topic" name="topic" className="field" lang="bn" placeholder="যেমন: গতি" />
        </div>
        <div>
          <label className="field-label" htmlFor="marks" lang="bn">
            নম্বর
          </label>
          <input id="marks" name="marks" type="number" min={0.5} max={10} step={0.5} defaultValue={1} className="field" />
          <Err state={state} name="marks" />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="explanation" lang="bn">
          ব্যাখ্যা / সমাধান
        </label>
        <textarea id="explanation" name="explanation" rows={3} className="field" lang="bn" />
      </div>
      <div className="flex items-center gap-4">
        <Submit label="প্রশ্ন যোগ করো" />
        <Saved state={state} />
      </div>
    </form>
  );
}
