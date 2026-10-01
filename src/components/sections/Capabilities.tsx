import { Check, CircleDashed } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { capabilities } from "@/content/landing";

export function Capabilities() {
  const { available, evolving, legend } = capabilities;
  return (
    <section id="capacidades" aria-labelledby="capacidades-title" className="bg-m3-green-200/30 py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            id="capacidades-title"
            index={capabilities.index}
            kicker={capabilities.kicker}
            title={capabilities.title}
            lead={capabilities.lead}
            className="max-w-3xl"
          />
        </Reveal>

        <div className="mt-14 grid gap-6 md:mt-20 lg:grid-cols-12">
          <Reveal className="rounded-3xl bg-white p-7 sm:p-10 lg:col-span-7">
            <h3 className="text-h3 text-m3-green-900">{available.title}</h3>
            <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {available.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-m3-green-900 text-white">
                    <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08} className="rounded-3xl border-2 border-dashed border-m3-green-700 p-7 sm:p-10 lg:col-span-5">
            <h3 className="text-h3 text-m3-green-700">{evolving.title}</h3>
            <ul className="mt-8 space-y-4">
              {evolving.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <CircleDashed size={24} strokeWidth={1.5} aria-hidden="true" className="mt-0 shrink-0 text-m3-green-700" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal className="mt-6 grid gap-8 rounded-3xl bg-white p-7 sm:p-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <h3 className="text-h3 text-m3-green-900">{legend.title}</h3>
            <p className="mt-3 text-m3-muted">{legend.text}</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3 lg:col-span-7">
            {legend.levels.map((level) => (
              <li
                key={level.label}
                className="flex items-center gap-4 rounded-2xl border border-m3-green-900/15 px-5 py-4"
              >
                <span aria-hidden="true" className={`size-8 shrink-0 rounded-full ${level.swatch}`} />
                <span className="text-lg font-bold text-m3-ink">{level.label}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
