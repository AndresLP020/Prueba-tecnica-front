import { Hero } from "@/components/landing/Hero";
import { Marquee } from "@/components/landing/Marquee";
import { ProofBar } from "@/components/landing/ProofBar";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Services } from "@/components/landing/Services";
import { Gallery } from "@/components/landing/Gallery";
import { Quotes } from "@/components/landing/Quotes";
import { Faq } from "@/components/landing/Faq";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { LeadDock } from "@/components/form/LeadDock";
import { OrbitProvider } from "@/components/scene/OrbitProvider";

export default function HomePage() {
  return (
    <OrbitProvider>
      <SiteHeader />
      <main>
        <Hero />
        <Marquee />
        <ProofBar />
        <HowItWorks />
        <Services />
        <Gallery />
        <LeadDock />
        <Quotes />
        <Faq />
      </main>
      <SiteFooter />
    </OrbitProvider>
  );
}
