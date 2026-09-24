import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Section title with a green eyebrow and an optional "view all" link. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  href,
  linkLabel = "View all",
  id,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  href?: string;
  linkLabel?: string;
  id?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-wider text-rmkec-green">{eyebrow}</p>
        )}
        <h2 id={id} className="mt-1 text-3xl font-bold sm:text-4xl">
          {title}
        </h2>
        {intro && <p className="mt-3 text-base leading-relaxed">{intro}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-ieee-blue hover:text-ieee-blue-dark"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
