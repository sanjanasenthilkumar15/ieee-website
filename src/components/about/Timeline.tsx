/**
 * History timeline. Horizontal on desktop, vertical on mobile.
 * The line always runs on past the latest milestone (dashed, fading out) so
 * a single milestone reads as the start of something ongoing.
 * New milestones added in Site Settings slot in automatically.
 */
type Milestone = { year: number; title: string; description?: string };

export function Timeline({ milestones }: { milestones: Milestone[] }) {
  const items = [...milestones].sort((a, b) => a.year - b.year);
  if (!items.length) return null;

  return (
    <div>
      {/* Desktop: horizontal */}
      <ol className="relative hidden md:flex">
        {items.map((m, i) => (
          <li key={`${m.year}-${i}`} className="relative flex-1 pr-8" style={{ maxWidth: items.length === 1 ? "38%" : undefined }}>
            <div className="relative flex h-10 items-center">
              {/* segment to the next milestone */}
              <span className="absolute top-1/2 -right-8 left-5 h-[3px] -translate-y-1/2 bg-ieee-blue" aria-hidden="true" />
              <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-ieee-blue ring-4 ring-ieee-blue-light">
                <span className="h-3 w-3 rounded-full bg-white" />
              </span>
            </div>
            <p className="mt-5 text-4xl font-extrabold text-ieee-blue">{m.year}</p>
            <p className="mt-1 text-lg font-bold text-ink">{m.title}</p>
            {m.description && <p className="mt-2 max-w-sm text-sm leading-relaxed">{m.description}</p>}
          </li>
        ))}
        {/* Open-ended continuation */}
        <li className="relative flex-1" aria-hidden="true">
          <div className="relative flex h-10 items-center">
            <span className="absolute top-1/2 left-0 h-[3px] w-full -translate-y-1/2 bg-[repeating-linear-gradient(90deg,var(--color-ieee-blue)_0_10px,transparent_10px_18px)] [mask-image:linear-gradient(90deg,black_30%,transparent)]" />
            <span className="relative ml-[35%] h-4 w-4 rounded-full border-2 border-dashed border-ieee-blue/60 bg-white" />
          </div>
          <p className="mt-5 ml-[35%] -translate-x-1/4 text-sm font-semibold tracking-wider text-muted uppercase">
            The story continues
          </p>
        </li>
      </ol>

      {/* Mobile: vertical */}
      <ol className="relative md:hidden">
        {items.map((m, i) => (
          <li key={`${m.year}-${i}`} className="relative pb-10 pl-14">
            <span className="absolute top-5 bottom-0 left-[19px] w-[3px] bg-ieee-blue" aria-hidden="true" />
            <span className="absolute top-0 left-0 flex h-10 w-10 items-center justify-center rounded-full bg-ieee-blue ring-4 ring-ieee-blue-light" aria-hidden="true">
              <span className="h-3 w-3 rounded-full bg-white" />
            </span>
            <p className="text-3xl leading-10 font-extrabold text-ieee-blue">{m.year}</p>
            <p className="mt-1 text-lg font-bold text-ink">{m.title}</p>
            {m.description && <p className="mt-2 text-sm leading-relaxed">{m.description}</p>}
          </li>
        ))}
        <li className="relative h-24 pl-14" aria-hidden="true">
          <span className="absolute top-0 left-[19px] h-full w-[3px] bg-[repeating-linear-gradient(180deg,var(--color-ieee-blue)_0_10px,transparent_10px_18px)] [mask-image:linear-gradient(180deg,black_20%,transparent)]" />
          <span className="absolute top-10 left-[13px] h-4 w-4 rounded-full border-2 border-dashed border-ieee-blue/60 bg-white" />
          <p className="pt-9 text-sm font-semibold tracking-wider text-muted uppercase">The story continues</p>
        </li>
      </ol>
    </div>
  );
}
