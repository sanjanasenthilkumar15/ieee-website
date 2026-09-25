import type { Metadata } from "next";
import { ExternalLink, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { MemberCard } from "@/components/cards/MemberCard";
import { Container } from "@/components/layout/Container";
import { SocialIcons } from "@/components/layout/SocialIcons";
import { PrimaryLink } from "@/components/ui/Buttons";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { execomYears, getExecom, getSiteSettings } from "@/lib/content";
import { site } from "@/lib/site";


export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the IEEE Student Branch at R.M.K. Engineering College, Kavaraipettai.",
};

const MAP_QUERY = "R.M.K. Engineering College, Kavaraipettai, Tamil Nadu";

export default async function ContactPage() {
  const [s, members] = await Promise.all([getSiteSettings(), getExecom()]);
  const email = s.contactEmail || site.contact.email;
  const address = s.address || site.contact.address;
  const year = execomYears(members)[0];
  const leads = members.filter(
    (m) => m.year === year && (m.memberType === "faculty" ? /counsel/i.test(m.role) : /^(chair|vice chair|secretary)$/i.test(m.role)),
  );
  const directions = s.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`;
  const hasSocial = Object.values(s.social).some(Boolean);

  return (
    <>
      <PageHeader title="Contact" crumbs={[{ label: "Contact" }]} intro="Questions about membership, events or collaborations? Get in touch." />

      <section className="py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-5">
            <ContactItem icon={Mail} label="Email">
              <a href={`mailto:${email}`} className="font-semibold text-ieee-blue hover:underline">
                {email}
              </a>
            </ContactItem>
            {s.contactPhone && (
              <ContactItem icon={Phone} label="Phone">
                <a href={`tel:${s.contactPhone.replace(/\s/g, "")}`} className="font-semibold text-ieee-blue hover:underline">
                  {s.contactPhone}
                </a>
              </ContactItem>
            )}
            <ContactItem icon={MapPin} label="Address">
              <address className="leading-relaxed not-italic">{address}</address>
              <a
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ieee-blue hover:underline"
              >
                <Navigation className="h-4 w-4" aria-hidden="true" /> Get directions
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">(opens Google Maps in a new tab)</span>
              </a>
            </ContactItem>
            {hasSocial && (
              <div className="rounded-lg bg-ieee-blue-dark p-5">
                <p className="mb-3 text-sm font-semibold text-white">Follow the branch</p>
                <SocialIcons links={s.social} />
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-lg border border-line">
              <iframe
                title="Map showing R.M.K. Engineering College"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&z=14&output=embed`}
                className="h-[380px] w-full lg:h-[460px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </Container>
      </section>

      {leads.length > 0 && (
        <section className="border-t border-line bg-surface py-16 sm:py-20" aria-labelledby="leads-h">
          <Container>
            <SectionHeading id="leads-h" eyebrow="People to talk to" title="Branch leadership" href="/execom" linkLabel="Full Execom" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
              {leads.map((m) => (
                <MemberCard key={m.id} member={m} />
              ))}
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <PrimaryLink href="/join">Apply to join</PrimaryLink>
              <p className="text-sm text-muted">Want to become a member? The application takes two minutes.</p>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

function ContactItem({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 rounded-lg border border-line bg-white p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-ieee-blue-light">
        <Icon className="h-5 w-5 text-ieee-blue" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wider text-muted uppercase">{label}</p>
        <div className="mt-1 text-ink">{children}</div>
      </div>
    </div>
  );
}
