"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Img } from "@/lib/content/types";

type Photo = Img & { caption?: string };

/**
 * Masonry photo grid with an accessible lightbox (native <dialog>: focus
 * trapping and Esc come for free; arrow keys move between photos).
 */
export function PhotoGrid({ photos, columns = "sm:columns-2 lg:columns-3" }: { photos: Photo[]; columns?: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const open = (i: number) => {
    setIndex(i);
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const onClose = () => setIndex(null);
    el.addEventListener("keydown", onKey);
    el.addEventListener("close", onClose);
    return () => {
      el.removeEventListener("keydown", onKey);
      el.removeEventListener("close", onClose);
    };
  }, [step]);

  const current = index === null ? null : photos[index];

  return (
    <>
      <ul className={`columns-1 gap-4 ${columns}`}>
        {photos.map((p, i) => (
          <li key={`${p.url}-${i}`} className="mb-4 break-inside-avoid">
            <button
              type="button"
              onClick={() => open(i)}
              className="group block w-full overflow-hidden rounded-md bg-line focus-visible:outline-offset-4"
              aria-label={`Open photo: ${p.alt || p.caption || `photo ${i + 1}`}`}
            >
              <Image
                src={p.url}
                alt={p.alt}
                width={p.width}
                height={p.height}
                sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                placeholder={p.lqip ? "blur" : "empty"}
                blurDataURL={p.lqip}
                className="photo-grade h-auto w-full transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </button>
            {p.caption && <p className="mt-1.5 text-sm text-muted">{p.caption}</p>}
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label="Photo viewer"
        className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/90"
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        {current && (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 sm:p-10" onClick={(e) => e.target === e.currentTarget && close()}>
            <div className="relative h-full max-h-[80vh] w-full max-w-6xl">
              <Image src={current.url} alt={current.alt} fill sizes="100vw" className="object-contain" />
            </div>
            <p className="mt-4 max-w-3xl text-center text-sm text-white/85">
              {current.caption || current.alt}
              <span className="ml-2 text-white/50">
                {index! + 1} / {photos.length}
              </span>
            </p>
            <button
              type="button"
              onClick={close}
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-6"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-6"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
              </>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
