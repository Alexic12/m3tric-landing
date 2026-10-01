import { a11y, howItWorks } from "@/content/landing";

const INK = "#0b0f0d";
const MUTED = "#4b5563";
const GREEN_900 = "#004124";
const GREEN_700 = "#2c694f";
const GREEN_400 = "#74c69d";
const GREEN_200 = "#b7e3c7";
const YELLOW = "#ffd166";
const ORANGE = "#f77f00";
const RED = "#d62828";

const SENSORS: Array<{ x: number; y: number; color: string }> = [
  { x: 110, y: 170, color: GREEN_700 },
  { x: 210, y: 250, color: GREEN_700 },
  { x: 330, y: 160, color: YELLOW },
  { x: 420, y: 290, color: GREEN_700 },
  { x: 180, y: 380, color: ORANGE },
  { x: 300, y: 430, color: GREEN_700 },
  { x: 490, y: 190, color: GREEN_700 },
  { x: 520, y: 420, color: RED },
  { x: 400, y: 500, color: GREEN_700 },
  { x: 90, y: 480, color: GREEN_700 },
];

const SERIES = "M0 150 L27 140 L54 146 L80 120 L107 128 L134 104 L161 110 L188 84 L214 92 L241 60 L268 38";

const ALERTS = [
  { label: "Atención", color: YELLOW, shape: "circle" },
  { label: "Alerta", color: ORANGE, shape: "square" },
  { label: "Crítico", color: RED, shape: "diamond" },
] as const;

function AlertShape({ shape, color, cy }: { shape: (typeof ALERTS)[number]["shape"]; color: string; cy: number }) {
  if (shape === "circle") return <circle cx={684} cy={cy} r={12} fill={color} />;
  if (shape === "square") return <rect x={672} y={cy - 12} width={24} height={24} rx={4} fill={color} />;
  return <rect x={672} y={cy - 12} width={24} height={24} rx={3} fill={color} transform={`rotate(45 684 ${cy})`} />;
}

/** Illustrative UI of the platform (not a real capture): sensor map, time series and alert levels. */
export function ProductMock() {
  return (
    <figure className="mx-auto w-full max-w-5xl">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 960 600"
        role="img"
        aria-label={a11y.platformIllustrationAlt}
        className="w-full drop-shadow-[0_24px_48px_rgba(0,65,36,0.18)]"
        style={{ height: "auto" }}
      >
        <rect width="960" height="600" rx="24" fill="#ffffff" />
        <rect width="960" height="56" rx="24" fill="#f1f4f2" />
        <rect y="32" width="960" height="24" fill="#f1f4f2" />
        <g fill="#cfd8d3">
          <circle cx="36" cy="28" r="7" />
          <circle cx="60" cy="28" r="7" />
          <circle cx="84" cy="28" r="7" />
        </g>
        <rect x="320" y="14" width="320" height="28" rx="14" fill="#ffffff" />
        <g fill={GREEN_900}>
          <rect x="336" y="22" width="10" height="3" rx="1.5" />
          <rect x="336" y="28" width="10" height="3" rx="1.5" opacity="0.5" />
          <rect x="336" y="34" width="14" height="3" rx="1.5" opacity="0.3" />
        </g>
        <line x1="0" y1="56" x2="960" y2="56" stroke="#e3e9e5" />

        {/* Map card */}
        <g>
          <rect x="24" y="76" width="596" height="500" rx="16" fill="#e9f3ed" />
          <clipPath id="mock-map-clip">
            <rect x="24" y="76" width="596" height="500" rx="16" />
          </clipPath>
          <g clipPath="url(#mock-map-clip)" fill="none" stroke={GREEN_200} strokeWidth="2">
            <path d="M0 200 C120 150 220 260 340 210 S560 140 640 200" />
            <path d="M0 260 C120 210 220 320 340 270 S560 200 640 260" />
            <path d="M0 330 C140 290 240 400 360 350 S560 290 640 340" />
            <path d="M0 410 C140 370 260 470 380 430 S560 380 640 420" />
            <path d="M0 500 C140 460 260 550 380 520 S560 470 640 510" />
            <path d="M80 76 C120 200 60 300 140 420 S200 520 160 600" stroke={GREEN_400} strokeWidth="5" strokeOpacity="0.5" />
          </g>
          <g stroke={GREEN_700} strokeOpacity="0.35" strokeWidth="1.5" fill="none">
            <path d="M110 170 L210 250 L330 160 L420 290 L210 250" />
            <path d="M420 290 L490 190 M420 290 L520 420 M210 250 L180 380 L300 430 L420 290 M300 430 L400 500 L520 420 M180 380 L90 480 L300 430" />
          </g>
          {SENSORS.map((s) => (
            <g key={`${s.x}-${s.y}`}>
              <circle cx={s.x} cy={s.y} r={s.color === GREEN_700 ? 16 : 22} fill={s.color} fillOpacity="0.22" />
              <circle cx={s.x} cy={s.y} r={9} fill={s.color} stroke="#ffffff" strokeWidth="3" />
            </g>
          ))}
          <rect x="44" y="96" width="210" height="36" rx="18" fill="#ffffff" />
          <text x="66" y="120" fontSize="18" fontWeight="700" fill={INK}>
            Mapa de sensores
          </text>
          <rect x="44" y="520" width="190" height="36" rx="18" fill="#ffffff" />
          <circle cx="68" cy="538" r="8" fill={GREEN_700} />
          <text x="86" y="544" fontSize="17" fill={MUTED}>
            Sensor activo
          </text>
        </g>

        {/* Time series card */}
        <g>
          <rect x="644" y="76" width="292" height="236" rx="16" fill="#f7f9f8" stroke="#e3e9e5" />
          <text x="664" y="110" fontSize="18" fontWeight="700" fill={INK}>
            Serie temporal
          </text>
          <g transform="translate(656 130)">
            <line x1="0" y1="40" x2="268" y2="40" stroke={ORANGE} strokeWidth="2" strokeDasharray="6 6" />
            <text x="0" y="28" fontSize="16" fill={MUTED}>
              Umbral
            </text>
            <path d={`${SERIES} L268 170 L0 170 Z`} fill={GREEN_400} fillOpacity="0.22" />
            <path d={SERIES} fill="none" stroke={GREEN_700} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="268" cy="38" r="8" fill={ORANGE} stroke="#ffffff" strokeWidth="3" />
          </g>
        </g>

        {/* Alerts card */}
        <g>
          <rect x="644" y="328" width="292" height="248" rx="16" fill="#f7f9f8" stroke="#e3e9e5" />
          <text x="664" y="362" fontSize="18" fontWeight="700" fill={INK}>
            Alertas
          </text>
          {ALERTS.map((a, i) => {
            const cy = 410 + i * 62;
            return (
              <g key={a.label}>
                <rect x="660" y={cy - 28} width="260" height="52" rx="12" fill="#ffffff" stroke="#e3e9e5" />
                <AlertShape shape={a.shape} color={a.color} cy={cy - 2} />
                <text x="708" y={cy + 4} fontSize="18" fontWeight="700" fill={INK}>
                  {a.label}
                </text>
                <rect x="820" y={cy - 10} width={70 - i * 12} height="8" rx="4" fill="#d9e1dc" />
              </g>
            );
          })}
        </g>
      </svg>
      <figcaption className="mt-5 text-center text-sm text-m3-muted">
        {howItWorks.mockCaption}
      </figcaption>
    </figure>
  );
}
