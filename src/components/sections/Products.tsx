import { Activity, Map as MapIcon, Radio, type LucideIcon } from "lucide-react";
import { TripleBar } from "@/components/brand/TripleBar";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { products, type ProductIcon } from "@/content/landing";

const ICONS: Record<ProductIcon, LucideIcon> = {
  sensors: Radio,
  analytics: Activity,
  map: MapIcon,
};

export function Products() {
  return (
    <section id="productos" aria-labelledby="productos-title" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            id="productos-title"
            index={products.index}
            kicker={products.kicker}
            title={products.title}
            className="max-w-3xl"
          />
        </Reveal>

        <ul className="mt-14 grid gap-6 md:mt-20 lg:grid-cols-3">
          {products.items.map((item, i) => {
            const Icon = ICONS[item.icon];
            return (
              <li key={item.title}>
                {/* Reveal owns opacity/transform; the card's own hover transition lives on the inner element. */}
                <Reveal delay={i * 0.08} className="h-full">
                  <div className="flex h-full flex-col rounded-3xl border border-m3-green-900/15 p-7 transition-colors hover:border-m3-green-900 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-m3-green-200/50 text-m3-green-900">
                        <Icon size={28} strokeWidth={1.5} aria-hidden="true" />
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                    <h3 className="text-h3 mt-8 text-m3-green-900">{item.title}</h3>
                    <p className="mt-3 text-m3-muted">{item.text}</p>
                    <ul className="mt-6 space-y-3 border-t border-m3-green-900/10 pt-6">
                      {item.bullets.map((b) => (
                        <li key={b} className="flex gap-3 text-[0.9375rem]">
                          <TripleBar active={3} className="mt-[0.45rem] w-3 shrink-0 self-start text-m3-green-700" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>

        <Reveal className="mt-10">
          <p className="flex flex-col gap-3 rounded-2xl border border-dashed border-m3-green-700 px-6 py-5 sm:flex-row sm:items-center sm:gap-5">
            <StatusBadge status="evolving" className="self-start" />
            <span className="text-m3-muted">{products.evolvingNote.text}</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
