import { Hero } from "@/components/hero";
import { StatsBand } from "@/components/stats-band";
import { HelpCards } from "@/components/help-cards";
import { TikTokSection } from "@/components/tiktok-section";
import { StorySection } from "@/components/story-section";
import { Testimonials } from "@/components/testimonials";
import { PartnerSection } from "@/components/partner-section";
import { FloatingCTA } from "@/components/floating-cta";
import { SiteFooter } from "@/components/site-footer";
import { Ambience } from "@/components/ambience";
import { PageBubbles } from "@/components/page-bubbles";

export default function Home() {
  return (
    <>
      <Ambience />
      {/* Ambient gold bubbles across the whole page — fades in below the hero. */}
      <PageBubbles />
      <main>
        <Hero />
        {/* Sentinel for the floating CTA — appears once this leaves the viewport. */}
        <div data-hero-end aria-hidden className="h-px w-full" />
        <StatsBand />
        <HelpCards />
        <TikTokSection />
        <StorySection />
        <Testimonials />
        <PartnerSection />
      </main>
      {/* Floating CTA hides once the footer enters view. */}
      <div data-footer-start aria-hidden className="h-px w-full" />
      <SiteFooter />
      <FloatingCTA />
    </>
  );
}
