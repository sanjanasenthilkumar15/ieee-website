import type { Metadata } from "next";
import Image from "next/image";
import { Award, Compass, Target } from "lucide-react";
import { Timeline } from "@/components/about/Timeline";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSiteSettings } from "@/lib/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About",
  description:
    "Vision, mission and history of the IEEE Student Branch at R.M.K. Engineering College (SB61871), established in 2026.",
};

export default async function AboutPage() {
  const s = await getSiteSettings();

  return (
    <>
      <PageHeader
        title="About the Branch"
        crumbs={[{ label: "About" }]}
        intro={`The IEEE Student Branch at R.M.K. Engineering College (${s.branchCode}) was established in ${s.establishedYear} under the IEEE Madras Section, Region 10.`}
      />

      {/* Vision & mission */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { icon: Compass, title: "Vision", text: s.vision },
              { icon: Target, title: "Mission", text: s.mission },
            ].map(({ icon: Icon, title, text }) =>
              text ? (
                <article key={title} className="relative overflow-hidden rounded-lg border border-line bg-white p-7 sm:p-8">
                  <span className="absolute inset-x-0 top-0 h-1 bg-ieee-blue" aria-hidden="true" />
                  <Icon className="h-7 w-7 text-rmkec-green" aria-hidden="true" />
                  <h2 className="mt-4 text-2xl font-bold">{title}</h2>
                  <p className="mt-3 text-lg leading-relaxed">{text}</p>
                </article>
              ) : null,
            )}
          </div>

          {s.objectives.length > 0 && (
            <div className="mt-14">
              <SectionHeading eyebrow="What we do" title="Objectives" />
              <ol className="grid gap-4 sm:grid-cols-2">
                {s.objectives.map((o, i) => (
                  <li key={i} className="flex gap-4 rounded-lg border border-line bg-surface p-5">
                    <span className="text-3xl leading-none font-extrabold text-ieee-blue/30 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="pt-1 leading-relaxed text-ink">{o}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </Container>
      </section>

      {/* History */}
      <section className="border-y border-line bg-surface py-16 sm:py-20" aria-labelledby="history-heading">
        <Container>
          <SectionHeading id="history-heading" eyebrow="History" title="Milestones" />
          <Timeline milestones={s.milestones} />
        </Container>
      </section>

      {/* Host institution */}
      <section className="py-16 sm:py-20" aria-labelledby="rmkec-heading">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
            <Image
              src="/images/campus-aerial.jpg"
              alt="Aerial view of the R.M.K. Engineering College campus at Kavaraipettai"
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="photo-grade object-cover"
            />
          </div>
          <div>
            <SectionHeading id="rmkec-heading" eyebrow="Host institution" title="R.M.K. Engineering College" />
            <p className="-mt-3 leading-relaxed">
              An autonomous institution at Kavaraipettai near Chennai, celebrating 31 years of academic excellence.
              The college is affiliated to Anna University, approved by AICTE, accredited by NAAC with an A+ grade and
              ISO 21001:2018 certified, with all eligible UG programmes accredited by NBA.
            </p>
          </div>
        </Container>
      </section>

      {/* Recognitions */}
      <section className="border-t border-line bg-surface py-16 sm:py-20" aria-labelledby="rec-heading">
        <Container>
          <SectionHeading id="rec-heading" eyebrow="Recognitions" title="Awards to the branch" />
          {s.recognitions.length ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {s.recognitions.map((r, i) => (
                <li key={i} className="flex gap-3 rounded-lg border border-line bg-white p-5">
                  <Award className="mt-0.5 h-5 w-5 shrink-0 text-cat-award" aria-hidden="true" />
                  <div>
                    <p className="font-bold text-ink">{r.title}</p>
                    <p className="text-sm text-muted">{[r.awardedBy, r.year].filter(Boolean).join(" · ")}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">
              As a branch founded in {s.establishedYear}, our first recognitions are still ahead — they will be listed here.
            </p>
          )}
        </Container>
      </section>
    </>
  );
}
