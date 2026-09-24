import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Newspaper } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SocialIcons } from "@/components/layout/SocialIcons";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { VideoEmbed } from "@/components/gallery/VideoEmbed";
import { youtubeId } from "@/lib/video";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getAlbums, getEvents, getSiteSettings, splitEvents } from "@/lib/content";
import { formatDate } from "@/lib/format";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos, videos and media coverage of IEEE Student Branch RMKEC events.",
};

export default async function GalleryPage() {
  const [albums, events, settings] = await Promise.all([getAlbums(), getEvents(), getSiteSettings()]);

  // Videos: album videos + recordings/livestreams of past events.
  const { past } = splitEvents(events);
  const videos = [
    ...albums.flatMap((a) => a.videos.map((v) => ({ url: v.url, title: v.title || a.title }))),
    ...past
      .map((e) => ({ url: e.recordingUrl || e.joinUrl || "", title: [e.seriesLabel, e.title].filter(Boolean).join(": ") }))
      .filter((v) => youtubeId(v.url)),
  ].filter((v, i, arr) => arr.findIndex((x) => x.url === v.url) === i);

  const hasSocial = Object.values(settings.social).some(Boolean);

  return (
    <>
      <PageHeader title="Gallery" crumbs={[{ label: "Gallery" }]} intro="Moments from our events, sessions and the people behind them." />

      {/* Albums */}
      <section className="py-12 sm:py-16" aria-label="Photo albums">
        <Container>
          {albums.length === 0 ? (
            <EmptyState title="No albums yet">Photos from branch events will appear here.</EmptyState>
          ) : (
            <>
              <nav aria-label="Albums" className="mb-12 flex flex-wrap gap-2">
                {albums.map((a) => (
                  <a
                    key={a.id}
                    href={`#${a.slug}`}
                    className="rounded-full border border-line bg-white px-4 py-1.5 text-sm font-semibold text-body hover:border-rmkec-green hover:text-rmkec-green"
                  >
                    {a.title} <span className="text-muted">{a.photos.length}</span>
                  </a>
                ))}
              </nav>
              {albums.map((a) => (
                <section key={a.id} id={a.slug} className="mb-16 scroll-mt-40" aria-labelledby={`${a.slug}-h`}>
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-2 border-b border-line pb-3">
                    <div>
                      <h2 id={`${a.slug}-h`} className="text-2xl font-bold">
                        {a.title}
                      </h2>
                      <p className="mt-1 text-sm text-muted">
                        {formatDate(a.date)} · {a.photos.length} photo{a.photos.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    {a.event && (
                      <Link href={`/events/${a.event.slug}`} className="text-sm font-semibold text-ieee-blue hover:underline">
                        About this event →
                      </Link>
                    )}
                  </div>
                  <PhotoGrid photos={a.photos} />
                </section>
              ))}
            </>
          )}
        </Container>
      </section>

      {/* Videos */}
      <section className="border-t border-line bg-surface py-16" aria-labelledby="videos-h">
        <Container>
          <SectionHeading id="videos-h" eyebrow="Watch" title="Videos & reels" />
          {videos.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => (
                <figure key={v.url}>
                  <VideoEmbed url={v.url} title={v.title} />
                  <figcaption className="mt-2 text-sm font-semibold text-ink">{v.title}</figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <EmptyState title="No videos yet">Webinar recordings and reels will appear here.</EmptyState>
          )}
        </Container>
      </section>

      {/* Media coverage + social */}
      <section className="py-16" aria-labelledby="media-h">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading id="media-h" eyebrow="In the news" title="Media coverage" />
            {settings.mediaCoverage.length ? (
              <ul className="divide-y divide-line rounded-lg border border-line">
                {settings.mediaCoverage.map((m, i) => (
                  <li key={i}>
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-4 hover:bg-surface"
                    >
                      <Newspaper className="mt-0.5 h-5 w-5 shrink-0 text-rmkec-green" aria-hidden="true" />
                      <span className="flex-1">
                        <span className="block font-semibold text-ink">{m.title}</span>
                        <span className="text-sm text-muted">{[m.outlet, m.date && formatDate(m.date)].filter(Boolean).join(" · ")}</span>
                      </span>
                      <ExternalLink className="h-4 w-4 text-muted" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">Press features and articles about the branch will be listed here.</p>
            )}
          </div>
          <div>
            <SectionHeading eyebrow="Follow along" title="On social media" />
            {hasSocial ? (
              <div className="rounded-lg bg-ieee-blue-dark p-6">
                <p className="mb-4 text-white/85">Event announcements, reels and photos — follow the branch.</p>
                <SocialIcons links={settings.social} />
              </div>
            ) : (
              <p className="text-muted">Our social channels will be linked here soon.</p>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
