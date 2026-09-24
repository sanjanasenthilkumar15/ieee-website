import Image from "next/image";
import { Award, FileCheck2 } from "lucide-react";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { categoryColor } from "@/lib/categories";
import type { Achievement } from "@/lib/content/types";
import { formatDate, studyLine } from "@/lib/format";

export function AchievementCard({ item }: { item: Achievement }) {
  const study = studyLine(item.yearOfStudy, item.department);
  return (
    <article className="card-lift relative flex h-full overflow-hidden rounded-lg border border-line bg-white">
      <span className="w-1.5 shrink-0" style={{ background: categoryColor(item.category) }} aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <CategoryTag category={item.category} />
          <time className="shrink-0 text-xs text-muted" dateTime={item.date}>
            {formatDate(item.date, { month: "short" })}
          </time>
        </div>
        <h3 className="mt-2 text-lg leading-snug font-bold">{item.title}</h3>
        {item.projectTitle && <p className="mt-1 text-sm italic">“{item.projectTitle}”</p>}
        <div className="mt-auto pt-4">
          <p className="text-sm font-semibold text-ink">{item.memberName}</p>
          {study && <p className="text-sm text-muted">{study}</p>}
          {(item.position || item.organizer) && (
            <p className="mt-2 flex items-start gap-1.5 text-sm">
              <Award className="mt-0.5 h-4 w-4 shrink-0 text-rmkec-green" aria-hidden="true" />
              <span>{[item.position, item.organizer].filter(Boolean).join(" · ")}</span>
            </p>
          )}
          {item.proofUrl && (
            <a
              href={item.proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ieee-blue hover:underline"
            >
              <FileCheck2 className="h-4 w-4" aria-hidden="true" /> View certificate
            </a>
          )}
        </div>
      </div>
      {item.photo && (
        <div className="relative hidden w-32 shrink-0 sm:block">
          <Image src={item.photo.url} alt={item.photo.alt} fill sizes="128px" className="photo-grade object-cover" />
        </div>
      )}
    </article>
  );
}
