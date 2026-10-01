import { Check, CircleDashed, GitBranch, Lock, ShieldCheck, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { technical, type SecurityIcon } from "@/content/landing";

const SECURITY_ICONS: Record<SecurityIcon, LucideIcon> = {
  roles: ShieldCheck,
  encryption: Lock,
  code: GitBranch,
};

/** One row of the spec sheet: a short mono label on the left, the content on the right. */
function SheetBlock({ code, label, children }: { code: string; label: string; children: ReactNode }) {
  return (
    <Reveal className="grid gap-6 border-t border-white/15 py-10 first:border-t-0 lg:grid-cols-12 lg:gap-x-10 lg:py-12">
      <div className="lg:col-span-3">
        <p className="font-mono text-xs tracking-widest text-m3-green-400">{code}</p>
        <h3 className="text-h3 mt-2 text-white">{label}</h3>
      </div>
      <div className="lg:col-span-9">{children}</div>
    </Reveal>
  );
}

export function TechnicalZone() {
  const { capabilities, flow, stack, legend } = technical;
  const lastStep = flow.steps.length - 1;

  return (
    <section
      id="tecnico"
      aria-labelledby="tecnico-title"
      className="on-dark bg-m3-green-950 py-24 text-white md:py-32"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            id="tecnico-title"
            tone="dark"
            index={technical.index}
            kicker={technical.kicker}
            title={technical.title}
            lead={technical.lead}
            className="max-w-3xl"
          />
        </Reveal>

        <div className="mt-14 rounded-3xl border border-white/15 bg-white/[0.03] px-5 sm:px-8 lg:mt-20 lg:px-12">
          <SheetBlock code="A" label={capabilities.label}>
            <div className="grid gap-8 md:grid-cols-2 md:gap-10">
              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-m3-green-200">
                  <Check size={16} strokeWidth={2.5} aria-hidden="true" className="text-m3-green-400" />
                  {capabilities.available.title}
                </h4>
                <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
                  {capabilities.available.items.map((item) => (
                    <li key={item} className="flex gap-3 py-3 text-[0.9375rem] text-white/90">
                      <Check size={18} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0 text-m3-green-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.08em] text-m3-green-200">
                  <CircleDashed size={16} strokeWidth={2} aria-hidden="true" className="text-m3-green-400" />
                  {capabilities.evolving.title}
                </h4>
                <ul className="mt-4 divide-y divide-dashed divide-white/20 border-y border-dashed border-white/20">
                  {capabilities.evolving.items.map((item) => (
                    <li key={item} className="flex gap-3 py-3 text-[0.9375rem] text-m3-green-200">
                      <CircleDashed size={18} strokeWidth={1.5} aria-hidden="true" className="mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SheetBlock>

          <SheetBlock code="B" label={flow.label}>
            <ol className="grid gap-y-0 lg:grid-cols-5 lg:gap-x-4">
              {flow.steps.map((step, i) => (
                <li key={step.title} className="relative flex gap-4 pb-8 last:pb-0 lg:block lg:pb-0">
                  {i < lastStep ? (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-[1.1875rem] top-11 w-px bg-white/20 lg:bottom-auto lg:left-12 lg:right-0 lg:top-[1.1875rem] lg:h-px lg:w-auto"
                    />
                  ) : null}
                  <span
                    aria-hidden="true"
                    className="relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-m3-green-400 bg-m3-green-950 font-mono text-sm text-m3-green-400"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="lg:mt-5">
                    <p className="font-bold leading-snug text-white">{step.title}</p>
                    <p className="mt-1 text-sm leading-snug text-m3-green-200">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </SheetBlock>

          <SheetBlock code="C" label={stack.label}>
            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {stack.groups.map((group) => (
                <div key={group.group}>
                  <dt className="font-mono text-xs uppercase tracking-widest text-m3-green-200">{group.group}</dt>
                  <dd className="mt-3">
                    <ul className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <li
                          key={item}
                          className="rounded-md border border-white/20 bg-white/5 px-3 py-1.5 font-mono text-sm text-white"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>

            <ul className="mt-10 grid gap-4 border-t border-white/10 pt-8 md:grid-cols-3">
              {stack.security.map((item) => {
                const Icon = SECURITY_ICONS[item.icon];
                return (
                  <li key={item.text} className="flex gap-3 text-[0.9375rem] text-white/90">
                    <Icon size={20} strokeWidth={1.5} aria-hidden="true" className="mt-0.5 shrink-0 text-m3-green-400" />
                    <span>{item.text}</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 grid gap-5 rounded-2xl border border-white/15 p-5 sm:p-6 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-5">
                <p className="font-bold text-white">{legend.title}</p>
                <p className="mt-1 text-sm text-m3-green-200">{legend.text}</p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-3 lg:col-span-7">
                {legend.levels.map((level) => (
                  <li key={level.label} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
                    <span aria-hidden="true" className={`size-5 shrink-0 rounded-full ${level.swatch}`} />
                    <span className="font-bold text-white">{level.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </SheetBlock>
        </div>
      </div>
    </section>
  );
}
