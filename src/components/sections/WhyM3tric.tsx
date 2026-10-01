import { TripleBar } from "@/components/brand/TripleBar";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { whyM3tric } from "@/content/landing";

const GLOBE_SRCSET = "/images/globe-640.webp 640w, /images/globe-1000.webp 1000w";

export function WhyM3tric() {
  return (
    <section id="por-que" aria-labelledby="por-que-title" className="bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-[1280px] gap-14 px-4 sm:px-6 lg:grid-cols-12 lg:gap-x-16 lg:px-8">
        <div className="lg:col-span-7">
          <Reveal>
            <SectionHeading
              id="por-que-title"
              index={whyM3tric.index}
              kicker={whyM3tric.kicker}
              title={
                <>
                  {whyM3tric.statement.map((part) => (
                    <span key={part.text} className={part.bold ? "" : "text-light"}>
                      {part.text}
                    </span>
                  ))}
                </>
              }
            />
            <p className="text-lead mt-8 max-w-2xl text-m3-muted">{whyM3tric.paragraph}</p>
          </Reveal>

          <ul className="mt-12 border-t border-m3-green-900/15">
            {whyM3tric.values.map((value, i) => (
              <li key={value.title}>
                <Reveal
                  delay={i * 0.08}
                  className="grid gap-x-8 gap-y-2 border-b border-m3-green-900/15 py-6 sm:grid-cols-[15rem_1fr] sm:items-baseline"
                >
                  <h3 className="text-h3 flex items-center gap-4 text-m3-green-900">
                    <TripleBar active={(i + 1) as 1 | 2 | 3} className="w-8 shrink-0 text-m3-green-900" />
                    {value.title}
                  </h3>
                  <p className="text-m3-muted">{value.text}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <Reveal delay={0.1} className="lg:col-span-5">
          <div className="relative isolate aspect-[4/3] overflow-hidden rounded-3xl bg-m3-green-900 lg:aspect-auto lg:h-full lg:min-h-[32rem]">
            {/* Static export: pre-optimised WebP, no next/image loader. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/globe-1000.webp"
              srcSet={GLOBE_SRCSET}
              sizes="(min-width: 1024px) 480px, 100vw"
              width={1000}
              height={667}
              alt={whyM3tric.globeAlt}
              loading="lazy"
              decoding="async"
              className="size-full object-cover object-[50%_40%] mix-blend-luminosity"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-m3-green-900/70 to-transparent" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
