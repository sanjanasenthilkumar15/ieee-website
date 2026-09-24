"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useState } from "react";
import { instagramEmbed, youtubeId } from "@/lib/video";

/**
 * Privacy-friendly video: shows a thumbnail and only loads the YouTube or
 * Instagram player after a click (no third-party requests until then).
 */
export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const [active, setActive] = useState(false);
  const yt = youtubeId(url);
  const ig = yt ? null : instagramEmbed(url);

  if (ig) {
    return (
      <div className="overflow-hidden rounded-lg border border-line bg-white">
        <iframe src={ig} title={title} loading="lazy" className="aspect-[4/5] w-full" allowFullScreen />
      </div>
    );
  }
  if (!yt) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-line p-4 font-semibold text-ieee-blue">
        {title}
      </a>
    );
  }
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-ink">
      {active ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button type="button" onClick={() => setActive(true)} className="group absolute inset-0 h-full w-full" aria-label={`Play video: ${title}`}>
          <Image src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`} alt="" fill unoptimized className="object-cover opacity-85 transition-opacity group-hover:opacity-100" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ieee-blue text-white shadow-lg transition-transform group-hover:scale-105">
              <Play className="ml-1 h-7 w-7" fill="currentColor" aria-hidden="true" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
