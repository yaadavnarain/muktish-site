"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  TikTokIcon,
  XIcon,
} from "@/components/social-icons";

const socials = [
  // TODO: replace # with the real Facebook URL
  { name: "Facebook", href: "#", Icon: FacebookIcon },
  // TODO: replace # with the real Instagram URL
  { name: "Instagram", href: "#", Icon: InstagramIcon },
  // TODO: replace # with the real YouTube URL
  { name: "YouTube", href: "#", Icon: YouTubeIcon },
  // TODO: replace # with the real TikTok URL
  { name: "TikTok", href: "#", Icon: TikTokIcon },
  // TODO: replace # with the real X (Twitter) URL
  { name: "X", href: "#", Icon: XIcon },
];

/**
 * Single sticky top navigation. Rendered once at the very top of the app
 * (root layout), fixed to the viewport top. Transparent over the hero, gaining
 * a subtle dark backdrop-blur background after the page scrolls past ~80px.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 w-full transition-colors duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-bg/70 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="heading text-xl tracking-tight text-ink transition-colors hover:text-mint sm:text-2xl"
        >
          Muktish
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <nav
            aria-label="Social links"
            className="hidden items-center gap-0.5 sm:flex sm:gap-1"
          >
            {socials.map(({ name, href, Icon }) => (
              <a
                key={name}
                href={href}
                aria-label={name}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink/70 transition-colors hover:text-mint focus-visible:text-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint/60"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </nav>

          <a
            href="https://wa.me/23055111364"
            className="btn-gold inline-flex h-10 min-h-[40px] items-center gap-2 rounded-full bg-gold pl-2.5 pr-4 text-xs font-semibold text-bg transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint/70 sm:text-sm"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bg/15">
              <MessageCircle className="h-3.5 w-3.5" />
            </span>
            Chat with me
          </a>
        </div>
      </div>
    </header>
  );
}
