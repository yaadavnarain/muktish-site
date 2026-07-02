import { ArrowRight, Lock } from "lucide-react";
import { FadeIn } from "@/components/redesign/fade-in";

type Pathway = {
  number: string;
  name: string;
  description: string;
  /** Existing link target from the current site (kept exactly). */
  cta?: { label: string; href: string };
  comingSoon?: boolean;
};

// 01–03 copy verbatim from the current HelpCards section. 04 is the one new
// line (flagged in BUILD-REPORT for veto). "Learn more" targets kept exactly
// as on the current site (currently "#", pending real URLs).
const pathways: Pathway[] = [
  {
    number: "01",
    name: "Done For You",
    description:
      "Become an agri-business owner. Wealth building made accessible.",
    cta: { label: "Learn more", href: "#" },
  },
  {
    number: "02",
    name: "Do It Yourself",
    description:
      "Part-time work, content creation, and affiliate marketing opportunities.",
    cta: { label: "Learn more", href: "#" },
  },
  {
    number: "03",
    name: "Done With You",
    description:
      "Entrepreneurship course and career guidance powered by ancient wisdom.",
    comingSoon: true,
  },
  {
    number: "04",
    name: "Numerology Guidance",
    description:
      "Personal readings and guidance rooted in ancient wisdom.",
    cta: { label: "Learn more", href: "#" },
  },
];

/**
 * White section, rounded top, giant dark display heading, numbered service
 * list with 1px separators and staggered entrances (i * 0.1s).
 */
export function Pathways() {
  return (
    <section
      id="pathways"
      className="relative z-[1] w-full rounded-t-[40px] bg-white py-20 text-[#0A0A0A] sm:rounded-t-[50px] sm:py-28 md:rounded-t-[60px]"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <FadeIn y={30}>
          <h2 className="display text-[clamp(3rem,12vw,160px)] leading-none text-[#0A0A0A]">
            Pathways
          </h2>
        </FadeIn>

        <div className="mt-12 sm:mt-16">
          {pathways.map((p, i) => (
            <FadeIn key={p.number} delay={i * 0.1} y={24}>
              <div className="flex flex-col gap-3 border-t border-[rgba(10,10,10,0.15)] py-8 sm:flex-row sm:items-baseline sm:gap-10 sm:py-12">
                <span className="display shrink-0 text-5xl font-black leading-none text-[#0A0A0A]/25 sm:w-40 sm:text-7xl md:text-8xl">
                  {p.number}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="display text-2xl text-[#0A0A0A] sm:text-4xl">
                      {p.name}
                    </h3>
                    {p.comingSoon && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A0A0A]/[0.06] px-3 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-[#0A0A0A]/60 ring-1 ring-inset ring-[#0A0A0A]/15">
                        <Lock className="h-3 w-3" />
                        Coming soon
                      </span>
                    )}
                  </div>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#0A0A0A]/65 sm:text-base">
                    {p.description}
                  </p>
                  {p.cta && (
                    <a
                      href={p.cta.href}
                      className="group mt-5 inline-flex h-11 min-h-[44px] items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#0A0A0A] transition-opacity hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]/40 rounded"
                    >
                      {p.cta.label}
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
                    </a>
                  )}
                </div>
              </div>
            </FadeIn>
          ))}
          <div className="border-t border-[rgba(10,10,10,0.15)]" />
        </div>
      </div>
    </section>
  );
}
