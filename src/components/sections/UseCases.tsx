import { Leaf, Mountain, Route, Droplets, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useCases, type CaseIcon } from "@/content/landing";

const ICONS: Record<CaseIcon, LucideIcon> = {
  risk: Mountain,
  agro: Leaf,
  infra: Route,
  environment: Droplets,
};

export function UseCases() {
  return (
    <section id="casos" aria-labelledby="casos-title" className="bg-m3-beige py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            id="casos-title"
            index={useCases.index}
            kicker={useCases.kicker}
            title={useCases.title}
            className="max-w-3xl"
          />
        </Reveal>

        <ul className="mt-14 grid gap-6 md:mt-20 md:grid-cols-2">
          {useCases.items.map((item, i) => {
            const Icon = ICONS[item.icon];
            const featured = i === 0;
            return (
              <li key={item.title}>
                <Reveal
                  delay={(i % 2) * 0.08}
                  className="relative isolate flex h-full min-h-[22rem] flex-col justify-between overflow-hidden rounded-3xl bg-white p-7 sm:p-9"
                >
                  {featured ? (
                    <>
                      {/* Static export: pre-optimised WebP, no next/image loader. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/aerial-tall-640.webp"
                        srcSet="/images/aerial-tall-640.webp 640w, /images/aerial-tall-747.webp 747w"
                        sizes="(min-width: 768px) 620px, 100vw"
                        width={747}
                        height={996}
                        alt={useCases.imageAlt}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 -z-20 size-full object-cover"
                      />
                      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-m3-green-900/80" />
                    </>
                  ) : null}
                  <span
                    className={`inline-flex size-14 items-center justify-center rounded-2xl ${
                      featured ? "bg-m3-green-200 text-m3-green-900" : "bg-m3-green-200/50 text-m3-green-900"
                    }`}
                  >
                    <Icon size={28} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <div className="mt-16">
                    <h3 className={`text-h3 ${featured ? "text-white" : "text-m3-green-900"}`}>{item.title}</h3>
                    <p className={`text-meta mt-2 ${featured ? "text-m3-green-200" : "text-m3-green-700"}`}>
                      {item.scope}
                    </p>
                    <p
                      className={`text-lead mt-6 font-light ${featured ? "text-white" : "text-m3-ink"}`}
                    >
                      {item.text}
                    </p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
