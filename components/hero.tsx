"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Embers } from "@/components/embers";
import { MagneticButton } from "@/components/magnetic-button";

// The 3D portal scene is heavy (three.js + postprocessing). Load it lazily,
// client-only (ssr: false) so it never blocks server render or LCP. While it
// loads, the gold aurora gradient behind it serves as the poster/fallback.
const HeroScene = dynamic(() => import("@/components/hero-scene"), {
  ssr: false,
  loading: () => null,
});

const PREMIUM_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const DURATION = 0.42;
const STAGGER = 0.08;

/**
 * Optional real hero of Muktish. Leave as `null` to show the pure animated
 * aurora background. When set, the media renders behind a dark overlay and the
 * aurora steps back to a subtle accent.
 *
 * TODO: drop in a real photo or looping video of Muktish, e.g.
 *   const HERO_MEDIA: HeroMedia = { type: "image", src: "/images/hero-muktish.jpg" };
 *   const HERO_MEDIA: HeroMedia = { type: "video", src: "/videos/hero-muktish.mp4" };
 * (place the file under /public/images or /public/videos).
 */
type HeroMedia = { type: "image" | "video"; src: string };
const HERO_MEDIA: HeroMedia | null = null;

export function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const hasMedia = HERO_MEDIA !== null;

  // Only mount the 3D Canvas on >=768px AND when motion is allowed. On phones
  // (too heavy) or with prefers-reduced-motion, the static aurora stands in.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const enable3D = isDesktop && !reduced && !hasMedia;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.0, 0.45]);

  // Aurora is bold on its own; it softens to an accent when real media is present.
  const auroraOpacity = hasMedia ? 0.5 : 1;

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[88svh] w-full items-center justify-center overflow-hidden"
    >
      {/* ---- Base layer: dark gradient + optional real media ---- */}
      <motion.div
        aria-hidden
        style={reduced ? undefined : { y: bgY }}
        className="absolute inset-0 -z-30"
      >
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(245,200,66,0.12)_0%,rgba(10,10,10,0)_55%),linear-gradient(180deg,#0E0E0E_0%,#0A0A0A_60%,#070707_100%)]" />
        {HERO_MEDIA &&
          (HERO_MEDIA.type === "video" ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={HERO_MEDIA.src}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="absolute inset-0 h-full w-full object-cover"
              src={HERO_MEDIA.src}
              alt="Muktish"
            />
          ))}
        {/* dark overlay so foreground text stays legible over any media */}
        {hasMedia && <div className="absolute inset-0 bg-black/55" />}
      </motion.div>

      {/* ---- Aurora gradient mesh (two slow-drifting layers) ---- */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20"
        style={{ opacity: auroraOpacity }}
      >
        <div
          className="aurora-layer aurora-a absolute inset-[-15%]"
          style={{
            background:
              "radial-gradient(36% 44% at 28% 26%, rgba(245,200,66,0.16) 0%, rgba(10,10,10,0) 58%), radial-gradient(40% 48% at 76% 24%, rgba(184,136,28,0.12) 0%, rgba(10,10,10,0) 60%)",
          }}
        />
        <div
          className="aurora-layer aurora-b absolute inset-[-15%]"
          style={{
            background:
              "radial-gradient(38% 46% at 18% 74%, rgba(245,200,66,0.1) 0%, rgba(10,10,10,0) 62%)",
          }}
        />
      </div>

      {/* ---- 3D portal scene — background layer, pointer-events:none so it never
              blocks the CTAs. Aurora above stays visible as the poster until it
              loads. Mounted only when enable3D is true. ---- */}
      {enable3D && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <HeroScene />
          </div>
          {/* legibility scrim over the 3D — ~45–55% black, darker toward the
              centred text so the headline, subline, CTAs and cue stay legible */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(115%_95%_at_50%_50%,rgba(0,0,0,0.52)_0%,rgba(0,0,0,0.44)_45%,rgba(0,0,0,0.5)_100%)]"
          />
        </>
      )}

      {/* ---- Ember/particle field — only when the 3D scene is NOT active, to keep
              the composition calm. (Desktop + motion-allowed; paused offscreen.) ---- */}
      {!enable3D && (
        <div className="absolute inset-0 -z-10 hidden md:block">
          <Embers />
        </div>
      )}

      {/* grain */}
      <div className="absolute inset-0 -z-10 grain" aria-hidden />

      {/* soft radial vignette focusing the centre */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_50%_45%,rgba(0,0,0,0)_38%,rgba(0,0,0,0.55)_100%)]"
      />

      {/* darkening overlay on scroll */}
      <motion.div
        aria-hidden
        style={reduced ? undefined : { opacity: overlayOpacity }}
        className="absolute inset-0 -z-10 bg-black/40"
      />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: DURATION, ease: PREMIUM_EASE, delay: 0 }}
          className="px-2 text-[0.6rem] uppercase tracking-[0.2em] text-ink/55 sm:text-xs sm:tracking-[0.35em]"
        >
          Entrepreneur · Content Creator · Numerologist
        </motion.p>

        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{
            duration: DURATION,
            ease: PREMIUM_EASE,
            delay: STAGGER,
          }}
          className="heading mt-6 text-balance text-4xl leading-[1.05] text-ink sm:text-6xl md:text-7xl"
        >
          Guiding Youth to Live a{" "}
          <span className="gold-gradient-text">Fulfilled</span> Life.
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{
            duration: DURATION,
            ease: PREMIUM_EASE,
            delay: STAGGER * 2,
          }}
          className="mt-6 max-w-xl text-base text-ink/70 sm:text-lg"
        >
          A decade of entrepreneurship turned into a toolkit for the next
          generation — built for those who refuse to wait their turn.
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{
            duration: DURATION,
            ease: PREMIUM_EASE,
            delay: STAGGER * 3,
          }}
          className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:gap-7"
        >
          <MagneticButton
            href="https://wa.me/23055111364"
            className="group inline-flex h-12 min-h-[44px] items-center justify-center gap-2 rounded-full bg-gold px-7 text-sm font-semibold text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 sm:text-base"
          >
            Chat with me
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </MagneticButton>

          {/* TODO: replace # with the anonymous-message URL */}
          <a
            href="#"
            className="inline-flex h-12 min-h-[44px] items-center rounded text-sm text-ink/80 underline-offset-[6px] transition-colors hover:text-gold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 sm:text-base"
          >
            Send me an anonymous message
          </a>
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div
        aria-hidden
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-ink/50"
        initial={reduced ? false : { opacity: 0 }}
        animate={
          reduced
            ? undefined
            : {
                opacity: [0.3, 0.8, 0.3],
                y: [0, 6, 0],
              }
        }
        transition={{
          duration: 2.4,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 0.8,
        }}
      >
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </section>
  );
}
