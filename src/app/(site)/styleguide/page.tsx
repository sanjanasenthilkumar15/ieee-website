import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { categoryMeta } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Design Tokens",
  robots: { index: false, follow: false },
};

const brand = [
  { name: "IEEE Blue", token: "ieee-blue", note: "Primary CTAs, links, active nav" },
  { name: "IEEE Blue Dark", token: "ieee-blue-dark", note: "Hover / pressed, utility bar" },
  { name: "IEEE Blue Light", token: "ieee-blue-light", note: "Tinted backgrounds" },
  { name: "RMKEC Green", token: "rmkec-green", note: "Secondary accents, tags, hovers" },
  { name: "RMKEC Green Dark", token: "rmkec-green-dark", note: "Pressed state" },
  { name: "RMKEC Green Light", token: "rmkec-green-light", note: "Tinted backgrounds" },
];

const neutrals = ["ink", "body", "muted", "line", "surface"];

/** Internal reference page (not linked in nav, noindex) for reviewing tokens. */
export default function StyleguidePage() {
  return (
    <Container className="py-14">
      <h1 className="text-4xl font-extrabold sm:text-5xl">Design tokens</h1>
      <p className="mt-3 max-w-2xl text-lg">
        Internal reference for the branch site&apos;s colour, type and card system. Hex values are
        placeholders until confirmed against the official logo and crest files.
      </p>

      <Section title="Brand colours">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brand.map((c) => (
            <Swatch key={c.token} name={c.name} token={c.token} note={c.note} />
          ))}
        </div>
      </Section>

      <Section title="Neutrals">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {neutrals.map((t) => (
            <Swatch key={t} name={t} token={t} />
          ))}
        </div>
      </Section>

      <Section title="Category stripes (Event & Achievement cards)">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(categoryMeta).map(([key, meta]) => (
            <div
              key={key}
              className="rounded-md border border-line bg-white p-4 pl-5 shadow-sm"
              style={{ borderLeft: `4px solid ${meta.color}` }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: meta.color }}>
                {meta.label}
              </p>
              <p className="mt-1 font-bold text-ink">Sample card title</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type scale (Inter — one family, weight/scale contrast)">
        <div className="space-y-4">
          <p className="text-6xl font-extrabold leading-none text-ink">Headline 64 / 800</p>
          <p className="text-5xl font-extrabold leading-none text-ink">Headline 48 / 800</p>
          <p className="text-3xl font-bold text-ink">Section title 30 / 700</p>
          <p className="text-xl font-bold text-ink">Card title 20 / 700</p>
          <p className="max-w-2xl text-base leading-relaxed">
            Body 16 / 400 — The IEEE Student Branch at RMK Engineering College brings together
            students across departments to learn, build and publish, with workshops, technical talks
            and competitions through the academic year.
          </p>
          <p className="text-sm text-muted">Caption 14 / 400 — Seminar Hall, Main Block · 12 Oct 2026</p>
        </div>
      </Section>
    </Container>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="mb-5 border-l-4 border-rmkec-green pl-3 text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Swatch({ name, token, note }: { name: string; token: string; note?: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-white">
      <div className="h-20 border-b border-line" style={{ background: `var(--color-${token})` }} />
      <div className="p-3">
        <p className="font-semibold capitalize text-ink">{name}</p>
        <p className="font-mono text-xs text-muted">--color-{token}</p>
        {note && <p className="mt-1 text-sm">{note}</p>}
      </div>
    </div>
  );
}
