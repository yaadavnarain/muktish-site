"use client";

import { ArrowRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion-primitives";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { MagneticButton } from "@/components/magnetic-button";

// 3D robot scene from Spline's CDN — lazy-loaded inside SplineScene.
const SCENE = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

export function SplineSection() {
  return (
    <section
      id="vision"
      className="wash-amber relative isolate w-full overflow-hidden py-20 sm:py-28"
    >
      <div aria-hidden className="absolute inset-0 -z-10 grain" />
      {/* seam blends into neighbouring sections */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-bg to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-t from-bg to-transparent"
      />

      <div className="mx-auto max-w-6xl px-6">
        {/* Card lifts/blurs in on scroll — mirrors the HelpCards gradient-ring treatment. */}
        <Reveal className="group relative rounded-3xl p-[1px]">
          <div
            aria-hidden
            className="absolute inset-0 rounded-3xl bg-[linear-gradient(140deg,rgba(245,200,66,0.35)_0%,rgba(245,200,66,0.05)_30%,rgba(255,255,255,0.04)_60%,rgba(245,200,66,0.25)_100%)] opacity-80"
          />

          <div className="relative flex h-[620px] flex-col overflow-hidden rounded-3xl bg-[#0b0b0b] md:h-[520px] md:flex-row">
            {/* warm gold spotlight sweep — brand fill instead of the stock white */}
            <Spotlight
              className="-top-40 left-0 md:-top-20 md:left-60"
              fill="#F5C842"
            />

            {/* Left content — staggered entrance */}
            <div className="relative z-10 flex flex-1 flex-col justify-center p-8 sm:p-10">
              <Stagger staggerChildren={0.1} delayChildren={0.15}>
                <StaggerItem>
                  <p className="text-[0.6rem] uppercase tracking-[0.2em] text-gold/80 sm:text-xs sm:tracking-[0.3em]">
                    What you&rsquo;re really building
                  </p>
                </StaggerItem>

                <StaggerItem>
                  <h2 className="heading mt-5 text-balance text-3xl leading-[1.08] sm:text-4xl md:text-5xl">
                    Build a life you don&rsquo;t need to{" "}
                    <span className="gold-gradient-text">escape from</span>.
                  </h2>
                </StaggerItem>

                <StaggerItem>
                  <p className="mt-5 max-w-md text-sm leading-relaxed text-ink/70 sm:text-base">
                    Wealth, purpose, and freedom aren&rsquo;t luck —
                    they&rsquo;re built, one decision at a time. Explore the
                    tools, the mindset, and the guidance that turn
                    &ldquo;someday&rdquo; into a plan you start today.
                  </p>
                </StaggerItem>

                <StaggerItem className="mt-8">
                  <MagneticButton
                    href="https://wa.me/23055111364"
                    className="group/cta inline-flex h-12 min-h-[44px] items-center justify-center gap-2 rounded-full bg-gold px-7 text-sm font-semibold text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint/70 sm:text-base"
                  >
                    Start the conversation
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
                  </MagneticButton>
                </StaggerItem>
              </Stagger>
            </div>

            {/* Right content — interactive 3D, fades in just after the copy */}
            <Reveal delay={0.2} className="relative flex-1">
              <SplineScene scene={SCENE} className="h-full w-full" />
            </Reveal>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
