"use client";

/** Row of toggle chips used to filter a list (single selection). */
export function FilterChips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string; count?: number; color?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
              active ? "border-ieee-blue bg-ieee-blue text-white" : "border-line bg-white text-body hover:border-rmkec-green hover:text-rmkec-green"
            }`}
          >
            {o.color && (
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: active ? "white" : o.color }} aria-hidden="true" />
            )}
            {o.label}
            {o.count !== undefined && <span className={active ? "text-white/75" : "text-muted"}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
