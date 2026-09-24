"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { CrestMotif } from "@/components/ui/CrestMotif";

/**
 * Home hero. The only load animation on the site: content fades and rises
 * in once, in sequence. The oversized crest motif sits behind as texture.
 */
export function Hero({
  branchName,
  tagline,
  branchCode,
  established,
}: {
  branchName: string;
  tagline?: string;
  branchCode: string;
  established: number;
}) {
  const reduce = useReducedMotion();
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: 0.05 } },
  };
  const item: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
      };

  return (
    <section className="relative isolate overflow-hidden bg-ieee-blue-dark text-white">
      {/* Signature: oversized crest motif watermark */}
      <CrestMotif className="pointer-events-none absolute top-1/2 -left-40 -z-10 h-[820px] w-[820px] -translate-y-1/2 text-white opacity-[0.07] sm:-left-24 lg:left-[-6%]" />
      <div className="absolute inset-y-0 left-0 w-1.5 bg-rmkec-green" aria-hidden="true" />

      <Container className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:py-24">
        <motion.div className="lg:col-span-7" variants={container} initial="hidden" animate="show">
          <motion.p variants={item} className="text-sm font-semibold tracking-wider text-white/75 uppercase">
            {branchCode} · Established {established}
          </motion.p>
          <motion.h1
            variants={item}
            className="mt-4 text-4xl leading-[1.04] font-extrabold text-white sm:text-5xl lg:text-6xl"
          >
            {branchName}
          </motion.h1>
          {tagline && (
            <motion.p variants={item} className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
              {tagline}
            </motion.p>
          )}
          <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/join"
              className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-ieee-blue-dark transition-colors hover:bg-ieee-blue-light"
            >
              Join the Branch <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-md border border-white/35 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              Explore events
            </Link>
          </motion.div>
        </motion.div>

        <motion.figure
          className="relative lg:col-span-5"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-2xl ring-1 ring-white/15">
            <Image
              src="/images/execom-2026-group.jpg"
              alt="The founding 2026 Execom of IEEE SB RMKEC with faculty coordinators"
              fill
              priority
              sizes="(min-width: 1024px) 480px, 100vw"
              className="photo-grade object-cover"
            />
          </div>
          <figcaption className="mt-3 flex items-center gap-2 text-sm text-white/70">
            <span className="h-3 w-3 rounded-full bg-rmkec-green" aria-hidden="true" />
            Founding Execom, 2026
          </figcaption>
        </motion.figure>
      </Container>
    </section>
  );
}
