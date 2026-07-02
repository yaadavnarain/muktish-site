"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";

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
 * it renders a gentle idle float instead. Transform-only, willChange hinted.
 */
export function Magnet({
  children,
  padding = 150,
  strength = 3,
  className,
}: MagnetProps) {
  const reduced = useReducedMotion();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const [fine, setFine] = useState(false);

  useEffect(() => {
    setFine(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  const enabled = fine && !reduced;

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: MouseEvent) => {
      const el = hostRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const inZone =
        e.clientX > r.left - padding &&
        e.clientX < r.right + padding &&
        e.clientY > r.top - padding &&
        e.clientY < r.bottom + padding;

      if (inZone) {
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        setOffset({
          x: (e.clientX - cx) / strength,
          y: (e.clientY - cy) / strength,
        });
        setActive(true);
      } else if (active) {
        setOffset({ x: 0, y: 0 });
        setActive(false);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [enabled, padding, strength, active]);

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
      <div
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
          transition: active
            ? "transform 0.3s ease-out"
            : "transform 0.6s ease-in-out",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}
