import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion-primitives";

export function StorySection() {
  return (
    <section
      id="story"
      className="relative isolate w-full overflow-hidden py-24 sm:py-32"
    >
      {/* depth backdrop — radial mesh + grain, blended with neighbours */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(45%_55%_at_25%_30%,rgba(245,200,66,0.12)_0%,rgba(10,10,10,0)_60%),radial-gradient(55%_60%_at_80%_70%,rgba(184,136,28,0.10)_0%,rgba(10,10,10,0)_65%),radial-gradient(60%_50%_at_50%_50%,rgba(52,211,153,0.05)_0%,rgba(10,10,10,0)_72%),linear-gradient(180deg,#0A0A0A_0%,#0c0c0c_50%,#0A0A0A_100%)]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 grain" />

      {/* seam blends */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-bg to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-bg to-transparent"
      />

      <div className="mx-auto max-w-2xl px-6 text-center">
        <Reveal>
          <div
            aria-hidden
            className="mx-auto h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent"
          />
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mt-10 text-balance text-lg sm:text-xl leading-relaxed text-ink/85">
            I grew up watching rich kids pull out Rs 100 notes while I held a{" "}
            <span className="font-semibold text-gold">Rs 5 coin</span>. That
            feeling of being left behind never left me. It became the fuel.
            Today, after a decade of entrepreneurship, I&rsquo;m building the
            tools I wish existed: ways for young people to{" "}
            <span className="font-semibold text-gold">build wealth</span>,{" "}
            <span className="font-semibold text-gold">find purpose</span>, and
            live a life they don&rsquo;t need to escape from.
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-10 flex justify-center">
            {/* TODO: replace # with the full-story page URL */}
            <a
              href="#"
              className="group inline-flex h-11 min-h-[44px] items-center gap-2 rounded-full px-4 text-xs tracking-[0.25em] uppercase text-gold hover:text-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            >
              Read my full story
              <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
