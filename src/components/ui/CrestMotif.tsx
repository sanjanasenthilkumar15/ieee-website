/**
 * Line drawing of the RMKEC crest's central motif — a toothed gear, three
 * atomic orbits and a lightning bolt — used as a large, faint watermark
 * behind the home hero. Drawn as SVG so it stays crisp at any size.
 */
function gearPath(cx: number, cy: number, rOuter: number, rInner: number, teeth: number) {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  const tooth = step * 0.42; // tooth width at the tip
  const flank = step * 0.08; // slope of each tooth side
  for (let i = 0; i < teeth; i++) {
    const a = i * step - Math.PI / 2;
    const seq: [number, number][] = [
      [a, rInner],
      [a + flank, rOuter],
      [a + flank + tooth, rOuter],
      [a + 2 * flank + tooth, rInner],
    ];
    for (const [ang, r] of seq) pts.push(`${(cx + r * Math.cos(ang)).toFixed(2)},${(cy + r * Math.sin(ang)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

const GEAR = gearPath(200, 200, 190, 164, 16);

export function CrestMotif({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeLinejoin="round">
        <path d={GEAR} strokeWidth="3" />
        <circle cx="200" cy="200" r="150" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="58" strokeWidth="3" />
        {[0, 60, 120].map((deg) => (
          <ellipse key={deg} cx="200" cy="200" rx="128" ry="46" strokeWidth="2.5" transform={`rotate(${deg} 200 200)`} />
        ))}
      </g>
      <g fill="currentColor">
        {[
          [328, 200],
          [136, 311],
          [136, 89],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="9" />
        ))}
        {/* Lightning bolt across the centre */}
        <path d="M96 238 L214 190 L196 212 L304 162 L186 214 L204 192 Z" />
      </g>
    </svg>
  );
}
