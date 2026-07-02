import { ArrowRight, ArrowUpRight } from "lucide-react";
import { FadeIn } from "@/components/redesign/fade-in";

type Project = {
  number: string;
  kicker: string;
  title: string;
  body: React.ReactNode;
  media: React.ReactNode;
  action: React.ReactNode;
};

/** White pill linking to the live project. */
function LiveProjectButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex h-12 min-h-[44px] items-center gap-2 rounded-full bg-ink px-7 text-xs font-semibold uppercase tracking-[0.2em] text-bg transition-transform duration-200 ease-out hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/70"
    >
      {label}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

/** Quiet outline pill for secondary actions. */
function GhostButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="group inline-flex h-12 min-h-[44px] items-center gap-2 rounded-full border border-white/25 px-7 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:border-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
    >
      {label}
      <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
    </a>
  );
}

// TikTok-style decorative thumbs reused from the current site's gradient set.
const TIKTOK_THUMBS = [
  {
    views: "106.2K",
    gradient:
      "linear-gradient(135deg,#1a1208 0%,#3a2a12 35%,#7a5a1d 60%,#1c140a 100%)",
  },
  {
    views: "108.4K",
    gradient:
      "linear-gradient(135deg,#0a1a14 0%,#143020 40%,#1f5a3a 65%,#0a1a14 100%)",
  },
  {
    views: "76.9K",
    gradient:
      "linear-gradient(135deg,#100a18 0%,#241432 35%,#5a2a7a 60%,#120a18 100%)",
  },
];

const projects: Project[] = [
  {
    number: "01",
    kicker: "Venture",
    title: "Yealth / Ecorganics",
    body: (
      <p className="text-sm leading-relaxed text-ink/70 sm:text-base">
        Agri-business ownership, made accessible — the flagship venture behind
        the &ldquo;Done For You&rdquo; pathway.
      </p>
    ),
    media: (
      // REPLACE: swap for a real Yealth/Ecorganics product or farm photo.
      <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#07130c_0%,#0e2417_45%,#1f5a3a_100%)]">
        <span className="text-[0.6rem] uppercase tracking-[0.3em] text-ink/40">
          REPLACE — Yealth image
        </span>
      </div>
    ),
    action: <LiveProjectButton href="https://yealth.mu" label="Live project" />,
  },
  {
    number: "02",
    kicker: "Content",
    title: "TikTok — 10M+ Views",
    body: (
      <p className="text-sm leading-relaxed text-ink/70 sm:text-base">
        10M+ Views Since 28th of April 2024.
      </p>
    ),
    media: (
      <div className="grid h-full w-full grid-cols-3 gap-2 p-2">
        {TIKTOK_THUMBS.map((t) => (
          <div
            key={t.views}
            className="relative flex items-end overflow-hidden rounded-xl p-3"
            style={{ background: t.gradient }}
          >
            <span className="heading text-sm text-ink sm:text-lg">
              {t.views}
            </span>
          </div>
        ))}
      </div>
    ),
    // TODO(flagged): no real TikTok profile URL exists on the current site — "#" kept.
    action: <GhostButton href="#" label="Watch" />,
  },
  {
    number: "03",
    kicker: "Partnership",
    title: "Become Muktish's Business Partner",
    body: (
      // Copy VERBATIM from the current partner section — do not reword.
      <div className="space-y-2 text-sm leading-relaxed text-ink/80 sm:text-base">
        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-gold/90">
          Limited Time Opportunity
        </p>
        <p>Own shares of the company he&rsquo;s been building since day one.</p>
        <p>
          Target Return:{" "}
          <span className="font-semibold text-gold">100x</span> over{" "}
          <span className="font-semibold text-gold">5 years</span>.
        </p>
        <p>
          Starting from{" "}
          <span className="font-semibold text-gold">Rs 28,000</span>.
        </p>
        <p className="text-ink/65">
          Exclusively for GenZ &amp; Millennials (18 to 45).
        </p>
      </div>
    ),
    media: (
      // Real coin still from /public — money/ownership imagery.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/coin/coin-fallback.jpg"
        alt=""
        className="h-full w-full object-cover"
      />
    ),
    action: (
      <GhostButton href="https://wa.me/23055111364" label="Chat with me" />
    ),
  },
];

const TOTAL = projects.length;

/**
 * Sticky-stacking project cards: each card sticks below the one before it
 * (top offset index*28px), earlier cards scale down slightly so the stack
 * reads as depth. Dark section overlapping the white Pathways above.
 */
export function Projects() {
  return (
    <section className="relative z-10 -mt-10 w-full rounded-t-[40px] bg-bg py-20 sm:rounded-t-[50px] sm:py-28 md:rounded-t-[60px]">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <FadeIn y={30}>
          <h2 className="display steel-gradient-text text-[clamp(3rem,12vw,160px)] leading-none">
            Projects
          </h2>
        </FadeIn>

        <div className="mt-12 sm:mt-16">
          {projects.map((p, i) => (
            <div key={p.number} className="h-auto md:h-[85vh]">
              <div
                className="md:sticky"
                style={{
                  top: `calc(6rem + ${i * 28}px)`,
                  transform: `scale(${1 - (TOTAL - 1 - i) * 0.03})`,
                  transformOrigin: "center top",
                }}
              >
                <div className="mb-10 flex flex-col overflow-hidden rounded-[40px] border-2 border-white/15 bg-[#0d0d0d] sm:rounded-[50px] md:mb-0 md:h-[70vh] md:flex-row md:rounded-[60px]">
                  {/* Copy column */}
                  <div className="flex flex-1 flex-col justify-center gap-4 p-8 sm:p-12">
                    <span className="text-[0.65rem] uppercase tracking-[0.3em] text-ink/45">
                      {p.number} · {p.kicker}
                    </span>
                    <h3 className="display text-2xl text-ink sm:text-4xl">
                      {p.title}
                    </h3>
                    {p.body}
                    <div className="mt-4">{p.action}</div>
                  </div>
                  {/* Media column */}
                  <div className="relative h-56 w-full md:h-auto md:flex-1">
                    {p.media}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
