"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef } from "react";

const PREMIUM_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const LETTERS = ["R", "I", "S", "E"];

function Particles({ enabled }: { enabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = false;
    let resized = false;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      a: number;
    };

    const PARTICLE_COUNT = window.matchMedia("(min-width: 1024px)").matches ? 44 : 26;
    let particles: Particle[] = [];

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      resized = true;
    };

    const spawn = () => {
      const rect = container.getBoundingClientRect();
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: 0.1 + Math.random() * 0.25,
        vy: -0.05 - Math.random() * 0.15,
        r: 0.9 + Math.random() * 2.2,
        a: 0.35 + Math.random() * 0.5,
      }));
    };

    const tick = () => {
      if (!running) return;
      const rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x > rect.width + 4) p.x = -4;
        if (p.y < -4) p.y = rect.height + 4;
        ctx.beginPath();
        ctx.fillStyle = `rgba(245, 200, 66, ${p.a})`;
        ctx.shadowColor = "rgba(245, 200, 66, 0.8)";
        ctx.shadowBlur = 9;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !running) {
            if (!resized) {
              resize();
              spawn();
            }
            running = true;
            raf = requestAnimationFrame(tick);
          } else if (!entry.isIntersecting && running) {
            running = false;
            cancelAnimationFrame(raf);
          }
        }
      },
      { threshold: 0.05 },
    );
    io.observe(container);

    const onResize = () => {
      resize();
      spawn();
    };
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [enabled]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

export function RiseBand() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const wordY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);
  const wordScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.94, 1.04, 0.96],
  );

  return (
    <section
      ref={sectionRef}
      className="relative isolate w-full overflow-hidden bg-gradient-to-b from-bg via-[#070707] to-bg py-24 sm:py-32"
    >
      {/* soft radial backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(60%_50%_at_50%_50%,rgba(245,200,66,0.10)_0%,rgba(10,10,10,0)_70%)]"
      />

      {/* large soft gold glow behind the word */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -z-10 h-[60vw] max-h-[34rem] w-[60vw] max-w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(245,200,66,0.28)_0%,rgba(10,10,10,0)_70%)] blur-2xl"
      />

      {/* particles — desktop only and motion-allowed */}
      <div className="hidden md:block">
        <Particles enabled={!reduced} />
      </div>

      <motion.div
        style={reduced ? undefined : { y: wordY, scale: wordScale }}
        className="relative flex flex-col items-center justify-center"
      >
        <h2
          aria-label="RISE"
          className="heading relative select-none leading-none"
          style={{
            fontSize: "clamp(96px, 18vw, 220px)",
            letterSpacing: "-0.04em",
            textShadow: "0 0 60px rgba(245,200,66,0.22)",
          }}
        >
          {LETTERS.map((letter, i) =>
            reduced ? (
              <span
                key={letter}
                className="gold-gradient-text inline-block"
              >
                {letter}
              </span>
            ) : (
              <motion.span
                key={letter}
                className="gold-gradient-text inline-block"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
                transition={{
                  duration: 0.6,
                  ease: PREMIUM_EASE,
                  delay: i * 0.08,
                }}
              >
                {letter}
              </motion.span>
            ),
          )}
        </h2>

        {/* faint floor reflection — heavily blurred so it reads as a soft
            glow, never as a legible second "RISE", and fades out fast. */}
        <div
          aria-hidden
          className="heading gold-gradient-text pointer-events-none -mt-1 select-none leading-none opacity-[0.10]"
          style={{
            fontSize: "clamp(96px, 18vw, 220px)",
            letterSpacing: "-0.04em",
            transform: "scaleY(-1)",
            filter: "blur(18px)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 32%)",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 32%)",
          }}
        >
          RISE
        </div>
      </motion.div>

      {/* vignette beneath the word to seat the reflection */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-bg to-transparent"
      />

      <motion.p
        initial={reduced ? false : { opacity: 0, y: 12 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
        transition={{ duration: 0.42, ease: PREMIUM_EASE, delay: 0.35 }}
        className="relative mt-10 text-center text-[0.6rem] sm:text-[0.7rem] tracking-[0.4em] uppercase text-gold/70 px-6"
      >
        It started with a Rs 5 coin. It doesn&rsquo;t end there.
      </motion.p>
    </section>
  );
}
