import { TripleBar } from "@/components/brand/TripleBar";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { proposal } from "@/content/landing";

const GLOBE_SRCSET = "/images/globe-640.webp 640w, /images/globe-1000.webp 1000w";

export function Proposal() {
  return (
    <section id="propuesta" aria-labelledby="propuesta-title" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-12">
          <Reveal className="lg:col-span-7 lg:text-right lg:[&_.text-meta]:justify-end">
            <SectionHeading
              id="propuesta-title"
              index={proposal.index}
              kicker={proposal.kicker}
              title={
                <>
                  {proposal.statement.map((part) => (
                    <span key={part.text} className={part.bold ? "" : "text-light"}>
                      {part.text}
                    </span>
                  ))}
                </>
              }
            />
          </Reveal>
          <Reveal delay={0.1} className="space-y-6 lg:col-span-5 lg:self-end lg:pb-2">
            {proposal.paragraphs.map((p) => (
              <p key={p} className="text-lead text-m3-muted">
                {p}
              </p>
            ))}
          </Reveal>
        </div>

        <Reveal className="mt-16 md:mt-24">
          <div className="relative isolate aspect-[16/10] overflow-hidden rounded-3xl bg-m3-green-900 sm:aspect-[2/1] lg:aspect-[21/9]">
            {/* Static export: pre-optimised WebP, no next/image loader. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/globe-1000.webp"
              srcSet={GLOBE_SRCSET}
              sizes="(min-width: 1280px) 1216px, 100vw"
              width={1000}
              height={667}
              alt={proposal.globeAlt}
              loading="lazy"
              decoding="async"
              className="size-full object-cover object-[50%_40%] mix-blend-luminosity"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-m3-green-900/70 to-transparent" />
          </div>
        </Reveal>

        <ul className="mt-16 grid gap-10 md:mt-24 md:grid-cols-3 md:gap-8">
          {proposal.values.map((value, i) => (
            <li key={value.title}>
              <Reveal delay={i * 0.08} className="border-t-2 border-m3-green-900 pt-6">
                <TripleBar active={(i + 1) as 1 | 2 | 3} className="w-10 text-m3-green-900" />
                <h3 className="text-h3 mt-6 hyphens-auto break-words text-m3-green-900">{value.title}</h3>
                <p className="mt-3 max-w-sm text-m3-muted">{value.text}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
