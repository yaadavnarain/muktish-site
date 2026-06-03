"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useRef } from "react";

const PREMIUM_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const DURATION = 0.42;
const STAGGER = 0.08;

export function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.0, 0.4]);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden"
    >
      {/* TODO: swap this CSS gradient placeholder for a cinematic photo or
          looping video of Muktish (e.g. /public/images/hero-muktish.jpg or .mp4). */}
      <motion.div
        aria-hidden
        style={reduced ? undefined : { y: bgY }}
        className="absolute inset-0 -z-20"
      >
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(245,200,66,0.18)_0%,rgba(10,10,10,0)_55%),radial-gradient(80%_60%_at_30%_100%,rgba(52,211,153,0.10)_0%,rgba(10,10,10,0)_60%),linear-gradient(180deg,#0E0E0E_0%,#0A0A0A_60%,#070707_100%)]" />
      </motion.div>

      {/* grain layer */}
      <div className="absolute inset-0 -z-10 grain" aria-hidden />

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
          className="text-[0.65rem] sm:text-xs tracking-[0.35em] uppercase text-ink/55"
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
          className="heading mt-6 text-balance text-4xl sm:text-6xl md:text-7xl leading-[1.05] text-ink"
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
          className="mt-6 max-w-xl text-base sm:text-lg text-ink/70"
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
          <a
            href="https://wa.me/23055111364"
            className="group inline-flex h-12 min-h-[44px] items-center justify-center gap-2 rounded-full bg-gold px-7 text-sm sm:text-base font-semibold text-bg shadow-[0_10px_40px_-10px_rgba(245,200,66,0.6)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
          >
            Chat with me
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>

          {/* TODO: replace # with the anonymous-message URL */}
          <a
            href="#"
            className="inline-flex h-12 min-h-[44px] items-center text-sm sm:text-base text-ink/80 underline-offset-[6px] hover:text-gold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded transition-colors"
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
