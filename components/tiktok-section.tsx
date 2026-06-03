"use client";

import { Play, Pin } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion-primitives";

type Video = {
  views: string;
  pinned: boolean;
  // TODO: replace `href` with the real TikTok URL and `gradient` with the
  // actual thumbnail image path in /public/images/tiktok-N.jpg
  href: string;
  gradient: string;
};

const videos: Video[] = [
  {
    views: "106.2K",
    pinned: true,
    href: "#",
    gradient:
      "linear-gradient(135deg,#1a1208 0%,#3a2a12 35%,#7a5a1d 60%,#1c140a 100%)",
  },
  {
    views: "108.4K",
    pinned: true,
    href: "#",
    gradient:
      "linear-gradient(135deg,#0a1a14 0%,#143020 40%,#1f5a3a 65%,#0a1a14 100%)",
  },
  {
    views: "76.9K",
    pinned: false,
    href: "#",
    gradient:
      "linear-gradient(135deg,#100a18 0%,#241432 35%,#5a2a7a 60%,#120a18 100%)",
  },
];

export function TikTokSection() {
  return (
    <section
      id="tiktok"
      className="relative w-full bg-gradient-to-b from-bg via-[#080808] to-bg py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <h2 className="heading text-center text-3xl sm:text-5xl gold-gradient-text">
            Content Creator on TikTok
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-3 text-center text-base sm:text-lg text-ink/65">
            10M+ Views Since 28th of April 2024
          </p>
        </Reveal>

        <Stagger
          className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-7"
          staggerChildren={0.09}
        >
          {videos.map((v, i) => (
            <StaggerItem key={i}>
              <VideoCard video={v} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function VideoCard({ video }: { video: Video }) {
  const reduced = useReducedMotion();

  return (
    <a
      href={video.href}
      aria-label={`Watch TikTok video — ${video.views} views`}
      className="group relative block overflow-hidden rounded-2xl ring-1 ring-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
    >
      <div className="relative w-full" style={{ aspectRatio: "9 / 16" }}>
        {/* TODO: swap the gradient `background` for <Image src="/images/tiktok-N.jpg" .../> */}
        <motion.div
          className="absolute inset-0"
          style={{ background: video.gradient }}
          whileHover={reduced ? undefined : { scale: 1.03 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* film grain */}
        <div className="absolute inset-0 grain" aria-hidden />

        {/* bottom gradient scrim */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
        />

        {/* pinned tag */}
        {video.pinned && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[0.6rem] tracking-[0.18em] uppercase text-gold ring-1 ring-inset ring-gold/30 backdrop-blur-sm">
            <Pin className="h-3 w-3" />
            Pinned
          </span>
        )}

        {/* play button */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/30 backdrop-blur-md"
          animate={
            reduced
              ? undefined
              : { boxShadow: [
                  "0 0 0 0 rgba(245,200,66,0.0)",
                  "0 0 0 12px rgba(245,200,66,0.0)",
                ] }
          }
          whileHover={reduced ? undefined : { scale: 1.08 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <Play className="h-6 w-6 text-ink" fill="currentColor" />
        </motion.div>

        {/* view count */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
          <span className="heading text-xl sm:text-2xl text-ink">
            {video.views}
          </span>
          <span className="text-[0.6rem] tracking-[0.25em] uppercase text-ink/65">
            Views
          </span>
        </div>
      </div>
    </a>
  );
}
