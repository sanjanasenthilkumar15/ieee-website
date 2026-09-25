"use client";

import { ArrowDown, ArrowUp, Eye, FileText, ImagePlus, Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { RichText } from "@/components/ui/RichText";
import type { SaveResult } from "../actions";
import { contentTypeMap, slugify, type Field } from "../schema";

type Values = Record<string, unknown>;
type RefOptions = Record<string, { id: string; label: string }[]>;
type Ctx = {
  errors: Record<string, string>;
  refs: RefOptions;
  addFile: (f: File) => string;
  previews: Record<string, string>;
};

// ---------- helpers ----------

const IST_MS = 5.5 * 3600 * 1000;
const isoToIstInput = (iso?: unknown) =>
  typeof iso === "string" && iso ? new Date(new Date(iso).getTime() + IST_MS).toISOString().slice(0, 16) : "";
const istInputToIso = (v: string) => (v ? new Date(`${v}:00+05:30`).toISOString() : "");

const inputCls =
  "block w-full rounded-md border border-line bg-white px-3 py-2 text-[15px] text-ink placeholder:text-muted/70 focus:border-ieee-blue focus:ring-2 focus:ring-ieee-blue/20 focus:outline-none";

function visible(f: Field, v: Values) {
  if (!f.showIf) return true;
  const x = v[f.showIf.field];
  if ("equals" in f.showIf) return x === f.showIf.equals;
  if ("notEquals" in f.showIf) return x !== f.showIf.notEquals;
  return true;
}

// ---------- main form ----------

export function DocForm({
  type,
  id,
  initial,
  refs,
  action,
  publicUrl,
}: {
  type: string;
  id: string | null;
  initial: Values;
  refs: RefOptions;
  action: (type: string, id: string | null, form: FormData) => Promise<SaveResult>;
  publicUrl?: string;
}) {
  const ct = contentTypeMap[type];
  const router = useRouter();
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const files = useRef(new Map<string, File>());
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [section, setSection] = useState(0);

  const addFile = (f: File) => {
    const key = crypto.randomUUID();
    files.current.set(key, f);
    if (f.type.startsWith("image/")) setPreviews((p) => ({ ...p, [key]: URL.createObjectURL(f) }));
    return key;
  };

  const set = (name: string, v: unknown) => {
    setValues((prev) => {
      const next = { ...prev, [name]: v };
      // Auto-fill the slug from the title for new items until it's edited by hand
      const slugField = ct.sections.flatMap((s) => s.fields).find((f) => f.kind === "slug");
      if (slugField && slugField.kind === "slug" && slugField.slugFrom === name && !id && !prev.__slugTouched) {
        next[slugField.name] = slugify(String(v ?? ""));
      }
      if (slugField && name === slugField.name) next.__slugTouched = true;
      return next;
    });
    setDirty(true);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const fd = new FormData();
    // Only send uploads still referenced by the form
    const json = JSON.stringify(values, (k, v) => (k === "__slugTouched" ? undefined : v));
    fd.set("__json", json);
    for (const [key, file] of files.current) if (json.includes(`"upload":"${key}"`)) fd.set(`upload:${key}`, file);
    try {
      const res = await action(type, id, fd);
      if (res.ok) {
        setErrors({});
        setDirty(false);
        files.current.clear();
        setMessage({ kind: "ok", text: "Saved. Changes are live on the website." });
        if (!id && !ct.singletonId) router.replace(`/admin/content/${type}/${res.id}?saved=1`);
        else router.refresh();
      } else {
        setErrors(res.errors);
        setMessage({ kind: "error", text: res.message ?? "Please fix the highlighted fields." });
        const firstBad = ct.sections.findIndex((s) =>
          s.fields.some((f) => Object.keys(res.errors).some((k) => k === f.name || k.startsWith(`${f.name}.`))),
        );
        if (firstBad >= 0) setSection(firstBad);
      }
    } catch (err) {
      setMessage({ kind: "error", text: `Couldn’t save: ${(err as Error).message || "network error"}. Your changes are still here — try again.` });
    } finally {
      setSaving(false);
    }
  }

  const ctx: Ctx = { errors, refs, addFile, previews };
  const multi = ct.sections.length > 1;

  return (
    <form onSubmit={submit} noValidate className="pb-28">
      {multi && (
        <div role="tablist" className="mb-6 flex flex-wrap gap-1 border-b border-line">
          {ct.sections.map((s, i) => {
            const bad = s.fields.some((f) => Object.keys(errors).some((k) => k === f.name || k.startsWith(`${f.name}.`)));
            return (
              <button
                key={s.title}
                type="button"
                role="tab"
                aria-selected={section === i}
                onClick={() => setSection(i)}
                className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold ${
                  section === i ? "border-ieee-blue text-ieee-blue" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {s.title}
                {bad && <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-red-600" aria-label="has errors" />}
              </button>
            );
          })}
        </div>
      )}

      {ct.sections.map((s, i) => (
        <div key={s.title} hidden={multi && section !== i} className="rounded-lg border border-line bg-white p-5 sm:p-7">
          <FieldGrid fields={s.fields} values={values} onChange={set} ctx={ctx} prefix="" />
        </div>
      ))}

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-ieee-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-ieee-blue-dark disabled:opacity-70"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {saving ? "Saving…" : id || ct.singletonId ? "Save changes" : `Create ${ct.singular.toLowerCase()}`}
          </button>
          {publicUrl && (
            <a href={publicUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ieee-blue hover:underline">
              <Eye className="h-4 w-4" aria-hidden="true" /> View on site
            </a>
          )}
          <span role="status" aria-live="polite" className="text-sm">
            {message ? (
              <span className={message.kind === "ok" ? "text-rmkec-green" : "font-medium text-red-700"}>{message.text}</span>
            ) : dirty ? (
              <span className="text-muted">Unsaved changes</span>
            ) : null}
          </span>
        </div>
      </div>
    </form>
  );
}

// ---------- field rendering ----------

function FieldGrid({
  fields,
  values,
  onChange,
  ctx,
  prefix,
}: {
  fields: Field[];
  values: Values;
  onChange: (name: string, v: unknown) => void;
  ctx: Ctx;
  prefix: string;
}) {
  return (
    <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
      {fields.map((f) =>
        visible(f, values) ? (
          <div key={f.name} className={f.half ? "" : "sm:col-span-2"}>
            <FieldInput field={f} value={values[f.name]} onChange={(v) => onChange(f.name, v)} ctx={ctx} path={prefix + f.name} />
          </div>
        ) : null,
      )}
    </div>
  );
}

function Label({ field, htmlFor, children }: { field: Field; htmlFor?: string; children?: ReactNode }) {
  return (
    <div className="mb-1.5 flex items-end justify-between gap-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
        {field.label}
        {field.required && <span className="text-red-700"> *</span>}
      </label>
      {children}
    </div>
  );
}

function Help({ field, error }: { field: Field; error?: string }) {
  if (error) return <p className="mt-1 text-sm font-medium text-red-700">{error}</p>;
  if (field.help) return <p className="mt-1 text-xs text-muted">{field.help}</p>;
  return null;
}

function FieldInput({
  field: f,
  value,
  onChange,
  ctx,
  path,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  ctx: Ctx;
  path: string;
}) {
  const err = ctx.errors[path];
  const id = `f-${path.replace(/\./g, "-")}`;
  const bad = err ? "border-red-600" : "";
  const str = typeof value === "string" || typeof value === "number" ? String(value) : "";

  switch (f.kind) {
    case "text":
    case "email":
    case "url":
    case "slug":
      return (
        <div>
          <Label field={f} htmlFor={id}>
            {"max" in f && f.max ? <span className="text-xs text-muted">{str.length}/{f.max}</span> : null}
          </Label>
          <div className={f.kind === "slug" ? "flex items-center rounded-md border border-line bg-surface" : ""}>
            {f.kind === "slug" && <span className="pl-3 text-sm text-muted">/</span>}
            <input
              id={id}
              type={f.kind === "email" ? "email" : f.kind === "url" ? "url" : "text"}
              value={str}
              placeholder={"placeholder" in f ? f.placeholder : f.kind === "url" ? "https://" : undefined}
              onChange={(e) => onChange(e.target.value)}
              aria-invalid={!!err}
              className={`${inputCls} ${bad} ${f.kind === "slug" ? "border-0 bg-transparent font-mono text-sm focus:ring-0" : ""}`}
            />
          </div>
          <Help field={f} error={err} />
        </div>
      );

    case "textarea":
      return (
        <div>
          <Label field={f} htmlFor={id}>
            {f.max ? <span className={`text-xs ${str.length > f.max ? "text-red-700" : "text-muted"}`}>{str.length}/{f.max}</span> : null}
          </Label>
          <textarea id={id} rows={f.rows ?? 3} value={str} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} className={`${inputCls} ${bad}`} />
          <Help field={f} error={err} />
        </div>
      );

    case "markdown":
      return <MarkdownInput f={f} id={id} value={str} onChange={onChange} err={err} />;

    case "number":
      return (
        <div>
          <Label field={f} htmlFor={id} />
          <input
            id={id}
            type="number"
            inputMode="numeric"
            value={str}
            min={f.min}
            max={f.max}
            onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
            className={`${inputCls} ${bad}`}
          />
          <Help field={f} error={err} />
        </div>
      );

    case "date":
      return (
        <div>
          <Label field={f} htmlFor={id} />
          <input id={id} type="date" value={str} onChange={(e) => onChange(e.target.value)} className={`${inputCls} ${bad}`} />
          <Help field={f} error={err} />
        </div>
      );

    case "datetime":
      return (
        <div>
          <Label field={f} htmlFor={id} />
          <input
            id={id}
            type="datetime-local"
            value={isoToIstInput(value)}
            onChange={(e) => onChange(istInputToIso(e.target.value))}
            className={`${inputCls} ${bad}`}
          />
          <Help field={f} error={err} />
        </div>
      );

    case "checkbox":
      return (
        <div>
          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-surface px-3 py-2.5">
            <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 accent-ieee-blue" />
            <span>
              <span className="text-sm font-semibold text-ink">{f.label}</span>
              {f.help && <span className="block text-xs text-muted">{f.help}</span>}
            </span>
          </label>
        </div>
      );

    case "select":
      if (f.radio)
        return (
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold text-ink">
              {f.label}
              {f.required && <span className="text-red-700"> *</span>}
            </legend>
            <div className="flex flex-wrap gap-2">
              {f.options.map((o) => (
                <label
                  key={o.value}
                  className={`cursor-pointer rounded-md border px-3 py-2 text-sm font-medium ${
                    value === o.value ? "border-ieee-blue bg-ieee-blue-light text-ieee-blue-dark" : "border-line bg-white text-body hover:border-ieee-blue/50"
                  }`}
                >
                  <input type="radio" name={id} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only" />
                  {o.title}
                </label>
              ))}
            </div>
            <Help field={f} error={err} />
          </fieldset>
        );
      return (
        <div>
          <Label field={f} htmlFor={id} />
          <select id={id} value={str} onChange={(e) => onChange(e.target.value || undefined)} className={`${inputCls} ${bad}`}>
            <option value="">— Select —</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.title}
              </option>
            ))}
          </select>
          <Help field={f} error={err} />
        </div>
      );

    case "image":
      return <ImageInput f={f} value={value} onChange={onChange} ctx={ctx} err={err} />;

    case "images":
      return <ImagesInput f={f} value={value} onChange={onChange} ctx={ctx} err={err} path={path} />;

    case "file":
      return <FileInput f={f} value={value} onChange={onChange} ctx={ctx} err={err} />;

    case "strings": {
      const items = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div>
          <Label field={f} />
          <ul className="space-y-2">
            {items.map((it, i) => (
              <li key={i} className="flex gap-2">
                <input
                  value={it}
                  aria-label={`${f.itemLabel ?? "item"} ${i + 1}`}
                  onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
                  className={inputCls}
                />
                <RowButtons index={i} count={items.length} onMove={(to) => onChange(move(items, i, to))} onRemove={() => onChange(items.filter((_, j) => j !== i))} />
              </li>
            ))}
          </ul>
          <AddButton label={`Add ${f.itemLabel ?? "item"}`} onClick={() => onChange([...items, ""])} />
          <Help field={f} error={err} />
        </div>
      );
    }

    case "ref": {
      const opts = ctx.refs[f.refType] ?? [];
      return (
        <div>
          <Label field={f} htmlFor={id} />
          <select id={id} value={str} onChange={(e) => onChange(e.target.value || undefined)} className={`${inputCls} ${bad}`}>
            <option value="">— None —</option>
            {opts.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <Help field={f} error={err} />
        </div>
      );
    }

    case "refs":
      return <RefsInput f={f} value={value} onChange={onChange} ctx={ctx} err={err} />;

    case "list": {
      const items = Array.isArray(value) ? (value as Values[]) : [];
      return (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink">{f.label}</legend>
          {items.length === 0 && <p className="mb-2 text-sm text-muted">None yet.</p>}
          <ol className="space-y-3">
            {items.map((item, i) => (
              <li key={i} className="rounded-lg border border-line bg-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-muted uppercase">
                    {f.itemLabel} {i + 1}
                  </span>
                  <RowButtons index={i} count={items.length} onMove={(to) => onChange(move(items, i, to))} onRemove={() => onChange(items.filter((_, j) => j !== i))} />
                </div>
                <FieldGrid
                  fields={f.fields}
                  values={item}
                  onChange={(name, v) => onChange(items.map((x, j) => (j === i ? { ...x, [name]: v } : x)))}
                  ctx={ctx}
                  prefix={`${path}.${i}.`}
                />
              </li>
            ))}
          </ol>
          <AddButton label={`Add ${f.itemLabel}`} onClick={() => onChange([...items, {}])} />
          <Help field={f} error={err} />
        </fieldset>
      );
    }

    case "group": {
      const obj = value && typeof value === "object" ? (value as Values) : {};
      return (
        <fieldset className="rounded-lg border border-line p-4">
          <legend className="px-1 text-sm font-semibold text-ink">{f.label}</legend>
          {f.help && <p className="mb-3 text-xs text-muted">{f.help}</p>}
          <FieldGrid fields={f.fields} values={obj} onChange={(name, v) => onChange({ ...obj, [name]: v })} ctx={ctx} prefix={`${path}.`} />
        </fieldset>
      );
    }
  }
}

// ---------- widgets ----------

function move<T>(arr: T[], from: number, to: number) {
  const copy = [...arr];
  const [x] = copy.splice(from, 1);
  copy.splice(to, 0, x);
  return copy;
}

function RowButtons({ index, count, onMove, onRemove }: { index: number; count: number; onMove: (to: number) => void; onRemove: () => void }) {
  const btn = "rounded p-1.5 text-muted hover:bg-white hover:text-ink disabled:opacity-30";
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button type="button" className={btn} disabled={index === 0} onClick={() => onMove(index - 1)} aria-label="Move up">
        <ArrowUp className="h-4 w-4" />
      </button>
      <button type="button" className={btn} disabled={index === count - 1} onClick={() => onMove(index + 1)} aria-label="Move down">
        <ArrowDown className="h-4 w-4" />
      </button>
      <button type="button" className="rounded p-1.5 text-muted hover:bg-red-50 hover:text-red-700" onClick={onRemove} aria-label="Remove">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-dashed border-ieee-blue/40 px-3 py-2 text-sm font-semibold text-ieee-blue hover:bg-ieee-blue-light"
    >
      <Plus className="h-4 w-4" aria-hidden="true" /> {label}
    </button>
  );
}

function MarkdownInput({ f, id, value, onChange, err }: { f: Field; id: string; value: string; onChange: (v: unknown) => void; err?: string }) {
  const [preview, setPreview] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const wrap = (before: string, after = before) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const sel = value.slice(a, b) || "text";
    onChange(value.slice(0, a) + before + sel + after + value.slice(b));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + before.length, a + before.length + sel.length);
    });
  };
  const line = (prefixStr: string) => {
    const el = ref.current;
    if (!el) return;
    const a = value.lastIndexOf("\n", el.selectionStart - 1) + 1;
    onChange(value.slice(0, a) + prefixStr + value.slice(a));
    requestAnimationFrame(() => el.focus());
  };
  const tool = "rounded px-2 py-1 text-sm font-semibold text-body hover:bg-white";
  return (
    <div>
      <Label field={f} htmlFor={id}>
        <button type="button" onClick={() => setPreview((p) => !p)} className="inline-flex items-center gap-1 text-xs font-semibold text-ieee-blue">
          {preview ? <Pencil className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {preview ? "Edit" : "Preview"}
        </button>
      </Label>
      {preview ? (
        <div className="min-h-32 rounded-md border border-line bg-white px-4 py-2">
          {value.trim() ? <RichText value={value} /> : <p className="py-3 text-sm text-muted">Nothing to preview yet.</p>}
        </div>
      ) : (
        <div className={`rounded-md border ${err ? "border-red-600" : "border-line"} bg-surface`}>
          <div className="flex flex-wrap gap-0.5 border-b border-line px-1.5 py-1" aria-label="Formatting">
            <button type="button" className={tool} onClick={() => wrap("**")} title="Bold">B</button>
            <button type="button" className={`${tool} italic`} onClick={() => wrap("_")} title="Italic">I</button>
            <button type="button" className={tool} onClick={() => line("## ")} title="Heading">H</button>
            <button type="button" className={tool} onClick={() => line("- ")} title="Bullet list">• List</button>
            <button type="button" className={tool} onClick={() => line("1. ")} title="Numbered list">1. List</button>
            <button type="button" className={tool} onClick={() => wrap("[", "](https://)")} title="Link">Link</button>
            <button type="button" className={tool} onClick={() => line("> ")} title="Quote">Quote</button>
          </div>
          <textarea
            ref={ref}
            id={id}
            rows={"rows" in f && f.rows ? f.rows : 8}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="block w-full resize-y rounded-b-md border-0 bg-white px-3 py-2 font-mono text-[14px] leading-relaxed text-ink focus:ring-2 focus:ring-ieee-blue/20 focus:outline-none"
          />
        </div>
      )}
      {err ? (
        <p className="mt-1 text-sm font-medium text-red-700">{err}</p>
      ) : (
        <p className="mt-1 text-xs text-muted">
          Formatting: **bold**, _italic_, ## Heading, - list item, [link text](https://…). Leave a blank line between paragraphs.
        </p>
      )}
    </div>
  );
}

type ImgVal = { url?: string; upload?: string; alt?: string; caption?: string; width?: number; height?: number };

function imgSrc(v: ImgVal, ctx: Ctx) {
  return v.upload ? ctx.previews[v.upload] : v.url;
}

function ImageInput({ f, value, onChange, ctx, err }: { f: Field; value: unknown; onChange: (v: unknown) => void; ctx: Ctx; err?: string }) {
  const v = (value && typeof value === "object" ? value : null) as ImgVal | null;
  const input = useRef<HTMLInputElement>(null);
  const pick = (file?: File) => {
    if (!file) return;
    onChange({ upload: ctx.addFile(file), alt: v?.alt ?? "" });
  };
  return (
    <div>
      <Label field={f} />
      <div className={`flex flex-col gap-4 rounded-md border ${err ? "border-red-600" : "border-line"} bg-surface p-3 sm:flex-row sm:items-start`}>
        <div className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded bg-white sm:w-44">
          {v && imgSrc(v, ctx) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgSrc(v, ctx)} alt="" className="max-h-full max-w-full object-contain" />
          ) : (
            <ImagePlus className="h-8 w-8 text-muted/60" aria-hidden="true" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => input.current?.click()} className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-1.5 text-sm font-semibold text-ink hover:border-ieee-blue">
              <Upload className="h-4 w-4" aria-hidden="true" /> {v ? "Replace image" : "Choose image"}
            </button>
            {v && (
              <button type="button" onClick={() => onChange(undefined)} className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50">
                <X className="h-4 w-4" aria-hidden="true" /> Remove
              </button>
            )}
          </div>
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" tabIndex={-1} onChange={(e) => pick(e.target.files?.[0])} />
          {v && (
            <label className="block">
              <span className="text-xs font-semibold text-muted">Image description (for screen readers)</span>
              <input value={v.alt ?? ""} onChange={(e) => onChange({ ...v, alt: e.target.value })} className={`${inputCls} mt-1 text-sm`} placeholder="e.g. Prof. John Dudley speaking at Webinar #5" />
            </label>
          )}
          {v?.upload && <p className="text-xs text-rmkec-green">New image — it will upload when you save.</p>}
        </div>
      </div>
      <Help field={f} error={err} />
    </div>
  );
}

function ImagesInput({ f, value, onChange, ctx, err, path }: { f: Field; value: unknown; onChange: (v: unknown) => void; ctx: Ctx; err?: string; path: string }) {
  const items = Array.isArray(value) ? (value as ImgVal[]) : [];
  const input = useRef<HTMLInputElement>(null);
  const addMany = (list: FileList | null) => {
    if (!list?.length) return;
    onChange([...items, ...Array.from(list).map((file) => ({ upload: ctx.addFile(file), alt: "" }))]);
  };
  return (
    <div>
      <Label field={f}>
        <span className="text-xs text-muted">{items.length} photo{items.length === 1 ? "" : "s"}</span>
      </Label>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <li key={i} className={`rounded-md border ${ctx.errors[`${path}.${i}`] ? "border-red-600" : "border-line"} bg-surface p-2`}>
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {imgSrc(it, ctx) && <img src={imgSrc(it, ctx)} alt="" className="h-full w-full object-cover" />}
              {it.upload && <span className="absolute top-1 left-1 rounded bg-rmkec-green px-1.5 py-0.5 text-[11px] font-bold text-white">NEW</span>}
            </div>
            <input value={it.alt ?? ""} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} placeholder="Description" aria-label={`Photo ${i + 1} description`} className={`${inputCls} mt-2 py-1.5 text-sm`} />
            <input value={it.caption ?? ""} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))} placeholder="Caption (optional)" aria-label={`Photo ${i + 1} caption`} className={`${inputCls} mt-1.5 py-1.5 text-sm`} />
            <div className="mt-1 flex justify-end">
              <RowButtons index={i} count={items.length} onMove={(to) => onChange(move(items, i, to))} onRemove={() => onChange(items.filter((_, j) => j !== i))} />
            </div>
            {ctx.errors[`${path}.${i}`] && <p className="text-xs font-medium text-red-700">{ctx.errors[`${path}.${i}`]}</p>}
          </li>
        ))}
      </ul>
      <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" tabIndex={-1} onChange={(e) => addMany(e.target.files)} />
      <button type="button" onClick={() => input.current?.click()} className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-dashed border-ieee-blue/40 px-3 py-2 text-sm font-semibold text-ieee-blue hover:bg-ieee-blue-light">
        <ImagePlus className="h-4 w-4" aria-hidden="true" /> Add photos
      </button>
      <Help field={f} error={err} />
    </div>
  );
}

function FileInput({ f, value, onChange, ctx, err }: { f: Field; value: unknown; onChange: (v: unknown) => void; ctx: Ctx; err?: string }) {
  const v = (value && typeof value === "object" ? value : null) as { url?: string; name?: string; upload?: string } | null;
  const input = useRef<HTMLInputElement>(null);
  const [pendingName, setPendingName] = useState("");
  return (
    <div>
      <Label field={f} />
      <div className={`flex flex-wrap items-center gap-3 rounded-md border ${err ? "border-red-600" : "border-line"} bg-surface p-3`}>
        <FileText className="h-5 w-5 text-muted" aria-hidden="true" />
        {v ? (
          v.url ? (
            <a href={v.url} target="_blank" rel="noopener" className="text-sm font-semibold text-ieee-blue hover:underline">
              {v.name ?? "Current file"}
            </a>
          ) : (
            <span className="text-sm font-semibold text-rmkec-green">{pendingName} — uploads when you save</span>
          )
        ) : (
          <span className="text-sm text-muted">No file</span>
        )}
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={() => input.current?.click()} className="rounded-md border border-line bg-white px-3 py-1.5 text-sm font-semibold hover:border-ieee-blue">
            {v ? "Replace" : "Choose file"}
          </button>
          {v && (
            <button type="button" onClick={() => onChange(undefined)} className="rounded-md px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50">
              Remove
            </button>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept={"accept" in f ? f.accept : ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setPendingName(file.name);
            onChange({ upload: ctx.addFile(file) });
          }}
        />
      </div>
      <Help field={f} error={err} />
    </div>
  );
}

function RefsInput({ f, value, onChange, ctx, err }: { f: Field & { refType?: string }; value: unknown; onChange: (v: unknown) => void; ctx: Ctx; err?: string }) {
  const selected = new Set(Array.isArray(value) ? (value as string[]) : []);
  const [q, setQ] = useState("");
  const opts = useMemo(() => ctx.refs[f.refType ?? ""] ?? [], [ctx.refs, f.refType]);
  const shown = opts.filter((o) => selected.has(o.id) || o.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <Label field={f}>
        <span className="text-xs text-muted">{selected.size} selected</span>
      </Label>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className={`${inputCls} mb-2 py-1.5 text-sm`} aria-label={`Search ${f.label}`} />
      <div className="max-h-56 overflow-y-auto rounded-md border border-line bg-white p-1">
        {shown.map((o) => (
          <label key={o.id} className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 text-sm hover:bg-surface">
            <input
              type="checkbox"
              checked={selected.has(o.id)}
              onChange={(e) => {
                const next = new Set(selected);
                if (e.target.checked) next.add(o.id);
                else next.delete(o.id);
                onChange([...next]);
              }}
              className="h-4 w-4 accent-ieee-blue"
            />
            {o.label}
          </label>
        ))}
        {shown.length === 0 && <p className="px-2 py-1.5 text-sm text-muted">No matches.</p>}
      </div>
      <Help field={f} error={err} />
    </div>
  );
}
