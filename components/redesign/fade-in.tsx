"use client";

import { motion } from "motion/react";
import { useReducedMotionSafe as useReducedMotion } from "@/lib/use-reduced-motion-safe";
import type { ReactNode } from "react";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

type FadeInProps = {
  children: ReactNode;
  /** Seconds before the animation starts. */
  delay?: number;
  /** Initial translateY in px (positive = starts lower). */
  y?: number;
  /** Play on mount (hero) instead of on scroll into view. */
  onMount?: boolean;
  duration?: number;
  className?: string;
};

/**
 * Entrance fade for the redesign: opacity 0→1 + translateY→0, ease
 * cubic-bezier(0.25,0.1,0.25,1). Falls back to a static render under
 * prefers-reduced-motion (content simply appears — no dead opacity:0).
 */
export function FadeIn({
  children,
  delay = 0,
  y = 20,
  onMount = false,
  duration = 0.7,
  className,
}: FadeInProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const target = { opacity: 1, y: 0 };
  const transition = { duration, ease: EASE, delay };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      {...(onMount
        ? { animate: target }
        : {
            whileInView: target,
            viewport: { once: true, margin: "-10% 0px -10% 0px" },
          })}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
