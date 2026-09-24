"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Mail, Menu, X } from "lucide-react";
import { Container } from "./Container";
import { joinCta, mainNav, site } from "@/lib/site";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header({ email }: { email?: string }) {
  const pathname = usePathname();
  // The menu is "open" only for the route it was opened on, so navigating
  // closes it automatically without an effect.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_1px_0_var(--color-line)]">
      {/* Utility bar */}
      <div className="hidden bg-ieee-blue-dark text-xs text-white/85 md:block">
        <Container className="flex h-9 items-center justify-between">
          <p>{site.affiliation}</p>
          <div className="flex items-center gap-5">
            {email && (
              <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-white">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                {email}
              </a>
            )}
            <span className={email ? "border-l border-white/25 pl-5" : ""}>Established {site.established}</span>
          </div>
        </Container>
      </div>

      {/* Brand row: IEEE primary, RMKEC secondary */}
      <Container className="flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={`${site.name} — home`}>
          <Image
            src="/logos/ieee-sb.png"
            alt="IEEE RMKEC SB61871"
            width={161}
            height={72}
            priority
            className="h-11 w-auto shrink-0 sm:h-[52px]"
          />
          <span className="hidden min-w-0 border-l border-line pl-3 leading-tight min-[360px]:block">
            <span className="block truncate text-base font-extrabold tracking-tight text-ink sm:text-lg">
              IEEE Student Branch
            </span>
            <span className="block truncate text-xs font-medium text-muted sm:text-sm">
              {site.college} · {site.branchCode}
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 border-l border-line pl-4 md:flex">
            <Image
              src="/logos/rmkec-crest.png"
              alt="R.M.K. Engineering College crest"
              width={331}
              height={426}
              className="h-11 w-auto"
            />
            <span className="text-xs leading-tight text-muted">
              Hosted by
              <br />
              <span className="font-semibold text-rmkec-green">RMK Engineering College</span>
            </span>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpenOn(open ? null : pathname)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {/* Desktop nav row */}
      <nav aria-label="Main" className="hidden border-t border-line lg:block">
        <Container className="flex h-12 items-center justify-between">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex h-12 items-center px-3 text-sm font-semibold transition-colors ${
                      active ? "text-ieee-blue" : "text-body hover:text-rmkec-green"
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t bg-ieee-blue" aria-hidden="true" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href={joinCta.href}
            className="rounded-md bg-ieee-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ieee-blue-dark"
          >
            {joinCta.label}
          </Link>
        </Container>
      </nav>

      {/* Mobile nav panel */}
      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-line bg-white lg:hidden">
          <Container className="py-3">
            <ul className="flex flex-col">
              {mainNav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`block border-l-[3px] px-3 py-2.5 text-base font-semibold ${
                        active ? "border-ieee-blue bg-ieee-blue-light text-ieee-blue" : "border-transparent text-body"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link
              href={joinCta.href}
              className="mt-3 block rounded-md bg-ieee-blue px-4 py-3 text-center text-base font-semibold text-white"
            >
              {joinCta.label}
            </Link>
          </Container>
        </nav>
      )}
    </header>
  );
}
