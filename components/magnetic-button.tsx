"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

type MagneticButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
};

/**
 * Primary gold CTA with a subtle cursor-follow magnetic pull and a soft glow
 * that intensifies on hover. The magnetic effect is disabled on touch devices
 * and when the user prefers reduced motion (falls back to a plain anchor that
 * still carries the .btn-gold glow + a gentle lift).
 */
export function MagneticButton({
  href,
  children,
  className = "",
  "aria-label": ariaLabel,
}: MagneticButtonProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLAnchorElement | null>(null);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const magnetic = canHover && !reduced;

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!magnetic || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const mx = e.clientX - (r.left + r.width / 2);
    const my = e.clientY - (r.top + r.height / 2);
    // Cap the pull so it never introduces layout overflow.
    x.set(Math.max(-12, Math.min(12, mx * 0.25)));
    y.set(Math.max(-10, Math.min(10, my * 0.3)));
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      aria-label={ariaLabel}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={magnetic ? { x: sx, y: sy } : undefined}
      whileHover={reduced ? undefined : { scale: 1.04 }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`btn-gold ${className}`}
    >
      {children}
    </motion.a>
  );
}
