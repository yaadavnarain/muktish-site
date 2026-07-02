"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion-safe";

const FINE_QUERY = "(hover: hover) and (pointer: fine)";

function subscribeFine(callback: () => void) {
  const mql = window.matchMedia(FINE_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

/** Hydration-safe "desktop pointer" probe (server snapshot: false). */
function useFinePointer(): boolean {
  return useSyncExternalStore(
    subscribeFine,
    () => window.matchMedia(FINE_QUERY).matches,
    () => false,
  );
}

type MagnetProps = {
  children: ReactNode;
  /** Extra activation distance (px) beyond the element's bounds. */
  padding?: number;
  /** Pull divisor — higher = weaker pull. offset = distance / strength. */
  strength?: number;
  className?: string;
};

/**
 * Mouse-follow magnet. While the cursor is within `padding` px of the element,
 * the inner wrapper translates toward the cursor by distance/strength with a
 * quick ease-out; when the cursor leaves it springs back with a longer
 * ease-in-out. Desktop-pointer only — on touch devices (or reduced motion)
 * it renders a gentle idle float instead.
 *
 * Perf: mousemove only schedules a rAF; the frame callback does one
 * getBoundingClientRect and writes transform straight to the DOM node —
 * zero React re-renders while tracking.
 */
export function Magnet({
  children,
  padding = 150,
  strength = 3,
  className,
}: MagnetProps) {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  const enabled = fine && !reduced;

  useEffect(() => {
    if (!enabled) return;

    let raf = 0;
    let lastX = 0;
    let lastY = 0;
    let active = false;

    const frame = () => {
      raf = 0;
      const host = hostRef.current;
      const inner = innerRef.current;
      if (!host || !inner) return;
      const r = host.getBoundingClientRect();
      const inZone =
        lastX > r.left - padding &&
        lastX < r.right + padding &&
        lastY > r.top - padding &&
        lastY < r.bottom + padding;

      if (inZone) {
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        inner.style.transition = "transform 0.3s ease-out";
        inner.style.transform = `translate3d(${(lastX - cx) / strength}px, ${(lastY - cy) / strength}px, 0)`;
        active = true;
      } else if (active) {
        active = false;
        inner.style.transition = "transform 0.6s ease-in-out";
        inner.style.transform = "translate3d(0, 0, 0)";
      }
    };

    const onMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!raf) raf = requestAnimationFrame(frame);
    };

    // Snapshot the node for cleanup — the ref may change before cleanup runs.
    const innerAtSetup = innerRef.current;
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
      if (innerAtSetup) {
        innerAtSetup.style.transform = "translate3d(0, 0, 0)";
      }
    };
  }, [enabled, padding, strength]);

  if (!enabled) {
    // Touch / reduced-motion: gentle idle float (pure CSS, transform-only).
    // Under reduced motion the global CSS kills the animation → static.
    return (
      <div ref={hostRef} className={className}>
        <div className="idle-float">{children}</div>
      </div>
    );
  }

  return (
    <div ref={hostRef} className={className}>
      <div ref={innerRef} style={{ willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
}
