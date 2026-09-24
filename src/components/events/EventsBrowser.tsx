"use client";

import { useMemo, useState } from "react";
import { EventCard } from "@/components/cards/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { categoryMeta } from "@/lib/categories";
import type { EventItem } from "@/lib/content/types";

const TZ = "Asia/Kolkata";
const monthKey = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: TZ });

/** Upcoming / Past toggle + type filter; events grouped under month headings. */
export function EventsBrowser({ upcoming, past }: { upcoming: EventItem[]; past: EventItem[] }) {
  const [tab, setTab] = useState<"upcoming" | "past">(upcoming.length ? "upcoming" : "past");
  const [type, setType] = useState("all");

  const list = tab === "upcoming" ? upcoming : past;
  const types = useMemo(
    () => [...new Set([...upcoming, ...past].map((e) => e.eventType))].sort(),
    [upcoming, past],
  );
  const filtered = type === "all" ? list : list.filter((e) => e.eventType === type);

  const groups = useMemo(() => {
    const m = new Map<string, EventItem[]>();
    for (const e of filtered) {
      const k = monthKey(e.startDate);
      m.set(k, [...(m.get(k) ?? []), e]);
    }
    return [...m.entries()];
  }, [filtered]);

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Show events" className="inline-flex rounded-lg border border-line bg-surface p-1">
          {(
            [
              ["upcoming", `Upcoming (${upcoming.length})`],
              ["past", `Past (${past.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                tab === key ? "bg-ieee-blue text-white shadow-sm" : "text-body hover:text-ieee-blue"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          Type
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-md border border-line bg-white px-3 py-2 text-sm font-normal text-body focus:border-ieee-blue"
          >
            <option value="all">All types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {categoryMeta[t as keyof typeof categoryMeta]?.label ?? t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div role="tabpanel" aria-live="polite">
        {groups.length === 0 ? (
          <EmptyState title={tab === "upcoming" ? "No upcoming events right now" : "No past events to show"}>
            {tab === "upcoming" ? (
              <>
                New events are announced on our social channels.{" "}
                {past.length > 0 && (
                  <button onClick={() => setTab("past")} className="font-semibold text-ieee-blue underline">
                    Browse past events
                  </button>
                )}
              </>
            ) : type !== "all" ? (
              "Try a different type."
            ) : null}
          </EmptyState>
        ) : (
          groups.map(([month, items]) => (
            <section key={month} className="mb-10" aria-label={month}>
              <h2 className="mb-4 flex items-center gap-3 text-sm font-bold tracking-wider text-muted uppercase">
                {month}
                <span className="h-px flex-1 bg-line" aria-hidden="true" />
              </h2>
              <div className="flex flex-col gap-4">
                {items.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
