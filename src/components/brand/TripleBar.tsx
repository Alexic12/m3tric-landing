interface TripleBarProps {
  /** How many bars are lit (0-3). Unlit bars render at 20% opacity. */
  active?: 0 | 1 | 2 | 3;
  className?: string;
}

// Proportions taken from the logo's "3": widths 64.5 / 64.5 / 91.7, height 23.5, gap 14.3.
const BAR_H = 23.52;
const GAP = 14.26;
const WIDTHS = [64.49, 64.49, 91.7] as const;
const TOTAL_W = WIDTHS[2];
const TOTAL_H = BAR_H * 3 + GAP * 2;
const RX = BAR_H / 2;

export function TripleBar({ active = 3, className }: TripleBarProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ height: "auto" }}
      fill="currentColor"
    >
      {WIDTHS.map((w, i) => {
        const offset = i * (BAR_H + GAP);
        return (
          <rect
            key={i}
            x={0}
            y={offset}
            width={w}
            height={BAR_H}
            rx={RX}
            opacity={i < active ? 1 : 0.2}
          />
        );
      })}
    </svg>
  );
}
