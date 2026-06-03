import { AnimatedCounter, Stagger, StaggerItem } from "@/components/motion-primitives";

const stats = [
  { value: 10, suffix: "M+", label: "Views", decimals: 0 },
  { value: 63.7, suffix: "K", label: "Followers", decimals: 1 },
  { value: 100, suffix: "+", label: "Students Mentored", decimals: 0 },
];

export function StatsBand() {
  return (
    <section
      aria-label="Audience stats"
      className="relative w-full bg-gradient-to-b from-bg via-[#0c0c0c] to-bg border-y border-white/5"
    >
      <Stagger
        className="mx-auto grid max-w-5xl grid-cols-1 sm:grid-cols-3 gap-y-10 px-6 py-12 sm:py-14 text-center"
        staggerChildren={0.08}
      >
        {stats.map((s) => (
          <StaggerItem
            key={s.label}
            className="flex flex-col items-center gap-2"
          >
            <span className="heading text-4xl sm:text-5xl gold-gradient-text leading-none">
              <AnimatedCounter
                value={s.value}
                suffix={s.suffix}
                decimals={s.decimals}
                duration={1.6}
              />
            </span>
            <span className="text-[0.65rem] sm:text-xs tracking-[0.3em] uppercase text-ink/55">
              {s.label}
            </span>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
