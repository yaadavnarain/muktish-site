"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

const PREMIUM_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const DURATION = 0.42;
const ONCE_MARGIN = "-15% 0px -15% 0px" as const;

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "p" | "span" | "h1" | "h2" | "h3";
};

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: RevealProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: ONCE_MARGIN }}
      transition={{ duration: DURATION, ease: PREMIUM_EASE, delay }}
    >
      {children}
    </MotionTag>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  delayChildren?: number;
  staggerChildren?: number;
};

export function Stagger({
  children,
  className,
  delayChildren = 0,
  staggerChildren = 0.06,
}: StaggerProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const containerVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        delayChildren,
        staggerChildren,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: ONCE_MARGIN }}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
};

export function StaggerItem({ children, className }: StaggerItemProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: DURATION, ease: PREMIUM_EASE },
    },
  };

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

type AnimatedCounterProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  decimals?: number;
};

function formatNumber(n: number, decimals: number) {
  const fixed = n.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const withSeparators = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart ? `${withSeparators}.${decPart}` : withSeparators;
}

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1.6,
  className,
  decimals = 0,
}: AnimatedCounterProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(() =>
    reduced ? formatNumber(value, decimals) : formatNumber(0, decimals),
  );
  const startedRef = useRef(false);

  useEffect(() => {
    if (reduced) {
      setDisplay(formatNumber(value, decimals));
      return;
    }
    const el = ref.current;
    if (!el) return;

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const startTime = performance.now();
      const durMs = duration * 1000;

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / durMs, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const current = value * eased;
        setDisplay(formatNumber(current, decimals));
        if (t < 1) requestAnimationFrame(tick);
        else setDisplay(formatNumber(value, decimals));
      };

      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            start();
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration, reduced, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
