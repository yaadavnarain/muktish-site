"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

/**
 * Hydration-safe prefers-reduced-motion. motion/react's useReducedMotion
 * reads matchMedia synchronously on the first client render, which makes the
 * initial client tree disagree with the SSR HTML whenever the user prefers
 * reduced motion (React #418). useSyncExternalStore renders the server
 * snapshot (false) during hydration, then re-renders with the real value.
 */
export function useReducedMotionSafe(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
