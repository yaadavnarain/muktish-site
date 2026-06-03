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

    const PARTICLE_COUNT = window.matchMedia("(min-width: 1024px)").matches ? 28 : 18;
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
        r: 0.6 + Math.random() * 1.6,
        a: 0.25 + Math.random() * 0.45,
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
        ctx.shadowColor = "rgba(245, 200, 66, 0.7)";
        ctx.shadowBlur = 6;
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

  return (
    <section
      ref={sectionRef}
      className="relative isolate w-full overflow-hidden bg-gradient-to-b from-bg via-[#070707] to-bg py-28 sm:py-40"
    >
      {/* soft radial backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(60%_50%_at_50%_50%,rgba(245,200,66,0.10)_0%,rgba(10,10,10,0)_70%)]"
      />

      {/* particles — desktop only and motion-allowed */}
      <div className="hidden md:block">
        <Particles enabled={!reduced} />
      </div>

      <motion.div
        style={reduced ? undefined : { y: wordY }}
        className="relative flex justify-center"
      >
        <h2
          aria-label="RISE"
          className="heading select-none leading-none"
          style={{
            fontSize: "clamp(96px, 18vw, 220px)",
            letterSpacing: "-0.04em",
            textShadow: "0 0 60px rgba(245,200,66,0.18)",
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
      </motion.div>

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
