import { Bell, FileText, Radio, type LucideIcon } from "lucide-react";
import { TripleBar } from "@/components/brand/TripleBar";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { benefits, type BenefitIcon } from "@/content/landing";

const ICONS: Record<BenefitIcon, LucideIcon> = {
  monitor: Radio,
  alerts: Bell,
  reports: FileText,
};

/** On wide screens the three cards share three row tracks, so title, text and deliverables line up across cards. */
const SHARED_ROWS = "lg:row-span-3 lg:grid lg:grid-rows-subgrid";

export function Benefits() {
  return (
    <section id="beneficios" aria-labelledby="beneficios-title" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            id="beneficios-title"
            index={benefits.index}
            kicker={benefits.kicker}
            title={benefits.title}
            className="max-w-4xl"
          />
        </Reveal>

        <ul className="mt-14 grid gap-6 md:mt-20 lg:grid-cols-3 lg:gap-y-0">
          {benefits.items.map((item, i) => {
            const Icon = ICONS[item.icon];
            return (
              <li key={item.title} className={SHARED_ROWS}>
                {/* Reveal owns opacity/transform; the card's own hover transition lives on the inner element. */}
                <Reveal delay={i * 0.08} className={`h-full ${SHARED_ROWS}`}>
                  <div
                    className={`${SHARED_ROWS} rounded-3xl border border-m3-green-900/15 bg-white p-7 transition-[border-color,box-shadow] duration-300 hover:border-m3-green-900 hover:shadow-[0_24px_48px_-24px_rgba(0,65,36,0.25)] sm:p-9`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-m3-green-200/50 text-m3-green-900">
                        <Icon size={28} strokeWidth={1.5} aria-hidden="true" />
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="mt-8">
                      <h3 className="text-h3 text-m3-green-900">{item.title}</h3>
                      <p className="mt-4 text-m3-muted">{item.text}</p>
                    </div>
                    <div className="mt-8 border-t border-m3-green-900/10 pt-6">
                      <p className="text-meta text-m3-green-700">{benefits.deliverablesLabel}</p>
                      <ul className="mt-4 space-y-3">
                        {item.deliverables.map((d) => (
                          <li key={d} className="flex gap-3 font-medium text-m3-green-900">
                            <TripleBar active={3} className="mt-[0.5rem] w-3 shrink-0 self-start text-m3-green-700" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>

        <Reveal className="mt-8">
          <p className="flex flex-col gap-3 rounded-2xl border border-dashed border-m3-green-700 px-6 py-5 sm:flex-row sm:items-center sm:gap-5">
            <StatusBadge status="evolving" className="shrink-0 self-start whitespace-nowrap" />
            <span className="text-m3-muted">{benefits.evolvingNote}</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
