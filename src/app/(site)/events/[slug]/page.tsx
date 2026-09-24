import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  PlayCircle,
  Share2,
  Ticket,
  Users,
  Video,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { PageHeader } from "@/components/ui/PageHeader";
import { RichText } from "@/components/ui/RichText";
import { categoryColor } from "@/lib/categories";
import { eventEnds, getAlbums, getEventBySlug, getEvents } from "@/lib/content";
import { formatDate, timeRange } from "@/lib/format";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getEvents()).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const event = await getEventBySlug((await params).slug);
  if (!event) return {};
  return {
    title: event.title,
    description: event.summary,
    openGraph: event.poster ? { images: [{ url: event.poster.url }] } : undefined,
  };
}

const modeLabel = { "in-person": "In person", online: "Online", hybrid: "Hybrid" } as const;

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const [event, albums] = await Promise.all([getEventBySlug(slug), getAlbums()]);
  if (!event) notFound();

  const upcoming = eventEnds(event) >= new Date();
  const photos = albums.filter((a) => a.event?.slug === slug).flatMap((a) => a.photos);
  const time = timeRange(event);
  const multiDay =
    event.endDate && formatDate(event.endDate) !== formatDate(event.startDate) ? formatDate(event.endDate) : null;

  const facts = [
    { icon: CalendarDays, label: "Date", value: multiDay ? `${formatDate(event.startDate)} – ${multiDay}` : formatDate(event.startDate, { weekday: "long" }) },
    time && { icon: Clock, label: "Time", value: time },
    event.venue && {
      icon: event.mode === "online" ? Video : MapPin,
      label: event.mode === "online" ? "Platform" : "Venue",
      value: event.venue,
    },
    event.mode && { icon: Users, label: "Mode", value: modeLabel[event.mode] },
    event.attendance && { icon: Users, label: "Attendance", value: `${event.attendance} participants` },
  ].filter(Boolean) as { icon: typeof Clock; label: string; value: string }[];

  const actions = [
    upcoming && event.registrationUrl && { href: event.registrationUrl, label: "Register now", icon: Ticket, primary: true },
    upcoming && event.joinUrl && { href: event.joinUrl, label: "Join / watch live", icon: Video, primary: !event.registrationUrl },
    !upcoming && (event.recordingUrl || event.joinUrl) && {
      href: (event.recordingUrl || event.joinUrl)!,
      label: "Watch recording",
      icon: PlayCircle,
      primary: true,
    },
    event.reportFileUrl && { href: event.reportFileUrl, label: "Download report", icon: FileText },
    event.socialPostUrl && { href: event.socialPostUrl, label: "View social post", icon: Share2 },
  ].filter(Boolean) as { href: string; label: string; icon: typeof Clock; primary?: boolean }[];

  return (
    <>
      <PageHeader
        eyebrow={[event.seriesLabel, upcoming ? "Upcoming" : "Past event"].filter(Boolean).join(" · ")}
        title={event.title}
        crumbs={[{ label: "Events", href: "/events" }, { label: event.seriesLabel ?? "Event" }]}
      />

      <section className="py-12 sm:py-16">
        <Container className="grid gap-10 lg:grid-cols-12">
          {/* Main column */}
          <article className="min-w-0 lg:col-span-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="h-5 w-1.5 rounded-full" style={{ background: categoryColor(event.eventType) }} aria-hidden="true" />
              <CategoryTag category={event.eventType} />
              {event.societies.map((s) => (
                <span key={s.id} className="rounded-full bg-ieee-blue-light px-3 py-1 text-xs font-semibold text-ieee-blue-dark">
                  {s.name}
                </span>
              ))}
            </div>

            {event.summary && <p className="mt-5 text-xl leading-relaxed text-ink">{event.summary}</p>}
            <RichText value={event.description} />

            {event.objective && (
              <div className="mt-8 rounded-lg border-l-4 border-rmkec-green bg-rmkec-green-light p-5">
                <h2 className="text-sm font-bold tracking-wider text-rmkec-green-dark uppercase">Objective</h2>
                <p className="mt-2 leading-relaxed text-ink">{event.objective}</p>
              </div>
            )}

            {event.speakers.length > 0 && (
              <section className="mt-12" aria-labelledby="speakers">
                <h2 id="speakers" className="text-2xl font-bold">
                  {event.speakers.length > 1 ? "Speakers & guests" : event.speakers[0].role || "Speaker"}
                </h2>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                  {event.speakers.map((sp) => (
                    <li key={sp.name} className="flex gap-4 rounded-lg border border-line bg-white p-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-ieee-blue-light">
                        {sp.photo ? (
                          <Image src={sp.photo.url} alt={sp.photo.alt || sp.name} fill sizes="64px" className="photo-grade object-cover" />
                        ) : (
                          <span className="flex h-full items-center justify-center text-lg font-bold text-ieee-blue" aria-hidden="true">
                            {sp.name.replace(/^(Prof\.|Dr\.|Ms\.|Mr\.|\(Dr\.\))\s*/g, "").replace(/^(Prof\.|Dr\.|\(Dr\.\))\s*/g, "")[0]}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        {sp.role && <p className="text-xs font-bold tracking-wider text-rmkec-green uppercase">{sp.role}</p>}
                        <p className="font-bold text-ink">{sp.name}</p>
                        {sp.designation && <p className="mt-0.5 text-sm leading-snug">{sp.designation}</p>}
                        {sp.affiliation && <p className="mt-0.5 text-sm text-muted">{sp.affiliation}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {event.agenda && event.agenda.length > 0 && (
              <section className="mt-12" aria-labelledby="agenda">
                <h2 id="agenda" className="text-2xl font-bold">
                  Agenda
                </h2>
                <ol className="mt-5 divide-y divide-line rounded-lg border border-line">
                  {event.agenda.map((a, i) => (
                    <li key={i} className="grid gap-1 p-4 sm:grid-cols-[120px_1fr]">
                      <span className="font-semibold text-ieee-blue tabular-nums">{a.time}</span>
                      <span>
                        <span className="font-semibold text-ink">{a.title}</span>
                        {a.detail && <span className="block text-sm text-muted">{a.detail}</span>}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {event.report && event.report.length > 0 && (
              <section className="mt-12" aria-labelledby="report">
                <h2 id="report" className="text-2xl font-bold">
                  Event report
                </h2>
                <RichText value={event.report} />
              </section>
            )}

            {photos.length > 0 && (
              <section className="mt-12" aria-labelledby="photos">
                <h2 id="photos" className="mb-5 text-2xl font-bold">
                  Photos
                </h2>
                <PhotoGrid photos={photos} columns="sm:columns-2" />
              </section>
            )}

            <Link href="/events" className="mt-12 inline-flex items-center gap-2 text-sm font-semibold text-ieee-blue hover:underline">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All events
            </Link>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="flex flex-col gap-6 lg:sticky lg:top-44">
              {event.poster && (
                <a href={event.poster.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-line bg-surface">
                  <Image
                    src={event.poster.url}
                    alt={event.poster.alt}
                    width={event.poster.width}
                    height={event.poster.height}
                    sizes="(min-width: 1024px) 380px, 100vw"
                    className="h-auto w-full"
                  />
                  <span className="sr-only">(open full-size poster)</span>
                </a>
              )}
              <div className="rounded-lg border border-line bg-white">
                <dl className="divide-y divide-line">
                  {facts.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex gap-3 p-4">
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ieee-blue" aria-hidden="true" />
                      <div>
                        <dt className="text-xs font-semibold tracking-wider text-muted uppercase">{label}</dt>
                        <dd className="font-medium text-ink">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
                {actions.length > 0 && (
                  <div className="flex flex-col gap-2 border-t border-line p-4">
                    {actions.map(({ href, label, icon: Icon, primary }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
                          primary
                            ? "bg-ieee-blue text-white hover:bg-ieee-blue-dark"
                            : "border border-line text-ink hover:border-rmkec-green hover:text-rmkec-green"
                        }`}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" /> {label}
                        <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
