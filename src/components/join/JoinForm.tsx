"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { validateJoin, type JoinErrors } from "@/lib/join";
import { departments, yearsOfStudy } from "@/lib/options";

type Status = "idle" | "sending" | "done" | "error";

const inputCls =
  "mt-1.5 block w-full rounded-md border bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-muted/70 focus:border-ieee-blue focus:outline-none focus:ring-2 focus:ring-ieee-blue/20";

export function JoinForm() {
  const [errors, setErrors] = useState<JoinErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const id = useId();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    const { data, errors } = validateJoin(values);
    setErrors(errors);
    if (!data) {
      // Move focus to the first invalid field
      const first = Object.keys(errors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("done");
        formRef.current?.reset();
      } else {
        if (json.errors) setErrors(json.errors);
        setMessage(json.error ?? "Please check the highlighted fields.");
        setStatus("error");
      }
    } catch {
      setMessage("Network error — please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div role="status" className="rounded-lg border border-rmkec-green/30 bg-rmkec-green-light p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-rmkec-green" aria-hidden="true" />
        <h3 className="mt-4 text-2xl font-bold">Application received</h3>
        <p className="mx-auto mt-2 max-w-md">
          Thank you! A member of the Execom will contact you soon with next steps for IEEE membership.
        </p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-6 text-sm font-semibold text-ieee-blue hover:underline">
          Submit another application
        </button>
      </div>
    );
  }

  const field = (name: keyof JoinErrors, label: string, control: ReactNode, hint?: string) => (
    <div>
      <label htmlFor={`${id}-${name}`} className="text-sm font-semibold text-ink">
        {label} <span className="text-cat-award" aria-hidden="true">*</span>
      </label>
      {control}
      {hint && !errors[name] && (
        <p id={`${id}-${name}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {errors[name] && (
        <p id={`${id}-${name}-err`} className="mt-1 text-sm font-medium text-red-700">
          {errors[name]}
        </p>
      )}
    </div>
  );
  const a11y = (name: keyof JoinErrors, hint = false) => ({
    id: `${id}-${name}`,
    name,
    required: true,
    "aria-invalid": Boolean(errors[name]) || undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-err` : hint ? `${id}-${name}-hint` : undefined,
    className: `${inputCls} ${errors[name] ? "border-red-600" : "border-line"}`,
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">{field("name", "Full name", <input type="text" autoComplete="name" {...a11y("name")} />)}</div>
      {field(
        "department",
        "Department",
        <select defaultValue="" {...a11y("department")}>
          <option value="" disabled>
            Select department
          </option>
          {departments.map((d) => (
            <option key={d.value} value={d.value}>
              {d.title}
            </option>
          ))}
        </select>,
      )}
      {field(
        "year",
        "Year of study",
        <select defaultValue="" {...a11y("year")}>
          <option value="" disabled>
            Select year
          </option>
          {yearsOfStudy
            .filter((y) => y.value !== "faculty")
            .map((y) => (
              <option key={y.value} value={y.value}>
                {y.title}
              </option>
            ))}
        </select>,
      )}
      {field("email", "Email", <input type="email" autoComplete="email" inputMode="email" {...a11y("email", true)} />, "Your college or personal email.")}
      {field("phone", "Mobile number", <input type="tel" autoComplete="tel" inputMode="tel" placeholder="98765 43210" {...a11y("phone")} />)}
      <div className="sm:col-span-2">
        {field(
          "reason",
          "Why do you want to join?",
          <textarea rows={5} {...a11y("reason", true)} />,
          "Interests, societies you’d like to join, or what you hope to learn.",
        )}
      </div>

      {/* Honeypot: hidden from people, visible to naive bots */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-ieee-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-ieee-blue-dark disabled:opacity-70"
        >
          {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {status === "sending" ? "Sending…" : "Submit application"}
        </button>
        <p className="text-xs text-muted">Your details are only used by the branch Execom to contact you about membership.</p>
      </div>
      {status === "error" && (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-800 sm:col-span-2">
          {message}
        </p>
      )}
    </form>
  );
}
