import type { ReactNode } from "react";
import { TripleBar } from "@/components/brand/TripleBar";

interface SectionHeadingProps {
  /** Two-digit section index, e.g. "01". */
  index: string;
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  tone?: "light" | "dark";
  /** id of the h2, referenced by the section's aria-labelledby. */
  id: string;
  className?: string;
}

export function SectionHeading({
  index,
  kicker,
  title,
  lead,
  tone = "light",
  id,
  className = "",
}: SectionHeadingProps) {
  const dark = tone === "dark";
  return (
    <div className={`${dark ? "on-dark" : ""} ${className}`}>
      <p
        className={`text-meta flex items-center gap-3 ${dark ? "text-m3-green-200" : "text-m3-green-700"}`}
      >
        <TripleBar className={`w-4 shrink-0 ${dark ? "text-m3-green-400" : "text-m3-green-900"}`} />
        <span>
          {index} — {kicker}
        </span>
      </p>
      <h2 id={id} className={`text-h2 mt-5 ${dark ? "text-white" : "text-m3-green-900"}`}>
        {title}
      </h2>
      {lead ? (
        <p className={`text-lead mt-6 max-w-2xl ${dark ? "text-m3-green-200" : "text-m3-muted"}`}>
          {lead}
        </p>
      ) : null}
    </div>
  );
}
