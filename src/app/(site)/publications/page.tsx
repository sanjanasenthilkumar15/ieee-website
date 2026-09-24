import type { Metadata } from "next";
import { ChevronDown, ExternalLink } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { RichText } from "@/components/ui/RichText";
import { getPublications } from "@/lib/content";
import { researchAreas } from "@/lib/options";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Publications",
  description: "Research papers published by members of the IEEE Student Branch at R.M.K. Engineering College.",
};

const venueLabel: Record<string, string> = {
  conference: "Conference",
  journal: "Journal",
  chapter: "Book chapter",
  preprint: "Preprint",
};

export default async function PublicationsPage() {
  const pubs = await getPublications();
  const byYear = [...new Set(pubs.map((p) => p.year))].sort((a, b) => b - a);

  return (
    <>
      <PageHeader
        title="Publications"
        crumbs={[{ label: "Publications" }]}
        intro="Papers by our members in IEEE and other peer-reviewed conferences and journals."
      />
      <section className="py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-4xl">
          {pubs.length === 0 ? (
            <EmptyState title="No publications listed yet">Published a paper? Share the DOI with the Execom.</EmptyState>
          ) : (
            byYear.map((year) => (
              <section key={year} className="mb-12" aria-labelledby={`y${year}`}>
                <h2 id={`y${year}`} className="mb-4 flex items-center gap-3 text-2xl font-bold">
                  {year}
                  <span className="h-px flex-1 bg-line" aria-hidden="true" />
                </h2>
                <ul className="flex flex-col gap-3">
                  {pubs
                    .filter((p) => p.year === year)
                    .map((p) => {
                      const area = researchAreas.find((r) => r.value === p.researchArea)?.title;
                      const href = p.link || (p.doi ? `https://doi.org/${p.doi}` : undefined);
                      return (
                        <li key={p.id}>
                          <details className="group rounded-lg border border-line bg-white open:shadow-sm">
                            <summary className="flex cursor-pointer list-none items-start gap-4 p-5 [&::-webkit-details-marker]:hidden">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold tracking-wider text-rmkec-green uppercase">
                                  {[p.venueType && venueLabel[p.venueType], area].filter(Boolean).join(" · ")}
                                </p>
                                <h3 className="mt-1 text-lg leading-snug font-bold">{p.title}</h3>
                                <p className="mt-1 text-sm">{p.authors.join(", ")}</p>
                                <p className="mt-0.5 text-sm text-muted italic">{p.venue}</p>
                              </div>
                              <ChevronDown
                                className="mt-1 h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180"
                                aria-hidden="true"
                              />
                            </summary>
                            <div className="border-t border-line px-5 pt-1 pb-5">
                              {p.abstract?.length ? (
                                <>
                                  <p className="mt-4 text-xs font-bold tracking-wider text-muted uppercase">Abstract</p>
                                  <RichText value={p.abstract} />
                                </>
                              ) : (
                                <p className="mt-4 text-sm text-muted">No abstract provided.</p>
                              )}
                              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                                {p.doi && (
                                  <span>
                                    <span className="font-semibold text-ink">DOI:</span> {p.doi}
                                  </span>
                                )}
                                {href && (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 font-semibold text-ieee-blue hover:underline"
                                  >
                                    Read the paper <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span className="sr-only">(opens in a new tab)</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </details>
                        </li>
                      );
                    })}
                </ul>
              </section>
            ))
          )}
          </div>
        </Container>
      </section>
    </>
  );
}
