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
import { MagneticButton } from "@/components/magnetic-button";

// The 3D coin scene is heavy (three.js + postprocessing). Load it lazily,
// client-only (ssr: false) so it never blocks server render or LCP. While it
// loads, the gold aurora gradient behind it serves as the poster/fallback.
const HeroScene = dynamic(() => import("@/components/hero-scene"), {
  ssr: false,
  loading: () => null,
});

// Static premium still of the settled gold coin — shown for reduced-motion,
// no-WebGL and low-power devices (no live render, no spin).
const COIN_FALLBACK = "/coin/coin-fallback.jpg";

// Cinematic portrait of Muktish living quietly behind the hero. Used as a
// CSS background-image (no broken-image icon if the file is absent) with a
// cool duotone, edge fade and a slow "breathing" drift so it reads as a living
// presence behind the coin. Drop the photo at public/images/muktish.jpg to
// activate it; until then the hero shows the gradient + coin only.
const FOUNDER_IMG = "/images/muktish.png";

/** Cheap one-shot WebGL capability + low-power probe (client only). */
function detectCapability(): { webgl: boolean; lowPower: boolean } {
  if (typeof window === "undefined") return { webgl: false, lowPower: true };
  let webgl = false;
  try {
    const c = document.createElement("canvas");
    webgl = !!(
      c.getContext("webgl2") ||
      c.getContext("webgl") ||
      c.getContext("experimental-webgl")
    );
  } catch {
    webgl = false;
  }
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 8;
  const mem = nav.deviceMemory ?? 8;
  // Only the genuinely weak devices fall back; mid-range phones keep live 3D.
  const lowPower = cores <= 2 || mem <= 2;
  return { webgl, lowPower };
}

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

  // Desktop gets full 3D; phones get a lighter pass (capped DPR, fewer
  // segments, no DOF). Width drives quality, not whether 3D runs at all.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Capability probe runs once on the client; until then we assume capable so
  // we never flash the fallback on a machine that can render.
  const [cap, setCap] = useState<{ webgl: boolean; lowPower: boolean }>({
    webgl: true,
    lowPower: false,
  });
  useEffect(() => setCap(detectCapability()), []);

  const quality: "high" | "low" = isDesktop ? "high" : "low";
  // Live 3D unless motion is disabled, WebGL is missing, or the device is weak.
  const enable3D = !reduced && cap.webgl && !cap.lowPower;

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

      {/* ---- Founder portrait backdrop — a dark, desaturated photo of Muktish
              anchored to the right and dissolving into the black, with a slow
              "breathing" drift so it reads as a living presence beside the coin.
              Background-image so a missing file just shows nothing. ---- */}
      <motion.div
        aria-hidden
        className="absolute inset-y-0 right-0 -z-25 hidden w-[78%] sm:block"
        style={{
          backgroundImage: `url(${FOUNDER_IMG})`,
          backgroundSize: "cover",
          backgroundPosition: "center 22%",
          opacity: 0.32,
          filter: "grayscale(1) contrast(1.12) brightness(0.42)",
          maskImage:
            "radial-gradient(85% 120% at 80% 36%, #000 6%, transparent 62%)",
          WebkitMaskImage:
            "radial-gradient(85% 120% at 80% 36%, #000 6%, transparent 62%)",
        }}
        animate={reduced ? undefined : { scale: [1, 1.05, 1], x: [0, -10, 0] }}
        transition={{ duration: 32, ease: "easeInOut", repeat: Infinity }}
      />
      {/* cool teal tint blending the portrait into the brand palette */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 -z-25 hidden w-[78%] sm:block"
        style={{
          background:
            "radial-gradient(70% 100% at 80% 38%, rgba(52,211,153,0.12) 0%, rgba(10,10,10,0) 58%)",
          mixBlendMode: "screen",
        }}
      />

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

      {/* ---- 3D coin scene — centred behind the text, pointer-events:none so it
              never blocks the CTAs. Aurora above stays visible as the poster
              until it loads. Desktop = full quality, phones = lighter pass. ---- */}
      {enable3D ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <HeroScene quality={quality} />
          </div>
          {/* legibility scrim over the coin — darker toward the centred text so
              the headline, subline, CTAs and cue stay fully legible */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_50%_48%,rgba(0,0,0,0.36)_0%,rgba(0,0,0,0.3)_42%,rgba(0,0,0,0.5)_100%)]"
          />
        </>
      ) : (
        <>
          {/* Static premium still of the gold coin — reduced-motion / no-WebGL /
              low-power. Centred behind the text, no spin. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={COIN_FALLBACK}
              alt=""
              className="w-[min(70vw,420px)] max-w-[70vw]"
              style={{
                maskImage:
                  "radial-gradient(circle at 50% 50%, #000 58%, transparent 75%)",
                WebkitMaskImage:
                  "radial-gradient(circle at 50% 50%, #000 58%, transparent 75%)",
              }}
            />
          </div>
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(120%_100%_at_50%_48%,rgba(0,0,0,0.36)_0%,rgba(0,0,0,0.3)_42%,rgba(0,0,0,0.5)_100%)]"
          />
        </>
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
          className="heading mt-5 text-balance text-4xl leading-[1.05] text-ink sm:text-6xl md:text-7xl"
        >
          Guiding Youth to Live a{" "}
          <span className="gold-gradient-text">Fulfilled</span> Life.
        </motion.h1>

        {/* The hook — the whole coin animation is this line. Kept prominent. */}
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{
            duration: DURATION,
            ease: PREMIUM_EASE,
            delay: STAGGER * 1.6,
          }}
          className="heading mt-5 text-lg leading-snug text-ink/90 sm:text-2xl md:text-[1.7rem]"
          style={{ textShadow: "0 1px 24px rgba(245,200,66,0.18)" }}
        >
          It started with a{" "}
          <span className="gold-gradient-text">Rs 5 coin</span>. It doesn&rsquo;t
          end there.
        </motion.p>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{
            duration: DURATION,
            ease: PREMIUM_EASE,
            delay: STAGGER * 2.4,
          }}
          className="mt-5 max-w-xl text-sm text-ink/65 sm:text-base"
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
          className="mt-8 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row sm:gap-7"
        >
          <MagneticButton
            href="https://wa.me/23055111364"
            className="group inline-flex h-12 min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-gold px-7 text-sm font-semibold text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint/70 sm:w-auto sm:text-base"
          >
            Chat with me
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </MagneticButton>

          {/* TODO: replace # with the anonymous-message URL */}
          <a
            href="#"
            className="inline-flex h-12 min-h-[44px] items-center rounded text-sm text-ink/80 underline-offset-[6px] transition-colors hover:text-mint hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint/60 sm:text-base"
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
