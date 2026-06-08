"use client";

import { useRef, type ReactNode } from "react";

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
};

/**
 * A container that tracks the cursor and exposes its position as --mx/--my
 * CSS custom properties, which the `.spotlight-sheen` child element reads to
 * paint a faint radial sheen that follows the pointer. Layered on top of the
 * card's existing hover lift. Hover-only, so it's inert on touch and the sheen
 * appears instantly (no autonomous motion) under reduced-motion preferences.
 */
export function SpotlightCard({ children, className = "" }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div ref={ref} onMouseMove={handleMove} className={className}>
      {children}
      <span className="spotlight-sheen" aria-hidden />
    </div>
  );
}
