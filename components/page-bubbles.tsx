"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * A sparse field of slow-rising gold "bubbles" drifting across the whole page.
 * Rendered as a single fixed, pointer-events-none canvas. It stays invisible
 * over the hero (the coin owns that space) and fades in once the hero scrolls
 * away, so it reads as ambient atmosphere through the rest of the page.
 * Paused when the tab is hidden; renders nothing under reduced motion.
 */
export function PageBubbles() {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let running = true;
    let opacity = 0;

    type Bubble = { x: number; y: number; vx: number; vy: number; r: number; a: number };
    const COUNT = window.matchMedia("(min-width: 1024px)").matches ? 38 : 20;
    let bubbles: Bubble[] = [];

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    const resize = () => {
      canvas.width = Math.floor(W() * dpr);
      canvas.height = Math.floor(H() * dpr);
      canvas.style.width = `${W()}px`;
      canvas.style.height = `${H()}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = () => {
      bubbles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * W(),
        y: Math.random() * H(),
        vx: (Math.random() - 0.5) * 0.16,
        vy: -0.07 - Math.random() * 0.2,
        r: 0.8 + Math.random() * 2.0,
        a: 0.22 + Math.random() * 0.38,
      }));
    };

    // Opacity ramps from 0 (over the hero) to 1 once the hero has scrolled away.
    const computeOpacity = () => {
      const vh = H();
      const start = vh * 0.55;
      const end = vh * 1.1;
      opacity = Math.max(0, Math.min(1, (window.scrollY - start) / (end - start)));
    };

    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, W(), H());
      if (opacity > 0.01) {
        for (const p of bubbles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -6) {
            p.y = H() + 6;
            p.x = Math.random() * W();
          }
          if (p.x < -6) p.x = W() + 6;
          else if (p.x > W() + 6) p.x = -6;
          ctx.beginPath();
          ctx.fillStyle = `rgba(245, 200, 66, ${p.a * opacity})`;
          ctx.shadowColor = "rgba(245, 200, 66, 0.7)";
          ctx.shadowBlur = 8;
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(tick);
    };

    resize();
    spawn();
    computeOpacity();
    raf = requestAnimationFrame(tick);

    const onScroll = () => computeOpacity();
    const onResize = () => {
      resize();
      spawn();
    };
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-20">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
