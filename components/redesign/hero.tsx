"use client";

import { FadeIn } from "@/components/redesign/fade-in";
import { Magnet } from "@/components/redesign/magnet";
import { ContactButton } from "@/components/redesign/contact-button";
import { AnimatedCounter } from "@/components/motion-primitives";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Pathways", href: "#pathways" },
  { label: "Content", href: "#content" },
  { label: "Contact", href: "#contact" },
];

// Real Mauritius Rs 5 coin (alpha-masked) + founder cut-out, both already in /public.
const COIN_IMG = "/coin/rs5-back.png";
const FOUNDER_IMG = "/images/muktish.png";

const stats = [
  { value: 10, suffix: "M+", label: "Views", decimals: 0 },
  { value: 63.7, suffix: "K", label: "Followers", decimals: 1 },
  { value: 100, suffix: "+", label: "Students Mentored", decimals: 0 },
];

/**
 * Redesign hero — 100svh, fits above the fold at 375px.
 * Layers back→front: founder cut-out (muted) → giant gradient h1 → magnet coin.
 * FadeIn sequence: nav 0 / heading 0.15 / tagline 0.35 / button 0.5 / magnet 0.6.
 */
export function RedesignHero() {
  return (
    <section className="relative flex h-[100svh] w-full flex-col overflow-hidden bg-bg">
      {/* ---- Nav ---- */}
      <FadeIn onMount delay={0} y={-20} className="relative z-20">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <a
            href="#"
            className="heading text-lg text-ink transition-opacity hover:opacity-70 sm:text-xl"
          >
            Muktish
          </a>
          <div className="flex items-center gap-4 sm:gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[0.6rem] uppercase tracking-wider text-ink/90 transition-opacity hover:opacity-70 sm:text-xs"
              >
                {l.label}
              </a>
            ))}
          </div>
        </nav>
      </FadeIn>

      {/* ---- Center stage ---- */}
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center">
        {/* Founder cut-out — muted, behind everything */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 flex items-end justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={FOUNDER_IMG}
            alt=""
            className="h-[52svh] w-auto max-w-none object-contain opacity-25 sm:h-[62svh]"
            style={{ filter: "grayscale(1) brightness(0.55) contrast(1.1)" }}
          />
        </div>

        {/* Giant gradient heading */}
        <FadeIn
          onMount
          delay={0.15}
          y={40}
          className="relative z-[1] w-full overflow-hidden"
        >
          <h1 className="display steel-gradient-text whitespace-nowrap text-center text-[14vw] leading-none">
            HI, I&rsquo;M MUKTISH
          </h1>
        </FadeIn>

        {/* Magnet coin — in front, overlapping the headline */}
        <FadeIn onMount delay={0.6} y={30} className="relative z-10 -mt-[4vw]">
          <Magnet padding={150} strength={3}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={COIN_IMG}
              alt="Mauritius Rs 5 coin"
              className="coin-turn w-[clamp(120px,20vw,260px)] drop-shadow-[0_20px_60px_rgba(245,200,66,0.25)]"
            />
          </Magnet>
        </FadeIn>
      </div>

      {/* ---- Bottom row: tagline / CTA ---- */}
      <div className="relative z-20 mx-auto flex w-full max-w-7xl items-end justify-between gap-4 px-5 pb-3 sm:px-8">
        <FadeIn onMount delay={0.35} y={20}>
          <p className="max-w-[260px] text-[0.6rem] font-light uppercase leading-relaxed tracking-wider text-ink/70 sm:text-xs">
            Entrepreneur · Content Creator · Numerologist — guiding youth to
            live a fulfilled life.
          </p>
        </FadeIn>
        <FadeIn onMount delay={0.5} y={20}>
          <ContactButton href="https://wa.me/23055111364">
            Chat with me
          </ContactButton>
        </FadeIn>
      </div>

      {/* ---- Stats band — overlaps the hero bottom edge ---- */}
      <div className="relative z-20 border-t border-white/5 bg-bg/60 backdrop-blur-sm">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-2 px-4 py-4 text-center sm:py-6">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <span className="heading text-xl leading-none gold-gradient-text sm:text-4xl">
                <AnimatedCounter
                  value={s.value}
                  suffix={s.suffix}
                  decimals={s.decimals}
                  duration={1.8}
                />
              </span>
              <span className="text-[0.5rem] uppercase tracking-[0.25em] text-ink/55 sm:text-[0.65rem]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
