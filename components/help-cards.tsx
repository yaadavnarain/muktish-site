import { Sprout, Briefcase, Trophy, ArrowRight, Lock } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion-primitives";

type CardData = {
  title: string;
  body: string;
  Icon: typeof Sprout;
  cta?: { label: string; href: string };
  comingSoon?: boolean;
};

const cards: CardData[] = [
  {
    title: "Done For You",
    body: "Become an agri-business owner. Wealth building made accessible.",
    Icon: Sprout,
    // TODO: replace # with the Done For You destination
    cta: { label: "Learn more", href: "#" },
  },
  {
    title: "Do It Yourself",
    body: "Part-time work, content creation, and affiliate marketing opportunities.",
    Icon: Briefcase,
    // TODO: replace # with the Do It Yourself destination
    cta: { label: "Learn more", href: "#" },
  },
  {
    title: "Done With You",
    body: "Entrepreneurship course and career guidance powered by ancient wisdom.",
    Icon: Trophy,
    comingSoon: true,
  },
];

export function HelpCards() {
  return (
    <section
      id="how-i-help"
      className="relative w-full bg-gradient-to-b from-bg via-[#0c0c0c] to-bg py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <h2 className="heading text-center text-3xl sm:text-5xl gold-gradient-text">
            How I Can Help You
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-3 text-center text-base sm:text-lg text-ink/65">
            Three pathways, built for where you are.
          </p>
        </Reveal>

        <Stagger
          className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3"
          staggerChildren={0.08}
          delayChildren={0.05}
        >
          {cards.map((card) => (
            <StaggerItem key={card.title} className="h-full">
              <Card data={card} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function Card({ data }: { data: CardData }) {
  const { title, body, Icon, cta, comingSoon } = data;
  return (
    <div className="group relative h-full rounded-3xl p-[1px] transition-transform duration-[220ms] ease-out will-change-transform hover:-translate-y-1.5 focus-within:-translate-y-1.5">
      {/* gradient ring */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-3xl bg-[linear-gradient(140deg,rgba(245,200,66,0.35)_0%,rgba(245,200,66,0.05)_30%,rgba(255,255,255,0.04)_60%,rgba(245,200,66,0.25)_100%)] opacity-70 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
      />
      <div className="relative flex h-full flex-col rounded-3xl bg-[#0e0e0e] p-7 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 ring-1 ring-inset ring-gold/20 text-gold">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <h3 className="heading mt-6 text-xl sm:text-2xl text-ink">{title}</h3>
        <p className="mt-3 text-sm sm:text-base text-ink/65 leading-relaxed">
          {body}
        </p>

        <div className="mt-8 pt-2 flex">
          {comingSoon ? (
            <span
              aria-disabled="true"
              className="inline-flex h-11 min-h-[44px] items-center gap-2 rounded-full bg-white/[0.04] px-4 text-xs tracking-[0.22em] uppercase text-ink/40 ring-1 ring-inset ring-white/10"
            >
              <Lock className="h-3.5 w-3.5" />
              Coming soon
            </span>
          ) : cta ? (
            <a
              href={cta.href}
              className="group/cta inline-flex h-11 min-h-[44px] items-center gap-2 rounded-full text-xs tracking-[0.22em] uppercase text-gold hover:text-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 px-2"
            >
              {cta.label}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover/cta:translate-x-1 group-focus-visible/cta:translate-x-1" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
