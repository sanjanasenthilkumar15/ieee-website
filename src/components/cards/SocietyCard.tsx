import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { Society } from "@/lib/content/types";

const kindLabel = { society: "Society", council: "Council", affinity: "Affinity Group" } as const;

export function SocietyCard({ society }: { society: Society }) {
  return (
    <article className="card-lift flex h-full flex-col rounded-lg border border-line bg-white p-5">
      <div className="relative flex h-20 items-center">
        {society.logo ? (
          <Image
            src={society.logo.url}
            alt={society.logo.alt || `${society.name} logo`}
            width={society.logo.width}
            height={society.logo.height}
            sizes="220px"
            className="h-auto max-h-20 w-auto max-w-[220px] object-contain"
          />
        ) : (
          <span className="text-2xl font-extrabold text-ieee-blue">{society.shortName}</span>
        )}
      </div>
      <p className="mt-4 text-xs font-bold tracking-wider text-rmkec-green uppercase">{kindLabel[society.kind]}</p>
      <h3 className="mt-1 text-base leading-snug font-bold">{society.name}</h3>
      {society.description && <p className="mt-2 line-clamp-4 text-sm leading-relaxed">{society.description}</p>}
      {society.website && (
        <a
          href={society.website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-ieee-blue hover:underline"
        >
          Visit website <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      )}
    </article>
  );
}
