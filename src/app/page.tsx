import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";
import { Capabilities } from "@/components/sections/Capabilities";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Platform } from "@/components/sections/Platform";
import { Products } from "@/components/sections/Products";
import { Proposal } from "@/components/sections/Proposal";
import { Scales } from "@/components/sections/Scales";
import { Technology } from "@/components/sections/Technology";
import { UseCases } from "@/components/sections/UseCases";

export default function Home() {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="contenido" tabIndex={-1} className="outline-none">
        <Hero />
        <Proposal />
        <Platform />
        <Scales />
        <Products />
        <Capabilities />
        <Technology />
        <UseCases />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
