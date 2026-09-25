import "server-only";
import type { Field } from "./schema";

/**
 * Turns the JSON sent by an admin form into a clean document, following the
 * field definitions in schema.ts. Unknown keys are dropped; values are
 * type-checked; required fields are enforced. Upload placeholders
 * ({ upload: "key" }) are swapped for saved files via `resolveUpload`.
 */

export type Errors = Record<string, string>;
type Uploads = {
  image: (key: string) => Promise<{ url: string; width: number; height: number }>;
  file: (key: string) => Promise<{ url: string; name: string }>;
};

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");

function visible(f: Field, siblings: Record<string, unknown>) {
  if (!f.showIf) return true;
  const v = siblings[f.showIf.field];
  if ("equals" in f.showIf) return v === f.showIf.equals;
  if ("notEquals" in f.showIf) return v !== f.showIf.notEquals;
  return true;
}

async function image(v: unknown, path: string, errors: Errors, uploads: Uploads) {
  if (!isObj(v)) return undefined;
  const alt = str(v.alt).slice(0, 300);
  const caption = str(v.caption).slice(0, 300) || undefined;
  if (typeof v.upload === "string") {
    try {
      const saved = await uploads.image(v.upload);
      return { ...saved, alt, ...(caption ? { caption } : {}) };
    } catch (e) {
      errors[path] = (e as Error).message;
      return undefined;
    }
  }
  if (typeof v.url === "string" && /^\/(media|content|images)\//.test(v.url)) {
    return {
      url: v.url,
      width: Number(v.width) || 1200,
      height: Number(v.height) || 800,
      alt,
      ...(caption ? { caption } : {}),
    };
  }
  return undefined;
}

export async function coerce(
  fields: Field[],
  raw: Record<string, unknown>,
  uploads: Uploads,
  errors: Errors = {},
  prefix = "",
): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const path = prefix + f.name;
    const v = raw[f.name];
    const shown = visible(f, raw);
    let value: unknown;

    switch (f.kind) {
      case "text":
      case "textarea":
      case "markdown":
      case "email":
      case "url":
      case "slug": {
        let s = str(v);
        if (f.kind === "slug") s = s.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
        if ("max" in f && f.max && s.length > f.max) errors[path] = `Keep this under ${f.max} characters (now ${s.length}).`;
        if (s && f.kind === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) errors[path] = "Enter a valid email address.";
        if (s && f.kind === "url" && !/^https?:\/\/[^\s]+$/i.test(s)) errors[path] = "Enter a full link starting with https://";
        value = s || undefined;
        break;
      }
      case "number": {
        const num = v === "" || v === null || v === undefined ? NaN : Number(v);
        if (!Number.isNaN(num)) {
          if (f.min !== undefined && num < f.min) errors[path] = `Must be at least ${f.min}.`;
          if (f.max !== undefined && num > f.max) errors[path] = `Must be at most ${f.max}.`;
          value = num;
        }
        break;
      }
      case "date": {
        const s = str(v);
        if (s && !/^\d{4}-\d{2}-\d{2}$/.test(s)) errors[path] = "Enter a valid date.";
        value = s || undefined;
        break;
      }
      case "datetime": {
        const s = str(v);
        if (s) {
          const d = new Date(s);
          if (Number.isNaN(d.getTime())) errors[path] = "Enter a valid date and time.";
          else value = d.toISOString();
        }
        break;
      }
      case "checkbox":
        value = v === true || v === "true" || v === "on";
        break;
      case "select": {
        const s = str(v);
        value = f.options.some((o) => o.value === s) ? s : undefined;
        break;
      }
      case "image":
        value = await image(v, path, errors, uploads);
        break;
      case "images": {
        const items = Array.isArray(v) ? v : [];
        const res = [];
        for (let i = 0; i < items.length; i++) {
          const im = await image(items[i], `${path}.${i}`, errors, uploads);
          if (im) res.push(im);
        }
        value = res;
        break;
      }
      case "file": {
        if (isObj(v) && typeof v.upload === "string") {
          try {
            value = await uploads.file(v.upload);
          } catch (e) {
            errors[path] = (e as Error).message;
          }
        } else if (isObj(v) && typeof v.url === "string" && v.url.startsWith("/media/")) {
          value = { url: v.url, name: str(v.name) || "file" };
        }
        break;
      }
      case "strings":
        value = (Array.isArray(v) ? v : []).map(str).filter(Boolean);
        break;
      case "ref":
        value = str(v) || undefined;
        break;
      case "refs":
        value = (Array.isArray(v) ? v : []).map(str).filter(Boolean);
        break;
      case "list": {
        const items = Array.isArray(v) ? v : [];
        const res = [];
        for (let i = 0; i < items.length; i++) {
          if (!isObj(items[i])) continue;
          res.push(await coerce(f.fields, items[i] as Record<string, unknown>, uploads, errors, `${path}.${i}.`));
        }
        value = res;
        break;
      }
      case "group":
        value = await coerce(f.fields, isObj(v) ? v : {}, uploads, errors, `${path}.`);
        break;
    }

    const empty =
      value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
    if (f.required && shown && empty && !errors[path]) errors[path] = "This field is required.";
    if (!shown) continue;
    if (value !== undefined) out[f.name] = value;
  }
  return out;
}
