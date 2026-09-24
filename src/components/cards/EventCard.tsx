import Image from "next/image";
import Link from "next/link";
import { CalendarClock, MapPin, Video } from "lucide-react";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { categoryColor } from "@/lib/categories";
import type { EventItem } from "@/lib/content/types";
import { dateParts, timeRange } from "@/lib/format";

/** Horizontal event card: category stripe, date block, details, optional poster thumbnail. */
export function EventCard({
  event,
  headingLevel = "h3",
  compact = false,
}: {
  event: EventItem;
  headingLevel?: "h2" | "h3";
  /** Hide the poster thumbnail (for narrow columns). */
  compact?: boolean;
}) {
  const { day, month, year } = dateParts(event.startDate);
  const time = timeRange(event);
  const H = headingLevel;
  const where = event.mode === "online" ? event.venue || "Online" : event.venue;
  return (
    <article className="card-lift relative flex overflow-hidden rounded-lg border border-line bg-white">
      <span className="w-1.5 shrink-0" style={{ background: categoryColor(event.eventType) }} aria-hidden="true" />
      <div className="flex w-20 shrink-0 flex-col items-center justify-center border-r border-line bg-surface px-2 py-4 text-center sm:w-24">
        <span className="text-3xl leading-none font-extrabold text-ink">{day}</span>
        <span className="mt-1 text-xs font-bold tracking-wider text-muted">{month}</span>
        <span className="text-xs text-muted">{year}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <CategoryTag category={event.eventType} />
          {event.seriesLabel && <span className="text-xs font-medium text-muted">· {event.seriesLabel}</span>}
        </div>
        <H className="text-lg leading-snug font-bold">
          <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0 hover:text-ieee-blue">
            {event.title}
          </Link>
        </H>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          {time && (
            <li className="flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              {time}
            </li>
          )}
          {where && (
            <li className="flex items-center gap-1.5">
              {event.mode === "online" ? (
                <Video className="h-4 w-4" aria-hidden="true" />
              ) : (
                <MapPin className="h-4 w-4" aria-hidden="true" />
              )}
              {where}
            </li>
          )}
        </ul>
        {event.speakers.length > 0 && (
          <p className="text-sm">
            <span className="font-semibold text-ink">{event.speakers.map((s) => s.name).join(", ")}</span>
            {event.speakers[0].affiliation && <span className="text-muted"> · {event.speakers[0].affiliation}</span>}
          </p>
        )}
      </div>
      {event.poster && !compact && (
        <div className="relative hidden w-44 shrink-0 border-l border-line md:block lg:w-52">
          <Image
            src={event.poster.url}
            alt=""
            fill
            sizes="208px"
            className="object-cover object-top"
          />
        </div>
      )}
    </article>
  );
}
