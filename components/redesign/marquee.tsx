"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { FadeIn } from "@/components/redesign/fade-in";

type Tile = {
  views?: string;
  label?: string;
  gradient: string;
  branding?: boolean;
};

// Real view counts from the current site's TikTok set; the rest are
// placeholders (no thumbnail images exist in /public yet) + branding tiles.
const ROW_ONE: Tile[] = [
  {
    views: "106.2K",
    gradient:
      "linear-gradient(135deg,#1a1208 0%,#3a2a12 35%,#7a5a1d 60%,#1c140a 100%)",
  },
  { branding: true, label: "10M+ Views", gradient: "linear-gradient(135deg,#131313 0%,#1d1a10 100%)" },
  {
    views: "108.4K",
    gradient:
      "linear-gradient(135deg,#0a1a14 0%,#143020 40%,#1f5a3a 65%,#0a1a14 100%)",
  },
  { label: "REPLACE — TikTok thumbnail", gradient: "linear-gradient(135deg,#101010 0%,#181818 100%)" },
  {
    views: "76.9K",
    gradient:
      "linear-gradient(135deg,#100a18 0%,#241432 35%,#5a2a7a 60%,#120a18 100%)",
  },
  { branding: true, label: "10M+ Views", gradient: "linear-gradient(135deg,#131313 0%,#10160f 100%)" },
  { label: "REPLACE — TikTok thumbnail", gradient: "linear-gradient(135deg,#141414 0%,#0e0e0e 100%)" },
];

const ROW_TWO: Tile[] = [
  { label: "REPLACE — TikTok thumbnail", gradient: "linear-gradient(135deg,#121212 0%,#191919 100%)" },
  {
    views: "76.9K",
    gradient:
      "linear-gradient(135deg,#241432 0%,#100a18 45%,#5a2a7a 80%,#120a18 100%)",
  },
  { branding: true, label: "10M+ Views", gradient: "linear-gradient(135deg,#1d1a10 0%,#131313 100%)" },
  {
    views: "106.2K",
    gradient:
      "linear-gradient(135deg,#3a2a12 0%,#1a1208 40%,#7a5a1d 75%,#1c140a 100%)",
  },
  { label: "REPLACE — TikTok thumbnail", gradient: "linear-gradient(135deg,#151515 0%,#0f0f0f 100%)" },
  {
    views: "108.4K",
    gradient:
      "linear-gradient(135deg,#143020 0%,#0a1a14 40%,#1f5a3a 70%,#0a1a14 100%)",
  },
  { branding: true, label: "10M+ Views", gradient: "linear-gradient(135deg,#131313 0%,#161006 100%)" },
];

function TileCard({ tile }: { tile: Tile }) {
  return (
    <div
      className="relative h-[180px] w-[280px] shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/5 sm:h-[270px] sm:w-[420px]"
      style={{ background: tile.gradient }}
    >
      {tile.branding ? (
        <div className="flex h-full w-full items-center justify-center">
          <span className="heading text-2xl gold-gradient-text sm:text-4xl">
            {tile.label}
          </span>
        </div>
      ) : tile.views ? (
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent p-4">
          <span className="heading text-lg text-ink sm:text-2xl">
            {tile.views}
          </span>
          <span className="text-[0.55rem] uppercase tracking-[0.25em] text-ink/60">
            Views
          </span>
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center p-4 text-center">
          <span className="text-[0.6rem] uppercase tracking-[0.25em] text-ink/35">
            {tile.label}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Scroll-driven double marquee: row 1 drifts right, row 2 drifts left, both
 * proportional to scroll position (offset = (scrollY - sectionTop +
 * innerHeight) * 0.3). Tiles are tripled and the offset wrapped modulo one
 * set-width so the loop is seamless. Static under reduced motion.
 */
export function Marquee() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const rowOneRef = useRef<HTMLDivElement | null>(null);
  const rowTwoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    const r1 = rowOneRef.current;
    const r2 = rowTwoRef.current;
    if (!section || !r1 || !r2) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const sectionTop = section.offsetTop;
      const offset =
        (window.scrollY - sectionTop + window.innerHeight) * 0.3;

      const w1 = r1.scrollWidth / 3;
      const w2 = r2.scrollWidth / 3;
      // Wrap into [-setWidth, 0) so the tripled strip always covers the view.
      const x1 = -w1 + (((offset % w1) + w1) % w1); // drifts right
      const x2 = -(((offset % w2) + w2) % w2); // drifts left
      r1.style.transform = `translate3d(${x1}px,0,0)`;
      r2.style.transform = `translate3d(${x2}px,0,0)`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const tripleOne = [...ROW_ONE, ...ROW_ONE, ...ROW_ONE];
  const tripleTwo = [...ROW_TWO, ...ROW_TWO, ...ROW_TWO];

  return (
    <section
      id="content"
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-bg py-16 sm:py-24"
    >
      <FadeIn y={24}>
        <p className="mx-auto max-w-6xl px-5 text-[0.65rem] uppercase tracking-[0.3em] text-ink/60 sm:px-8 sm:text-xs">
          Content Creator on TikTok — 10M+ views since 28 April 2024.
        </p>
      </FadeIn>

      <div className="mt-10 space-y-4 sm:space-y-6">
        <div
          ref={rowOneRef}
          className="flex gap-4 sm:gap-6"
          style={{ willChange: "transform" }}
        >
          {tripleOne.map((t, i) => (
            <TileCard key={`r1-${i}`} tile={t} />
          ))}
        </div>
        <div
          ref={rowTwoRef}
          className="flex gap-4 sm:gap-6"
          style={{ willChange: "transform" }}
        >
          {tripleTwo.map((t, i) => (
            <TileCard key={`r2-${i}`} tile={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
