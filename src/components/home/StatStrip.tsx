"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Container } from "@/components/layout/Container";

export type Stat = { label: string; value: number; suffix?: string };

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduce) {
      el.textContent = `${value}${suffix}`;
      return;
    }
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = `${Math.round(v)}${suffix}`),
    });
    return () => controls.stop();
  }, [inView, value, suffix, reduce]);

  // Server-render the final value so it is correct without JS and for crawlers.
  return (
    <span ref={ref} className="tabular-nums">
      {value}
      {suffix}
    </span>
  );
}

/** Numbers strip under the hero. Counts up once when scrolled into view. */
export function StatStrip({ stats: all }: { stats: Stat[] }) {
  const stats = all.slice(0, 4);
  if (!stats.length) return null;
  return (
    <section aria-label="The branch in numbers" className="border-b border-line bg-white">
      <Container>
        <dl
          className={`grid divide-line sm:divide-x ${
            { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" }[stats.length] ?? "grid-cols-2 sm:grid-cols-4"
          }`}
        >
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center px-2 py-8 text-center sm:py-10">
              <dt className="order-2 mt-1 text-xs font-semibold tracking-wider text-muted uppercase sm:text-sm">
                {s.label}
              </dt>
              <dd className="order-1 text-4xl font-extrabold text-ieee-blue sm:text-5xl">
                <CountUp value={s.value} suffix={s.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
