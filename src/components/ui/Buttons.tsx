import Link from "next/link";
import type { ReactNode } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition-colors";

export function PrimaryLink({ href, children, external }: { href: string; children: ReactNode; external?: boolean }) {
  const cls = `${base} bg-ieee-blue text-white hover:bg-ieee-blue-dark`;
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function SecondaryLink({ href, children, external }: { href: string; children: ReactNode; external?: boolean }) {
  const cls = `${base} border border-line bg-white text-ink hover:border-rmkec-green hover:text-rmkec-green`;
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
