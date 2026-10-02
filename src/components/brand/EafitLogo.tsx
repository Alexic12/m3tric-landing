import eafit from "./eafit-paths.json";

export type EafitLogoTone = "navy" | "light";

interface EafitLogoProps {
  tone?: EafitLogoTone;
  className?: string;
  label?: string;
}

// Azul EAFIT per the university's identity manual: RGB 0/75/133 (Pantone 294C).
const EAFIT_BLUE = "#004B85";

/**
 * Universidad EAFIT wordmark, traced from the institutional PNG supplied by the
 * owner (2026-10-02). Replace eafit-paths.json with the official vector when the
 * university provides it; the component API stays the same.
 */
export function EafitLogo({ tone = "navy", className = "", label = "Universidad EAFIT" }: EafitLogoProps) {
  return (
    <svg
      viewBox={eafit.viewBox}
      role="img"
      aria-label={label}
      className={className}
      style={{ height: "auto" }}
    >
      <title>{label}</title>
      <g transform={eafit.transform} fill={tone === "navy" ? EAFIT_BLUE : "#FFFFFF"}>
        <path d={eafit.d} />
      </g>
    </svg>
  );
}
