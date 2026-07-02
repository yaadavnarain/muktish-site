import type { ReactNode } from "react";

type ContactButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

/**
 * Gradient pill CTA for the redesign — purple/orange sweep with a white
 * outline inset. Server-safe (no client hooks); hover handled in CSS.
 */
export function ContactButton({
  href,
  children,
  className = "",
}: ContactButtonProps) {
  return (
    <a
      href={href}
      className={`inline-flex h-12 min-h-[44px] items-center justify-center whitespace-nowrap rounded-full px-6 text-xs font-semibold uppercase tracking-widest text-white transition-transform duration-200 ease-out hover:scale-[1.04] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:px-8 ${className}`}
      style={{
        background:
          "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
        outline: "2px solid #fff",
        outlineOffset: "-3px",
      }}
    >
      {children}
    </a>
  );
}
