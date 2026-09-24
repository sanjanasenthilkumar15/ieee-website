import type { Metadata } from "next";
import { BookOpen, Briefcase, Globe2, GraduationCap, Trophy, Users } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { JoinForm } from "@/components/join/JoinForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Join IEEE",
  description: "Become a member of the IEEE Student Branch at R.M.K. Engineering College. Benefits, eligibility and application form.",
};

const benefits = [
  { icon: Globe2, title: "A global network", text: "Connect with engineers, researchers and students in IEEE sections around the world." },
  { icon: BookOpen, title: "Learning & publications", text: "Webinars by distinguished speakers, IEEE publications and learning resources for students." },
  { icon: Users, title: "Technical societies", text: "Join societies and councils in your field — computing, photonics, robotics, sensors and more." },
  { icon: Trophy, title: "Competitions & awards", text: "Take part in IEEE student contests, hackathons and paper competitions at section and global level." },
  { icon: Briefcase, title: "Leadership experience", text: "Organise events, lead chapters and serve on the Execom as the branch grows." },
  { icon: GraduationCap, title: "Career support", text: "Industry talks, mentoring and IEEE career resources to help plan what comes next." },
];

const steps = [
  { title: "Apply here", text: "Fill in the form below. It takes two minutes." },
  { title: "We’ll reach out", text: "An Execom member contacts you to answer questions and help you choose societies." },
  { title: "Register with IEEE", text: "Create your IEEE account and complete student membership at ieee.org. Dues are paid directly to IEEE." },
];

export default function JoinPage() {
  return (
    <>
      <PageHeader
        title="Join IEEE at RMKEC"
        crumbs={[{ label: "Join" }]}
        intro="Be part of the branch from its founding year — learn, build and lead with IEEE."
      />

      <section className="py-16 sm:py-20" aria-labelledby="benefits-h">
        <Container>
          <SectionHeading id="benefits-h" eyebrow="Why join" title="Membership benefits" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-lg border border-line bg-white p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-ieee-blue-light">
                  <Icon className="h-6 w-6 text-ieee-blue" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed">{text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-y border-line bg-surface py-16 sm:py-20" aria-labelledby="elig-h">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading id="elig-h" eyebrow="Who can join" title="Eligibility" />
            <ul className="-mt-2 space-y-3">
              {[
                "Students of R.M.K. Engineering College in any department and any year.",
                "Undergraduate and postgraduate students are both welcome.",
                "Branch membership follows IEEE student membership, taken at ieee.org.",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-rmkec-green" aria-hidden="true" />
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading eyebrow="How it works" title="Three steps" />
            <ol className="-mt-2 space-y-4">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ieee-blue font-bold text-white">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-bold text-ink">{s.title}</span>
                    <span className="text-sm leading-relaxed">{s.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20" aria-labelledby="form-h">
        <Container>
          <div className="mx-auto max-w-3xl">
            <SectionHeading id="form-h" eyebrow="Apply" title="Membership application" intro="All fields are required." />
            <div className="rounded-xl border border-line bg-white p-6 shadow-sm sm:p-8">
              <JoinForm />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
