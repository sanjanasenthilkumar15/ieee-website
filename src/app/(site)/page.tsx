import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarClock, MapPin, Video } from "lucide-react";
import { AchievementCard } from "@/components/cards/AchievementCard";
import { EventCard } from "@/components/cards/EventCard";
import { PostCard } from "@/components/cards/PostCard";
import { Hero } from "@/components/home/Hero";
import { StatStrip, type Stat } from "@/components/home/StatStrip";
import { Container } from "@/components/layout/Container";
import { PrimaryLink, SecondaryLink } from "@/components/ui/Buttons";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  getAchievements,
  getAlbums,
  getEvents,
  getExecom,
  getPosts,
  getSiteSettings,
  getSocieties,
  splitEvents,
  type EventItem,
} from "@/lib/content";
import { formatDate, timeRange } from "@/lib/format";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: "IEEE Student Branch RMKEC (SB61871)" },
};

export default async function HomePage() {
  const [settings, events, achievements, posts, albums, societies, execom] = await Promise.all([
    getSiteSettings(),
    getEvents(),
    getAchievements(),
    getPosts(),
    getAlbums(),
    getSocieties(),
    getExecom(),
  ]);
  const { upcoming, past } = splitEvents(events);

  // ---- Stats: Site Settings values win; otherwise derive from content ----
  const latestYear = Math.max(...execom.map((m) => m.year), settings.establishedYear);
  const stats: Stat[] = [
    settings.stats.members ? { label: "IEEE members", value: settings.stats.members, suffix: "+" } : null,
    { label: "Events held", value: settings.stats.eventsHeld ?? past.length },
    { label: "Societies & councils", value: settings.stats.societies ?? societies.length },
    settings.stats.awardsWon ? { label: "Awards won", value: settings.stats.awardsWon } : null,
    { label: "Office bearers", value: execom.filter((m) => m.year === latestYear).length },
  ].filter((s): s is Stat => Boolean(s && s.value > 0));

  // ---- Featured event: next featured upcoming → next upcoming → latest past ----
  const featured = upcoming.find((e) => e.featured) ?? upcoming[0];
  const spotlight = featured ?? past.find((e) => e.poster) ?? past[0];
  const moreEvents = (featured ? upcoming.filter((e) => e !== featured) : past.filter((e) => e !== spotlight)).slice(0, 3);

  const highlights = [
    ...achievements.filter((a) => a.featured),
    ...achievements.filter((a) => !a.featured),
  ].slice(0, 3);
  const photos = albums.flatMap((a) => a.photos.map((p) => ({ ...p, album: a.title }))).slice(0, 4);

  return (
    <>
      <Hero
        branchName={settings.branchName}
        tagline={settings.tagline}
        branchCode={settings.branchCode}
        established={settings.establishedYear}
      />
      <StatStrip stats={stats} />

      {/* Events */}
      <section className="py-16 sm:py-20" aria-labelledby="events-heading">
        <Container>
          <SectionHeading
            id="events-heading"
            eyebrow={featured ? "Coming up" : "Events"}
            title={featured ? "Next on the calendar" : "Latest from the branch"}
            href="/events"
            linkLabel="All events"
          />
          {spotlight ? (
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <SpotlightEvent event={spotlight} upcoming={Boolean(featured)} />
              </div>
              <div className="flex flex-col gap-4 lg:col-span-5">
                {!featured && (
                  <p className="rounded-md bg-ieee-blue-light px-4 py-3 text-sm text-ieee-blue-dark">
                    No upcoming events are scheduled right now. Follow us for announcements.
                  </p>
                )}
                {moreEvents.map((e) => (
                  <EventCard key={e.id} event={e} compact />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="No events yet">The branch calendar will appear here.</EmptyState>
          )}
        </Container>
      </section>

      {/* Achievements */}
      {highlights.length > 0 && (
        <section className="border-y border-line bg-surface py-16 sm:py-20" aria-labelledby="ach-heading">
          <Container>
            <SectionHeading
              id="ach-heading"
              eyebrow="Achievements"
              title="Member highlights"
              href="/achievements"
              linkLabel="All achievements"
            />
            <div className="grid gap-5 md:grid-cols-3">
              {highlights.map((a) => (
                <AchievementCard key={a.id} item={a} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Posts */}
      {posts.length > 0 && (
        <section className="py-16 sm:py-20" aria-labelledby="posts-heading">
          <Container>
            <SectionHeading
              id="posts-heading"
              eyebrow="Blog & newsletter"
              title="Latest posts"
              href="/blog"
              linkLabel="All posts"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.slice(0, 3).map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Photo strip */}
      {photos.length > 0 && (
        <section className="border-t border-line bg-surface py-16 sm:py-20" aria-labelledby="photos-heading">
          <Container>
            <SectionHeading id="photos-heading" eyebrow="Gallery" title="Moments" href="/gallery" linkLabel="Open gallery" />
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {photos.map((p) => (
                <li key={p.url} className="relative aspect-[4/3] overflow-hidden rounded-md bg-line">
                  <Link href="/gallery" className="group block h-full w-full" aria-label={`${p.alt} — ${p.album}`}>
                    <Image
                      src={p.url}
                      alt={p.alt}
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="photo-grade object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* Join CTA */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="relative overflow-hidden rounded-xl border border-line bg-white p-8 sm:p-12">
            <span className="absolute inset-y-0 left-0 w-1.5 bg-rmkec-green" aria-hidden="true" />
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <p className="text-sm font-semibold tracking-wider text-rmkec-green uppercase">Membership</p>
                <h2 className="mt-1 text-3xl font-bold sm:text-4xl">Join IEEE at RMKEC</h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed">
                  Connect with IEEE&apos;s technical societies, publications, competitions and a worldwide network of
                  engineers — and help build the branch from its very first year.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
                <PrimaryLink href="/join">
                  Apply to join <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </PrimaryLink>
                <SecondaryLink href="/about">About the branch</SecondaryLink>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function SpotlightEvent({ event, upcoming }: { event: EventItem; upcoming: boolean }) {
  const time = timeRange(event);
  return (
    <article className="card-lift relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white">
      {event.poster && (
        <div className="relative aspect-[16/9] border-b border-line bg-surface">
          <Image
            src={event.poster.url}
            alt={event.poster.alt}
            fill
            sizes="(min-width: 1024px) 680px, 100vw"
            className="object-contain"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded px-2 py-0.5 text-xs font-bold tracking-wider uppercase ${
              upcoming ? "bg-rmkec-green text-white" : "bg-surface text-muted"
            }`}
          >
            {upcoming ? "Upcoming" : "Latest"}
          </span>
          <CategoryTag category={event.eventType} />
          {event.seriesLabel && <span className="text-xs text-muted">· {event.seriesLabel}</span>}
        </div>
        <h3 className="mt-3 text-2xl leading-snug font-bold">
          <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0 hover:text-ieee-blue">
            {event.title}
          </Link>
        </h3>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
          <li className="flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            {formatDate(event.startDate)}
            {time && ` · ${time}`}
          </li>
          {event.venue && (
            <li className="flex items-center gap-1.5">
              {event.mode === "online" ? <Video className="h-4 w-4" aria-hidden="true" /> : <MapPin className="h-4 w-4" aria-hidden="true" />}
              {event.venue}
            </li>
          )}
        </ul>
        {event.summary && <p className="mt-3 leading-relaxed">{event.summary}</p>}
      </div>
    </article>
  );
}
