"use client";

import { motion, useReducedMotion } from "motion/react";

export function Ambience() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-50 hidden md:block"
    >
      <motion.div
        className="absolute top-[10%] left-[12%] h-[28rem] w-[28rem] rounded-full"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(245,200,66,0.07) 0%, rgba(10,10,10,0) 70%)",
          filter: "blur(20px)",
        }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 26, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-[5%] right-[8%] h-[32rem] w-[32rem] rounded-full"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(184,136,28,0.05) 0%, rgba(10,10,10,0) 70%)",
          filter: "blur(20px)",
        }}
        animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
        transition={{ duration: 34, ease: "easeInOut", repeat: Infinity }}
      />
    </div>
  );
}
