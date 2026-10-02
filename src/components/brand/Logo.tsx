import logoPaths from "../../../brand/logo/paths.json";

export type LogoVariant = "color" | "reverse" | "mono-dark" | "mono-light";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  /** Accessible name. Defaults to the brand name. */
  label?: string;
}

// Exact vector shapes from the brand manual (slide 8): M, TR, I, C (body) and the three bars of the "3".
// The single source is brand/logo/paths.json, which also generates brand/logo/*.svg (npm run brand:build);
// scripts/brand-kit.test.mjs fails if this file stops importing it or carries path data of its own.
const { viewBox: VIEW_BOX, body: BODY_PATHS, bars: BAR_PATHS } = logoPaths;

const COLORS: Record<LogoVariant, { body: string; bars: string; barsOpacity: number }> = {
  color: { body: "#004124", bars: "#74C69D", barsOpacity: 1 },
  reverse: { body: "#B7E3C7", bars: "#74C69D", barsOpacity: 1 },
  "mono-dark": { body: "#000000", bars: "#000000", barsOpacity: 0.5 },
  "mono-light": { body: "#FFFFFF", bars: "#FFFFFF", barsOpacity: 0.5 },
};

export function Logo({ variant = "color", className, label = "M3TRIC" }: LogoProps) {
  const c = COLORS[variant];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={VIEW_BOX}
      role="img"
      aria-label={label}
      className={className}
      style={{ height: "auto" }}
    >
      <g fill={c.body}>
        {BODY_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g fill={c.bars} fillOpacity={c.barsOpacity}>
        {BAR_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
