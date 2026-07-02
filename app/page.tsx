import { RedesignHero } from "@/components/redesign/hero";
import { Marquee } from "@/components/redesign/marquee";
import { About } from "@/components/redesign/about";
import { Pathways } from "@/components/redesign/pathways";
import { Projects } from "@/components/redesign/projects";
import { FloatingCTA } from "@/components/floating-cta";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <main className="overflow-x-clip">
        <RedesignHero />
        {/* Sentinel for the floating CTA — appears once this leaves the viewport. */}
        <div data-hero-end aria-hidden className="h-px w-full" />
        <Marquee />
        <About />
        <Pathways />
        <Projects />
      </main>
      {/* Floating CTA hides once the footer enters view. */}
      <div data-footer-start aria-hidden className="h-px w-full" />
      <SiteFooter />
      <FloatingCTA />
    </>
  );
}
