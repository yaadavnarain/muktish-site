"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * A sparse field of slow-rising gold embers painted on a canvas. Capped count,
 * driven by a single requestAnimationFrame loop, and paused whenever the host
 * scrolls out of view. Renders nothing when the user prefers reduced motion.
 */
export function Embers() {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = false;
    let resized = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Ember = {
      x: number;
      y: number;
      vy: number;
      drift: number;
      phase: number;
      r: number;
      a: number;
    };

    const COUNT = window.matchMedia("(min-width: 1024px)").matches ? 34 : 20;
    let embers: Ember[] = [];

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
      embers = Array.from({ length: COUNT }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vy: -0.08 - Math.random() * 0.22,
        drift: 0.15 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        r: 0.7 + Math.random() * 1.8,
        a: 0.2 + Math.random() * 0.5,
      }));
    };

    const tick = () => {
      if (!running) return;
      const rect = container.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      for (const p of embers) {
        p.y += p.vy;
        p.phase += 0.01;
        p.x += Math.sin(p.phase) * p.drift * 0.3;
        if (p.y < -6) {
          p.y = rect.height + 6;
          p.x = Math.random() * rect.width;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(245, 200, 66, ${p.a})`;
        ctx.shadowColor = "rgba(245, 200, 66, 0.7)";
        ctx.shadowBlur = 7;
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
      { threshold: 0.02 },
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
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
