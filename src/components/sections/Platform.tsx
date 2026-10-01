import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { platform } from "@/content/landing";
import { ProductMock } from "./ProductMock";

export function Platform() {
  return (
    <section id="plataforma" aria-labelledby="plataforma-title" className="bg-m3-beige py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            id="plataforma-title"
            index={platform.index}
            kicker={platform.kicker}
            title={platform.title}
            lead={platform.lead}
          />
        </Reveal>

        <ol className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 md:mt-20">
          {platform.steps.map((step, i) => (
            <li key={step.title}>
              <Reveal delay={i * 0.08} className="h-full border-t border-m3-green-900/20 pt-4">
                <span
                  aria-hidden="true"
                  className="block text-[clamp(5rem,4rem+5vw,8rem)] font-light leading-[0.9] tracking-tighter text-m3-green-400"
                >
                  {i + 1}
                </span>
                <h3 className="text-h3 mt-6 text-m3-green-900">{step.title}</h3>
                <p className="mt-3 max-w-xs text-m3-muted">{step.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal className="mt-20 md:mt-28">
          <ProductMock />
        </Reveal>
      </div>
    </section>
  );
}
