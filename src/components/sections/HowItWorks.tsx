import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { howItWorks } from "@/content/landing";
import { ProductMock } from "./ProductMock";

export function HowItWorks() {
  return (
    <section id="como-funciona" aria-labelledby="como-funciona-title" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            id="como-funciona-title"
            index={howItWorks.index}
            kicker={howItWorks.kicker}
            title={howItWorks.title}
            className="max-w-4xl"
          />
        </Reveal>

        <ol className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 md:mt-20 lg:grid-cols-4">
          {howItWorks.steps.map((step, i) => (
            <li key={step.title}>
              <Reveal delay={i * 0.08} className="h-full border-t-2 border-m3-green-900 pt-5">
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

        <Reveal className="mt-20 rounded-3xl bg-m3-beige px-4 py-10 sm:px-8 md:mt-28 md:px-14 md:py-16">
          <ProductMock />
        </Reveal>
      </div>
    </section>
  );
}
