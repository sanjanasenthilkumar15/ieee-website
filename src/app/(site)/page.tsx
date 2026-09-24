import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { site } from "@/lib/site";

/**
 * PHASE 1 PLACEHOLDER HOME.
 * Replaced in Phase 3 with the full home page (crest watermark, animated
 * hero, count-up stat strip, featured event, highlights, posts, photo strip).
 */
export default function HomePage() {
  return (
    <>
      <section className="border-b border-line bg-surface">
        <Container className="py-20 sm:py-28">
          <p className="text-sm font-semibold uppercase tracking-wider text-rmkec-green">
            {site.branchCode} · Established {site.established}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            IEEE Student Branch, RMK Engineering College
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-body">{site.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/join"
              className="inline-flex items-center gap-2 rounded-md bg-ieee-blue px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-ieee-blue-dark"
            >
              Join the Branch <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/styleguide"
              className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-rmkec-green hover:text-rmkec-green"
            >
              View design tokens
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-16">
        <div className="rounded-lg border border-dashed border-line p-8 text-center text-muted">
          Scaffold ready. Page sections arrive in Phase 3.
        </div>
      </Container>
    </>
  );
}
