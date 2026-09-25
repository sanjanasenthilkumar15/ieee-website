import "server-only";
import { listDocRows } from "@/server/db";
import { allFields, contentTypeMap, type Field } from "./schema";

/** Options for reference pickers (e.g. co-hosting societies, linked event). */
export function refOptionsFor(type: string) {
  const needed = new Set<string>();
  const walk = (fields: Field[]) =>
    fields.forEach((f) => {
      if (f.kind === "ref" || f.kind === "refs") needed.add(f.refType);
      if (f.kind === "list" || f.kind === "group") walk(f.fields);
    });
  walk(allFields(contentTypeMap[type]));
  const out: Record<string, { id: string; label: string }[]> = {};
  for (const t of needed) {
    const ct = contentTypeMap[t];
    const rows = listDocRows(t).map((r) => ({ id: r.id, data: r.data }));
    if (ct?.sort) rows.sort((a, b) => ct.sort!(a.data, b.data));
    out[t] = rows.map((r) => {
      const row = ct.row(r.data);
      return { id: r.id, label: row.subtitle && t === "event" ? `${row.title} (${row.subtitle.split(" · ").find((x) => /\d{4}/.test(x)) ?? ""})` : row.title };
    });
  }
  return out;
}
