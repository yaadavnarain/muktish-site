import { Mail, Phone } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion-primitives";
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

export function SiteFooter() {
  return (
    <footer className="relative w-full border-t border-white/5 bg-gradient-to-b from-bg via-[#070707] to-black">
      <Stagger
        className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:py-20 md:grid-cols-2"
        staggerChildren={0.08}
      >
        <StaggerItem>
          <span className="heading text-2xl text-ink">Muktish</span>
          <p className="mt-3 max-w-sm text-sm text-ink/55 leading-relaxed">
            Building tools for young people to build wealth, find purpose, and
            live a life they don&rsquo;t need to escape from.
          </p>
        </StaggerItem>

        <StaggerItem>
          <h3 className="text-[0.65rem] tracking-[0.3em] uppercase text-ink/55">
            Contact Information
          </h3>
          <ul className="mt-5 space-y-3 text-sm text-ink/85">
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gold/80" />
              <a
                href="mailto:support@muktish.com"
                className="hover:text-gold focus-visible:outline-none focus-visible:text-gold transition-colors"
              >
                support@muktish.com
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gold/80" />
              <a
                href="https://wa.me/23055111364"
                className="hover:text-gold focus-visible:outline-none focus-visible:text-gold transition-colors"
              >
                +230 5511 1364
              </a>
              <span className="text-xs text-ink/45">(WhatsApp)</span>
            </li>
          </ul>
        </StaggerItem>
      </Stagger>

      <div className="border-t border-white/5">
        <Stagger
          className="mx-auto flex max-w-6xl flex-col-reverse items-center justify-between gap-6 px-6 py-7 sm:flex-row"
          staggerChildren={0.06}
        >
          <StaggerItem className="flex items-center gap-4">
            <span className="text-xs text-ink/50">© 2026 Muktish</span>
            <a
              href="#"
              className="text-xs text-ink/60 hover:text-gold transition-colors underline-offset-4 hover:underline"
            >
              Terms and Policies
            </a>
          </StaggerItem>
          <StaggerItem>
            <nav aria-label="Footer social links" className="flex items-center gap-1">
              {socials.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink/70 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:text-gold"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </nav>
          </StaggerItem>
        </Stagger>
      </div>
    </footer>
  );
}
