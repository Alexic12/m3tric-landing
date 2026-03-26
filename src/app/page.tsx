import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import PlatformSection from "@/components/sections/PlatformSection";
import ScalesSection from "@/components/sections/ScalesSection";
import ProductsSection from "@/components/sections/ProductsSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import TechnologySection from "@/components/sections/TechnologySection";
import UseCasesSection from "@/components/sections/UseCasesSection";
import CTASection from "@/components/sections/CTASection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PlatformSection />
        <ScalesSection />
        <ProductsSection />
        <FeaturesSection />
        <TechnologySection />
        <UseCasesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
