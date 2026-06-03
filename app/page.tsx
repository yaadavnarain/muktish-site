import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { StatsBand } from "@/components/stats-band";
import { RiseBand } from "@/components/rise-band";
import { HelpCards } from "@/components/help-cards";
import { TikTokSection } from "@/components/tiktok-section";
import { StorySection } from "@/components/story-section";
import { Testimonials } from "@/components/testimonials";
import { PartnerSection } from "@/components/partner-section";
import { FloatingCTA } from "@/components/floating-cta";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        {/* Sentinel for the floating CTA — appears once this leaves the viewport. */}
        <div data-hero-end aria-hidden className="h-px w-full" />
        <StatsBand />
        <RiseBand />
        <HelpCards />
        <TikTokSection />
        <StorySection />
        <Testimonials />
        <PartnerSection />
        {/* Footer sentinel — floating CTA hides once this enters view. */}
        <div data-footer-start aria-hidden className="h-px w-full" />
      </main>
      <FloatingCTA />
    </>
  );
}
