import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { StatsBand } from "@/components/stats-band";
import { RiseBand } from "@/components/rise-band";
import { HelpCards } from "@/components/help-cards";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <StatsBand />
        <RiseBand />
        <HelpCards />
      </main>
    </>
  );
}
