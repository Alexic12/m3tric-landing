import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faq } from "@/content/landing";

export function Faq() {
  return (
    <section id="preguntas" aria-labelledby="preguntas-title" className="bg-m3-beige py-24 md:py-32">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-x-16 lg:px-8">
        <Reveal className="lg:col-span-4">
          <SectionHeading
            id="preguntas-title"
            index={faq.index}
            kicker={faq.kicker}
            title={faq.title}
            className="lg:sticky lg:top-28"
          />
        </Reveal>

        {/* Native <details>: opens and closes without JavaScript, and is operable by keyboard out of the box. */}
        <Reveal delay={0.08} className="lg:col-span-8">
          <div className="overflow-hidden rounded-3xl border border-m3-green-900/10 bg-white">
            {faq.items.map((item, i) => (
              <details
                key={item.question}
                open={i === 0}
                className="group border-b border-m3-green-900/10 last:border-b-0"
              >
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 transition-colors hover:bg-m3-green-200/20 group-open:bg-m3-green-200/20 sm:px-8 [&::-webkit-details-marker]:hidden">
                  <h3 className="text-lg font-bold leading-snug text-m3-green-900 sm:text-xl">{item.question}</h3>
                  <ChevronDown
                    size={24}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className="shrink-0 text-m3-green-900 transition-transform duration-300 group-open:rotate-180"
                  />
                </summary>
                <div className="bg-m3-green-200/20 px-6 pb-7 pt-1 sm:px-8">
                  <p className="max-w-2xl text-m3-muted">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
