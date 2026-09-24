import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/Container";

type Crumb = { label: string; href?: string };

/** Banner at the top of every inner page: breadcrumb, title, optional intro. */
export function PageHeader({
  title,
  intro,
  crumbs = [],
  eyebrow,
}: {
  title: string;
  intro?: string;
  crumbs?: Crumb[];
  eyebrow?: string;
}) {
  const trail: Crumb[] = [{ label: "Home", href: "/" }, ...crumbs];
  return (
    <section className="relative overflow-hidden border-b border-line bg-ieee-blue-dark text-white">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-rmkec-green" aria-hidden="true" />
      <Container className="py-10 sm:py-14">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-white/70">
            {trail.map((c, i) => (
              <li key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-white/40" aria-hidden="true" />}
                {c.href && i < trail.length - 1 ? (
                  <Link href={c.href} className="hover:text-white hover:underline">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current={i === trail.length - 1 ? "page" : undefined} className="text-white/90">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        {eyebrow && (
          <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-white/70">{eyebrow}</p>
        )}
        <h1 className={`${eyebrow ? "mt-2" : "mt-6"} max-w-4xl text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl`}>
          {title}
        </h1>
        {intro && <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/80">{intro}</p>}
      </Container>
    </section>
  );
}
