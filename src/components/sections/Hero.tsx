import { ArrowRight, ArrowUpRight, Bell, FileText, MapPinned, type LucideIcon } from "lucide-react";
import { NodeNetwork } from "@/components/brand/NodeNetwork";
import { TripleBar } from "@/components/brand/TripleBar";
import { Button } from "@/components/ui/Button";
import { a11y, cta, hero, type OutcomeIcon } from "@/content/landing";
import { siteConfig } from "@/config/site";

const WIDE_SRCSET = [640, 1280, 1920, 2560].map((w) => `/images/aerial-wide-${w}.webp ${w}w`).join(", ");
// Mobile hero: one small, low-quality crop. It sits behind a >= 70 % veil, so detail is invisible, and it is
// the LCP-critical request on slow networks (see scripts/optimize-images.py WIDTH_QUALITY).
const TALL_SRC = "/images/aerial-tall-480.webp";

const OUTCOME_ICONS: Record<OutcomeIcon, LucideIcon> = {
  alerts: Bell,
  map: MapPinned,
  reports: FileText,
};

export function Hero() {
  return (
    <section
      id="inicio"
      aria-labelledby="inicio-title"
      className="on-dark relative isolate flex min-h-[min(100svh,60rem)] flex-col overflow-hidden bg-m3-green-900 text-white"
    >
      <picture>
        <source media="(max-width: 767px)" srcSet={TALL_SRC} />
        {/* Static export: next/image optimisation is off, images are pre-optimised WebP. */}
        <img
          src="/images/aerial-wide-1920.webp"
          srcSet={WIDE_SRCSET}
          sizes="100vw"
          width={2897}
          height={1100}
          alt={hero.imageAlt}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-30 size-full object-cover object-[70%_center]"
        />
      </picture>
      {/* Brand veil: >= 70% #004124 behind all text. */}
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-m3-green-900/80 md:bg-m3-green-900/70" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 hidden bg-linear-to-r from-m3-green-900 via-m3-green-900/80 to-transparent md:block"
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-20 h-1/2 bg-linear-to-t from-m3-green-900 to-transparent" />
      <NodeNetwork className="absolute inset-0 -z-10 size-full opacity-50 [mask-image:linear-gradient(to_right,transparent_15%,black_75%)]" />

      <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-between px-4 pb-10 pt-[calc(72px+3.5rem)] sm:px-6 md:pb-14 md:pt-[calc(72px+5rem)] lg:px-8">
        <div>
          <p className="text-meta flex items-center gap-3 text-m3-green-200">
            <TripleBar active={3} className="w-4 shrink-0 text-m3-green-400" />
            {hero.meta}
          </p>
          <h1 id="inicio-title" className="text-display mt-6 max-w-[11em] break-words text-white md:mt-8">
            <span className="block">{hero.titleBold}</span>{" "}
            <span className="text-light block text-m3-green-200">{hero.titleLight}</span>
          </h1>
          <p className="text-lead mt-8 max-w-xl text-white/90">{hero.lead}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button
              href="#contacto"
              variant="primary-on-dark"
              size="lg"
              icon={<ArrowRight size={20} strokeWidth={1.5} />}
            >
              {cta.team}
            </Button>
            <Button
              href={siteConfig.platformUrl}
              variant="ghost-on-dark"
              size="lg"
              icon={<ArrowUpRight size={20} strokeWidth={1.5} />}
            >
              {cta.platform}
            </Button>
          </div>
        </div>

        <div className="mt-14 md:mt-20">
          <ul
            aria-label={a11y.outcomes}
            className="grid gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 md:grid-cols-3"
          >
            {hero.outcomes.map((outcome) => {
              const Icon = OUTCOME_ICONS[outcome.icon];
              return (
                <li key={outcome.label} className="flex items-start gap-4 bg-m3-green-900/90 p-5 backdrop-blur-sm md:p-6">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-m3-green-200/15 text-m3-green-200">
                    <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-lg font-bold leading-snug text-white">{outcome.label}</p>
                    <p className="mt-1 text-[0.9375rem] leading-snug text-m3-green-200">{outcome.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
