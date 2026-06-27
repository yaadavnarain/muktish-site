"use client";

import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

export function FloatingCTA() {
  const reduced = useReducedMotion();
  const [pastHero, setPastHero] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("[data-hero-end]");
    const footer = document.querySelector("[data-footer-start]");
    if (!hero || !footer) return;

    const heroIO = new IntersectionObserver(
      ([e]) => setPastHero(!e.isIntersecting),
      { threshold: 0 },
    );
    const footerIO = new IntersectionObserver(
      ([e]) => setNearFooter(e.isIntersecting),
      { rootMargin: "0px 0px 120px 0px", threshold: 0 },
    );
    heroIO.observe(hero);
    footerIO.observe(footer);
    return () => {
      heroIO.disconnect();
      footerIO.disconnect();
    };
  }, []);

  const visible = pastHero && !nearFooter;

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          key="cta"
          href="https://wa.me/23055111364"
          aria-label="Chat with Muktish on WhatsApp"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="btn-gold fixed bottom-5 right-5 z-40 inline-flex h-12 min-h-[44px] items-center gap-2 rounded-full bg-gold pl-3 pr-4 text-sm font-semibold text-bg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint/70 sm:bottom-7 sm:right-7"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-bg/15">
            <MessageCircle className="h-4 w-4" />
          </span>
          <span>Chat with me</span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
