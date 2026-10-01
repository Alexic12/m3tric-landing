import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";
import { Benefits } from "@/components/sections/Benefits";
import { Contact } from "@/components/sections/Contact";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Scales } from "@/components/sections/Scales";
import { TechnicalZone } from "@/components/sections/TechnicalZone";
import { UseCases } from "@/components/sections/UseCases";
import { WhyM3tric } from "@/components/sections/WhyM3tric";

export default function Home() {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="contenido" tabIndex={-1} className="outline-none">
        <Hero />
        <Benefits />
        <UseCases />
        <HowItWorks />
        <Scales />
        <WhyM3tric />
        <Faq />
        <TechnicalZone />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
