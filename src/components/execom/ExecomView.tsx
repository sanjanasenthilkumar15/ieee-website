import Link from "next/link";
import { MemberCard } from "@/components/cards/MemberCard";
import { SocietyCard } from "@/components/cards/SocietyCard";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ExecomMember, Society } from "@/lib/content";

/**
 * Shared by /execom (latest committee) and /execom/[year] (past committees).
 * The year selector only appears once more than one year of data exists.
 */
export function ExecomView({
  year,
  years,
  members,
  societies,
}: {
  year: number;
  years: number[];
  members: ExecomMember[];
  societies: Society[];
}) {
  const latest = years[0];
  const isFounding = year === Math.min(...years);
  const faculty = members.filter((m) => m.memberType === "faculty");
  const students = members.filter((m) => m.memberType !== "faculty");
  const core = students.filter((m) => m.section !== "chairs");
  const chairs = students.filter((m) => m.section === "chairs");
  const soc = societies.filter((s) => s.kind !== "council");
  const councils = societies.filter((s) => s.kind === "council");

  return (
    <>
      <PageHeader
        eyebrow={isFounding ? "Founding committee" : year === latest ? "Current committee" : "Past committee"}
        title={`Execom ${year}`}
        crumbs={[{ label: "Execom", href: "/execom" }, ...(year !== latest ? [{ label: String(year) }] : [])]}
        intro="The office bearers and faculty who lead the IEEE Student Branch at R.M.K. Engineering College."
      />

      {years.length > 1 && (
        <nav aria-label="Committee year" className="border-b border-line bg-white">
          <Container className="flex flex-wrap items-center gap-2 py-4">
            <span className="mr-2 text-sm font-semibold text-muted">Past committees:</span>
            {years.map((y) => (
              <Link
                key={y}
                href={y === latest ? "/execom" : `/execom/${y}`}
                aria-current={y === year ? "page" : undefined}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                  y === year
                    ? "border-ieee-blue bg-ieee-blue text-white"
                    : "border-line text-body hover:border-rmkec-green hover:text-rmkec-green"
                }`}
              >
                {y}
              </Link>
            ))}
          </Container>
        </nav>
      )}

      <section className="py-16 sm:py-20">
        <Container>
          {members.length === 0 ? (
            <EmptyState title={`The ${year} committee hasn’t been announced yet`} />
          ) : (
            <>
              {faculty.length > 0 && (
                <div className="mb-16">
                  <SectionHeading eyebrow="Faculty" title="Counselor & coordinators" />
                  <div className="flex flex-wrap justify-center gap-x-16 gap-y-10 sm:justify-start">
                    {faculty.map((m) => (
                      <div key={m.id} className="w-56">
                        <MemberCard member={m} size="lg" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {core.length > 0 && (
                <div className="mb-16">
                  <SectionHeading eyebrow="Students" title="Office bearers" />
                  <MemberGrid members={core} />
                </div>
              )}
              {chairs.length > 0 && (
                <div>
                  <SectionHeading eyebrow="Students" title="Chairs — affinity groups & initiatives" />
                  <MemberGrid members={chairs} />
                </div>
              )}
            </>
          )}

          {years.length === 1 && (
            <p className="mt-16 rounded-md border border-dashed border-line bg-surface px-5 py-4 text-center text-sm text-muted">
              No past committees yet — {year} is the branch’s founding year. Check back next year.
            </p>
          )}
        </Container>
      </section>

      <section className="border-t border-line bg-surface py-16 sm:py-20" aria-labelledby="soc-heading">
        <Container>
          <SectionHeading
            id="soc-heading"
            eyebrow="Technical communities"
            title="Societies & councils"
            intro="IEEE societies and councils the branch works with. Members can join any of them alongside IEEE membership."
          />
          {societies.length === 0 ? (
            <EmptyState title="Societies will be listed here soon" />
          ) : (
            <>
              <h3 className="mb-4 text-lg font-bold">Societies ({soc.length})</h3>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {soc.map((s) => (
                  <SocietyCard key={s.id} society={s} />
                ))}
              </div>
              {councils.length > 0 && (
                <>
                  <h3 className="mt-12 mb-4 text-lg font-bold">Councils ({councils.length})</h3>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {councils.map((s) => (
                      <SocietyCard key={s.id} society={s} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </Container>
      </section>
    </>
  );
}

function MemberGrid({ members }: { members: ExecomMember[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
      {members.map((m) => (
        <MemberCard key={m.id} member={m} />
      ))}
    </div>
  );
}
