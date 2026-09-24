"use client";

import { useState } from "react";
import { PostCard } from "@/components/cards/PostCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Post } from "@/lib/content/types";
import { postTypes } from "@/lib/options";
import { FilterChips } from "./FilterChips";

export function BlogBrowser({ posts }: { posts: Post[] }) {
  const [type, setType] = useState("all");
  const present = postTypes.filter((t) => posts.some((p) => p.type === t.value));
  const shown = type === "all" ? posts : posts.filter((p) => p.type === type);
  return (
    <>
      <div className="mb-8">
        <FilterChips
          label="Filter by type"
          value={type}
          onChange={setType}
          options={[
            { value: "all", label: "All", count: posts.length },
            ...present.map((t) => ({
              value: t.value,
              label: t.title.replace(/ \(.*\)/, ""),
              count: posts.filter((p) => p.type === t.value).length,
            })),
          ]}
        />
      </div>
      {shown.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      ) : (
        <EmptyState title="No posts of this type yet" />
      )}
    </>
  );
}
