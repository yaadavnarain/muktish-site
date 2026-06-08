"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/motion-primitives";

type Testimonial = { quote: string; name: string };

// TODO: add more testimonials here as they come in.
const testimonials: Testimonial[] = [
  {
    quote:
      "Muktish is a young ambitious entrepreneur who has insight and a vision. I do trust him.",
    name: "TOOSHMA",
  },
];

const AUTOPLAY_MS = 6000;
const PREMIUM_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Testimonials() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = testimonials.length;

  useEffect(() => {
    if (paused || count < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, count]);

  const go = (dir: 1 | -1) => {
    setIndex((i) => (i + dir + count) % count);
  };

  const active = testimonials[index];

  return (
    <section
      id="testimonials"
      className="relative w-full bg-gradient-to-b from-bg via-[#080808] to-bg py-20 sm:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <h2 className="heading text-center text-3xl sm:text-5xl gold-gradient-text">
            What People Say
          </h2>
        </Reveal>

        <div className="relative mt-14 sm:mt-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 text-gold/15"
          >
            <Quote className="h-16 w-16 sm:h-20 sm:w-20" />
          </div>

          <div className="relative min-h-[220px] sm:min-h-[200px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={index}
                initial={
                  reduced ? false : { opacity: 0, x: 24 }
                }
                animate={
                  reduced ? { opacity: 1 } : { opacity: 1, x: 0 }
                }
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: -24 }}
                transition={{ duration: 0.42, ease: PREMIUM_EASE }}
                className="px-2 sm:px-6 text-center"
              >
                <blockquote className="text-balance text-lg sm:text-2xl leading-relaxed text-ink/90">
                  &ldquo;{active.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-8 text-[0.7rem] tracking-[0.3em] uppercase text-gold/80">
                  — {active.name}
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          {count > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous testimonial"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-ink/75 hover:text-gold hover:border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div
                className="flex h-1 w-32 items-center gap-1.5 sm:w-40"
                role="tablist"
                aria-label="Testimonial progress"
              >
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Testimonial ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className="group flex-1 py-3 focus-visible:outline-none"
                  >
                    <span
                      className={`block h-0.5 w-full rounded-full transition-colors ${
                        i === index
                          ? "bg-gold"
                          : "bg-white/15 group-hover:bg-white/30 group-focus-visible:bg-gold/70"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next testimonial"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-ink/75 hover:text-gold hover:border-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
