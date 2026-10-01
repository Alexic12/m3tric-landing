"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { TripleBar } from "@/components/brand/TripleBar";
import { NodeNetwork } from "@/components/brand/NodeNetwork";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import ScaleVisual from "@/components/three/ScaleVisual";
import type { ScaleId } from "@/types";
import { a11y, scales } from "@/content/landing";

const BARS: Record<ScaleId, 1 | 2 | 3> = { m1: 1, m2: 2, m3: 3 };
const tabId = (id: ScaleId) => `escala-tab-${id}`;
const panelId = (id: ScaleId) => `escala-panel-${id}`;

export function Scales() {
  const [active, setActive] = useState<ScaleId>("m1");
  const tabRefs = useRef<Partial<Record<ScaleId, HTMLButtonElement | null>>>({});
  const ids = scales.items.map((s) => s.id);

  const select = (id: ScaleId) => {
    setActive(id);
    tabRefs.current[id]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = ids.indexOf(active);
    const last = ids.length - 1;
    const next: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowDown: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in next)) return;
    event.preventDefault();
    select(ids[next[event.key]]);
  };

  return (
    <section
      id="escalas"
      aria-labelledby="escalas-title"
      className="on-dark relative isolate overflow-hidden bg-m3-green-900 py-24 text-white md:py-32"
    >
      <NodeNetwork className="absolute inset-0 -z-10 size-full opacity-25" seed={21} nodes={30} />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            id="escalas-title"
            tone="dark"
            index={scales.index}
            kicker={scales.kicker}
            title={scales.title}
            lead={scales.lead}
            className="max-w-4xl"
          />
        </Reveal>

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <div
              role="tablist"
              aria-label={a11y.scaleTabs}
              onKeyDown={onKeyDown}
              className="grid grid-cols-3 gap-2 lg:grid-cols-1"
            >
              {scales.items.map((scale) => {
                const selected = scale.id === active;
                return (
                  <button
                    key={scale.id}
                    ref={(el) => {
                      tabRefs.current[scale.id] = el;
                    }}
                    type="button"
                    role="tab"
                    id={tabId(scale.id)}
                    aria-selected={selected}
                    aria-controls={panelId(scale.id)}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActive(scale.id)}
                    className={`flex min-h-16 flex-col items-start justify-center gap-2 sm:justify-start lg:justify-start rounded-2xl border px-4 py-3 text-left transition-colors sm:flex-row sm:items-center sm:gap-4 sm:px-5 lg:flex-row ${
                      selected
                        ? "border-m3-green-400 bg-white/10 text-white"
                        : "border-white/20 text-m3-green-200 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <TripleBar active={BARS[scale.id]} className="w-7 shrink-0 text-m3-green-400" />
                    <span className="text-lg font-bold leading-tight">
                      {scale.code} <span className="font-light">{scale.name}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {scales.items.map((scale) => (
              <div
                key={scale.id}
                role="tabpanel"
                id={panelId(scale.id)}
                aria-labelledby={tabId(scale.id)}
                hidden={scale.id !== active}
                tabIndex={0}
                className="mt-4 rounded-3xl bg-white p-6 text-m3-ink sm:p-8"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-h3 text-m3-green-900">
                    {scale.code} · {scale.name}
                  </h3>
                  <StatusBadge status={scale.status} />
                </div>
                <dl className="mt-6 space-y-5">
                  <div>
                    <dt className="text-meta text-m3-green-700">{scales.labels.reads}</dt>
                    <dd className="mt-1 text-lg">{scale.reads}</dd>
                  </div>
                  <div>
                    <dt className="text-meta text-m3-green-700">{scales.labels.source}</dt>
                    <dd className="mt-1 text-lg">{scale.source}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          <Reveal className="lg:col-span-7">
            <ScaleVisual activeScale={active} className="rounded-3xl ring-1 ring-white/15" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
