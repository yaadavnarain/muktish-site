"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Stagger, StaggerItem } from "@/components/motion-primitives";

export function PartnerSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id="partner"
      className="relative isolate w-full overflow-hidden py-28 sm:py-36"
    >
      {/* breathing radial glow */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-20"
        animate={
          reduced
            ? undefined
            : { opacity: [0.7, 1, 0.7], scale: [1, 1.04, 1] }
        }
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
        style={{
          background:
            "radial-gradient(45% 55% at 50% 50%, rgba(245,200,66,0.16) 0%, rgba(10,10,10,0) 65%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-30 bg-gradient-to-b from-bg via-[#0c0c0c] to-bg"
      />
      <div aria-hidden className="absolute inset-0 -z-10 grain" />

      {/* seam blends */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-bg to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-bg to-transparent"
      />

      <Stagger
        className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center"
        staggerChildren={0.08}
      >
        <StaggerItem>
          <span className="inline-flex h-8 items-center rounded-full border border-gold/40 px-4 text-[0.6rem] tracking-[0.3em] uppercase text-gold/90">
            Limited Time Opportunity
          </span>
        </StaggerItem>

        <StaggerItem className="mt-7">
          <h2 className="heading text-balance text-3xl sm:text-5xl md:text-6xl text-ink leading-[1.05]">
            Become Muktish&rsquo;s{" "}
            <span className="gold-gradient-text">Business Partner</span>
          </h2>
        </StaggerItem>

        <StaggerItem className="mt-8">
          <p className="text-base sm:text-lg text-ink/80">
            Own shares of the company he&rsquo;s been building since day one.
          </p>
        </StaggerItem>

        <StaggerItem className="mt-3">
          <p className="text-base sm:text-lg text-ink/80">
            Target Return:{" "}
            <span className="font-semibold text-gold">100x</span> over{" "}
            <span className="font-semibold text-gold">5 years</span>.
          </p>
        </StaggerItem>

        <StaggerItem className="mt-3">
          <p className="text-base sm:text-lg text-ink/80">
            Starting from <span className="font-semibold text-gold">Rs 28,000</span>.
          </p>
        </StaggerItem>

        <StaggerItem className="mt-3">
          <p className="text-sm sm:text-base text-ink/65">
            Exclusively for GenZ &amp; Millennials (18 to 45).
          </p>
        </StaggerItem>

        <StaggerItem className="mt-10">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-7">
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
          </div>
        </StaggerItem>
      </Stagger>
    </section>
  );
}
