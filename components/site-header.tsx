import Link from "next/link";
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

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-bg/70 border-b border-white/5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-10 py-3">
        <Link
          href="/"
          className="heading text-xl sm:text-2xl tracking-tight text-ink hover:text-gold transition-colors"
        >
          Muktish
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          <nav aria-label="Social links" className="flex items-center gap-0.5 sm:gap-1">
            {socials.map(({ name, href, Icon }) => (
              <a
                key={name}
                href={href}
                aria-label={name}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink/70 hover:text-gold focus-visible:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </nav>

          <span className="hidden md:inline text-xs text-ink/50 whitespace-nowrap">
            © 2026 Muktish
          </span>
          <a
            href="#"
            className="hidden sm:inline text-xs text-ink/60 hover:text-gold transition-colors underline-offset-4 hover:underline whitespace-nowrap"
          >
            Terms and Policies
          </a>
        </div>
      </div>
    </header>
  );
}
