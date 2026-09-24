import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { Container } from "./Container";
import { SocialIcons } from "./SocialIcons";
import { joinCta, mainNav, site } from "@/lib/site";

const quickLinks = mainNav.filter((n) => ["/about", "/execom", "/events", "/achievements"].includes(n.href));
const resourceLinks = [
  ...mainNav.filter((n) => ["/publications", "/blog", "/gallery", "/contact"].includes(n.href)),
  joinCta,
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-ink text-white/75">
      {/* Green rule — RMKEC secondary accent */}
      <div className="h-1 bg-rmkec-green" aria-hidden="true" />

      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
        {/* Identity */}
        <div className="lg:col-span-4">
          <div className="inline-flex items-center gap-4 rounded-md bg-white px-4 py-2.5">
            <Image src="/logos/ieee-sb.png" alt="IEEE RMKEC SB61871" width={161} height={72} className="h-10 w-auto" />
            <Image
              src="/logos/rmkec-crest.png"
              alt="R.M.K. Engineering College crest"
              width={331}
              height={426}
              className="h-10 w-auto"
            />
          </div>
          <p className="mt-4 text-base font-bold text-white">{site.name}</p>
          <p className="mt-1 text-sm">{site.branchCode} · Est. {site.established}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">{site.tagline}</p>
          <SocialIcons links={site.social} className="mt-5" />
        </div>

        <FooterColumn title="The Branch" links={quickLinks} className="lg:col-span-2" />
        <FooterColumn title="Resources" links={resourceLinks} className="lg:col-span-2" />

        {/* Contact */}
        <div className="lg:col-span-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/50" aria-hidden="true" />
              <a href={`mailto:${site.contact.email}`} className="hover:text-white">
                {site.contact.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" aria-hidden="true" />
              <span className="leading-relaxed">{site.contact.address}</span>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.shortName}. Affiliated with {site.affiliation}.
          </p>
          <p>
            IEEE is a registered trademark of the Institute of Electrical and Electronics Engineers, Inc.
          </p>
        </Container>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  className = "",
}: {
  title: string;
  links: { label: string; href: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="text-sm font-bold uppercase tracking-wider text-white">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
