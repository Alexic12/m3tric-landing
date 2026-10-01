import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { technology } from "@/content/landing";

export function Technology() {
  const lastIndex = technology.flow.length - 1;
  return (
    <section id="tecnologia" aria-labelledby="tecnologia-title" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            id="tecnologia-title"
            index={technology.index}
            kicker={technology.kicker}
            title={technology.title}
            lead={technology.lead}
            className="max-w-3xl"
          />
        </Reveal>

        <Reveal className="mt-14 md:mt-20">
          <ol className="grid lg:grid-cols-5">
            {technology.flow.map((step, i) => (
              <li key={step} className="relative flex gap-5 pb-10 last:pb-0 lg:block lg:pb-0 lg:pr-4">
                {i < lastIndex ? (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-6 top-14 w-px bg-m3-green-900/25 lg:bottom-auto lg:left-[4rem] lg:right-2 lg:top-6 lg:h-px lg:w-auto"
                  />
                ) : null}
                <span
                  aria-hidden="true"
                  className={`relative z-10 inline-flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-m3-green-900 text-lg font-bold ${
                    i === lastIndex ? "bg-m3-green-900 text-white" : "bg-white text-m3-green-900"
                  }`}
                >
                  {i + 1}
                </span>
                <p className="pt-2.5 text-lg font-bold leading-snug text-m3-green-900 lg:mt-5 lg:pt-0">{step}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal className="mt-20 md:mt-28">
          <dl className="grid gap-10 border-t border-m3-green-900/15 pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {technology.stack.map((group) => (
              <div key={group.group}>
                <dt className="text-meta text-m3-green-700">{group.group}</dt>
                <dd className="mt-4">
                  <ul className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-full bg-m3-green-200/40 px-4 py-2 text-[0.9375rem] font-medium text-m3-green-900"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
