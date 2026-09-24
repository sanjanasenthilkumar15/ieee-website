"use client";

import { useState } from "react";
import { AchievementCard } from "@/components/cards/AchievementCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { categoryColor } from "@/lib/categories";
import type { Achievement } from "@/lib/content/types";
import { achievementCategories } from "@/lib/options";
import { FilterChips } from "./FilterChips";

export function AchievementsBrowser({ items }: { items: Achievement[] }) {
  const [cat, setCat] = useState("all");
  const present = achievementCategories.filter((c) => items.some((i) => i.category === c.value));
  const shown = cat === "all" ? items : items.filter((i) => i.category === cat);
  return (
    <>
      <div className="mb-8">
        <FilterChips
          label="Filter by category"
          value={cat}
          onChange={setCat}
          options={[
            { value: "all", label: "All", count: items.length },
            ...present.map((c) => ({
              value: c.value,
              label: c.title.replace(/ \(.*\)/, ""),
              count: items.filter((i) => i.category === c.value).length,
              color: categoryColor(c.value),
            })),
          ]}
        />
      </div>
      {shown.length ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((a) => (
            <AchievementCard key={a.id} item={a} />
          ))}
        </div>
      ) : (
        <EmptyState title="Nothing in this category yet" />
      )}
    </>
  );
}
