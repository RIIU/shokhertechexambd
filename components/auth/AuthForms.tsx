"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginAction, registerAction, type AuthFormState } from "@/app/(auth)/actions";
import { LEVELS, STREAMS, STREAM_IDS } from "@/lib/data/catalog";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary mt-2 w-full py-3 text-base">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      <span lang="bn">{label}</span>
    </button>
  );
}

function FieldError({ state, name }: { state: AuthFormState; name: string }) {
  const msg = state.fieldErrors?.[name];
  return msg ? (
    <p lang="bn" className="field-error" id={`${name}-error`}>
      {msg}
    </p>
  ) : null;
}

function PasswordInput({
  name,
  autoComplete,
  invalid,
  value,
  onChange,
}: {
  name: string;
  autoComplete: string;
  invalid: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={name}
        name={name}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        required
        minLength={6}
        value={value}
        onChange={onChange}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${name}-error` : undefined}
        className="field pr-11"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-subtle hover:text-ink"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function FormError({ state }: { state: AuthFormState }) {
  return state.error ? (
    <p lang="bn" role="alert" className="rounded-xl bg-state-danger/10 p-3 text-sm text-rose-200 ring-1 ring-state-danger/30">
      {state.error}
    </p>
  ) : null;
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useFormState(loginAction, {});
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <FormError state={state} />

      <div>
        <label htmlFor="phone" className="field-label" lang="bn">
          মোবাইল নম্বর
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="01XXXXXXXXX"
          required
          aria-invalid={Boolean(state.fieldErrors?.phone)}
          className="field"
        />
        <FieldError state={state} name="phone" />
      </div>
      <div>
        <label htmlFor="password" className="field-label" lang="bn">
          পাসওয়ার্ড
        </label>
        <PasswordInput
          name="password"
          autoComplete="current-password"
          invalid={Boolean(state.fieldErrors?.password)}
        />
        <FieldError state={state} name="password" />
      </div>
      <SubmitButton label="লগইন করো" />
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action] = useFormState(registerAction, {});
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <FormError state={state} />
      <div>
        <label htmlFor="name" className="field-label" lang="bn">
          পুরো নাম
        </label>
        <input id="name" name="name" autoComplete="name" required maxLength={60} className="field" aria-invalid={Boolean(state.fieldErrors?.name)} />
        <FieldError state={state} name="name" />
      </div>
      <div>
        <label htmlFor="phone" className="field-label" lang="bn">
          মোবাইল নম্বর
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="01XXXXXXXXX"
          required
          className="field"
          aria-invalid={Boolean(state.fieldErrors?.phone)}
        />
        <FieldError state={state} name="phone" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="level" className="field-label" lang="bn">
            স্তর
          </label>
          <select id="level" name="level" required defaultValue="" className="field" lang="bn">
            <option value="" disabled>
              বেছে নাও
            </option>
            {(["ssc", "hsc"] as const).map((l) => (
              <option key={l} value={l}>
                {LEVELS[l].nameBn}
              </option>
            ))}
          </select>
          <FieldError state={state} name="level" />
        </div>
        <div>
          <label htmlFor="stream" className="field-label" lang="bn">
            বিভাগ
          </label>
          <select id="stream" name="stream" required defaultValue="" className="field" lang="bn">
            <option value="" disabled>
              বেছে নাও
            </option>
            {STREAM_IDS.map((s) => (
              <option key={s} value={s}>
                {STREAMS[s].nameBn}
              </option>
            ))}
          </select>
          <FieldError state={state} name="stream" />
        </div>
      </div>
      <div>
        <label htmlFor="institution" className="field-label" lang="bn">
          শিক্ষাপ্রতিষ্ঠান <span className="font-normal text-ink-subtle">(ঐচ্ছিক)</span>
        </label>
        <input id="institution" name="institution" maxLength={120} className="field" />
      </div>
      <div>
        <label htmlFor="password" className="field-label" lang="bn">
          পাসওয়ার্ড
        </label>
        <PasswordInput name="password" autoComplete="new-password" invalid={Boolean(state.fieldErrors?.password)} />
        <FieldError state={state} name="password" />
      </div>
      <div>
        <label htmlFor="confirm" className="field-label" lang="bn">
          আবার পাসওয়ার্ড
        </label>
        <PasswordInput name="confirm" autoComplete="new-password" invalid={Boolean(state.fieldErrors?.confirm)} />
        <FieldError state={state} name="confirm" />
      </div>
      <SubmitButton label="অ্যাকাউন্ট খোলো" />
    </form>
  );
}
