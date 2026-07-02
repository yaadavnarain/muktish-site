"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion-safe";
import { FadeIn } from "@/components/redesign/fade-in";
import { ContactButton } from "@/components/redesign/contact-button";

// The real story — VERBATIM from the current site. Do not reword.
const STORY =
  "I grew up watching rich kids pull out Rs 100 notes while I held a Rs 5 coin. That feeling of being left behind never left me. It became the fuel. Today, after a decade of entrepreneurship, I’m building the tools I wish existed: ways for young people to build wealth, find purpose, and live a life they don’t need to escape from.";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

// Coin/brand imagery already in /public — used as the 4 corner decorations.
const DECOR = [
  { src: "/coin/rs5-back.png", corner: "left-4 top-6 sm:left-10", fromX: -80, delay: 0.1 },
  { src: "/textures/rs5-front.png", corner: "right-4 top-6 sm:right-10", fromX: 80, delay: 0.2 },
  { src: "/textures/rs5-back.png", corner: "bottom-6 left-4 sm:left-10", fromX: -80, delay: 0.3 },
  { src: "/coin/coin-fallback.jpg", corner: "bottom-6 right-4 sm:right-10", fromX: 80, delay: 0.25 },
];

function Char({
  char,
  progress,
  range,
}: {
  char: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <motion.span style={{ opacity }} aria-hidden>
      {char}
    </motion.span>
  );
}

/**
 * Character-by-character scroll reveal: an invisible copy of the paragraph
 * keeps layout/line-wrapping, while an absolutely-positioned animated copy
 * fades each character 0.2 → 1 as scroll progress sweeps the section
 * (offset ['start 0.8','end 0.2']). Screen readers get the plain text once;
 * the animated layer is aria-hidden. Static under reduced motion.
 */
function CharacterReveal({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLParagraphElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"],
  });

  if (reduced) {
    return (
      <p className="text-balance text-lg leading-relaxed text-ink/90 sm:text-2xl">
        {text}
      </p>
    );
  }

  const total = text.length;
  // Pure derivation of each word's absolute start index (word starts include
  // the +1 for the space that follows the previous word).
  const words = text.split(" ").reduce<{ word: string; start: number }[]>(
    (acc, word) => {
      const prev = acc[acc.length - 1];
      const start = prev ? prev.start + prev.word.length + 1 : 0;
      acc.push({ word, start });
      return acc;
    },
    [],
  );

  return (
    <p
      ref={ref}
      className="relative text-balance text-lg leading-relaxed sm:text-2xl"
    >
      {/* Invisible placeholder — owns layout and is what screen readers see. */}
      <span className="invisible">{text}</span>
      {/* Animated copy — absolutely stacked over the placeholder. */}
      <span className="absolute inset-0 text-ink" aria-hidden>
        {words.map(({ word, start }, wi) => (
          // Inter-word spaces render as plain text BETWEEN the inline-block
          // word spans so both layers share identical break opportunities
          // (a space inside the block made this layer wrap earlier than the
          // invisible placeholder).
          <span key={wi}>
            <span className="inline-block">
              {word.split("").map((c, ci) => {
                const abs = start + ci;
                return (
                  <Char
                    key={ci}
                    char={c}
                    progress={scrollYProgress}
                    range={[abs / total, Math.min(1, (abs + 1) / total)]}
                  />
                );
              })}
            </span>
            {wi < words.length - 1 ? " " : ""}
          </span>
        ))}
      </span>
    </p>
  );
}

export function About() {
  const reduced = useReducedMotion();

  return (
    <section
      id="about"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-bg py-24 sm:py-32"
    >
      {/* 4 corner decorations — coin imagery, fading in from the sides */}
      {DECOR.map((d) => (
        <motion.div
          key={d.src + d.corner}
          aria-hidden
          className={`pointer-events-none absolute ${d.corner} z-0 hidden sm:block`}
          initial={reduced ? false : { opacity: 0, x: d.fromX }}
          whileInView={reduced ? undefined : { opacity: 0.18, x: 0 }}
          viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
          transition={{ duration: 0.9, ease: EASE, delay: d.delay }}
          style={reduced ? { opacity: 0.18 } : undefined}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={d.src}
            alt=""
            className="h-24 w-24 rounded-full object-cover grayscale md:h-32 md:w-32"
          />
        </motion.div>
      ))}

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-5 text-center sm:px-8">
        <FadeIn y={30}>
          <h2 className="display steel-gradient-text text-[clamp(3rem,12vw,160px)] leading-none">
            About Me
          </h2>
        </FadeIn>

        <div className="mt-12 sm:mt-16">
          <CharacterReveal text={STORY} />
        </div>

        {/* Testimonial — verbatim from the current site */}
        <FadeIn y={24} className="mt-16 sm:mt-20">
          <figure>
            <blockquote className="text-balance text-base leading-relaxed text-ink/75 sm:text-lg">
              &ldquo;Muktish is a young ambitious entrepreneur who has insight
              and a vision. I do trust him.&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-[0.7rem] uppercase tracking-[0.3em] text-gold/80">
              — TOOSHMA
            </figcaption>
          </figure>
        </FadeIn>

        <FadeIn y={20} className="mt-14">
          <ContactButton href="https://wa.me/23055111364">
            Chat with me
          </ContactButton>
        </FadeIn>
      </div>
    </section>
  );
}
