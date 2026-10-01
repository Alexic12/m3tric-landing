import {
  GRID_DIVS,
  GRID_HEIGHT,
  HIGHLIGHT_CELLS,
  ISO_VIEWBOX,
  PALETTE,
  TERRAIN_SIZE,
  cellCorners,
  generateSensors,
  heightAt,
  iso,
  levelColor,
  surveyPath,
  swathEdges,
} from "./terrain";
import type { ScaleId } from "@/types";

const HALF = TERRAIN_SIZE / 2;
const ROWS = 26;
const ROW_SAMPLES = 52;
const BASE_Y = -0.45;
const DIM_OPACITY = 0.14;
const DRONE_PROGRESS = 0.38;

/** Opaque blend of `top` over `base` at `alpha`: one path per row instead of an opaque base plus a translucent copy. */
function blend(base: string, top: string, alpha: number): string {
  const channel = (hex: string, at: number) => parseInt(hex.slice(at, at + 2), 16);
  const mixed = [1, 3, 5].map((at) =>
    Math.round(channel(base, at) * (1 - alpha) + channel(top, at) * alpha)
      .toString(16)
      .padStart(2, "0"),
  );
  return `#${mixed.join("")}`;
}

const pts = (list: [number, number][]) => list.map(([x, y]) => `${x},${y}`).join(" ");

/** Ridge-line terrain drawn back to front; each row occludes the ones behind it. */
function buildRows() {
  const rows: { d: string; front: number; fill: string }[] = [];
  for (let r = 0; r <= ROWS; r++) {
    const z = -HALF + (r / ROWS) * TERRAIN_SIZE;
    const line: [number, number][] = [];
    for (let s = 0; s <= ROW_SAMPLES; s++) {
      const x = -HALF + (s / ROW_SAMPLES) * TERRAIN_SIZE;
      line.push(iso(x, heightAt(x, z), z));
    }
    const [endX] = iso(HALF, BASE_Y, z);
    const [, endY] = iso(HALF, BASE_Y, z);
    const [startX, startY] = iso(-HALF, BASE_Y, z);
    const front = r / ROWS;
    rows.push({
      d: `M${pts(line).replace(/ /g, "L")}L${endX},${endY}L${startX},${startY}Z`,
      front,
      fill: blend(PALETTE.green900, PALETTE.green700, 0.1 + front * 0.4),
    });
  }
  return rows;
}

const ROWS_DATA = buildRows();
const SENSORS = generateSensors();
const PATH = surveyPath();

function swathPath(): string {
  const { left, right } = swathEdges(PATH);
  const step = 2;
  let d = "";
  for (let i = 0; i + step < PATH.length; i += step) {
    const quad: [number, number][] = [
      iso(left[i][0], heightAt(left[i][0], left[i][1]) + 0.07, left[i][1]),
      iso(left[i + step][0], heightAt(left[i + step][0], left[i + step][1]) + 0.07, left[i + step][1]),
      iso(right[i + step][0], heightAt(right[i + step][0], right[i + step][1]) + 0.07, right[i + step][1]),
      iso(right[i][0], heightAt(right[i][0], right[i][1]) + 0.07, right[i][1]),
    ];
    d += `M${pts(quad).replace(/ /g, "L")}Z`;
  }
  return d;
}

const SWATH_D = swathPath();
const PATH_D = `M${pts(PATH.filter((_, i) => i % 3 === 0).map(([x, z]) => iso(x, heightAt(x, z) + 0.09, z))).replace(/ /g, "L")}`;
const DRONE_POINT = PATH[Math.floor(PATH.length * DRONE_PROGRESS)];
const DRONE_XY = iso(DRONE_POINT[0], heightAt(DRONE_POINT[0], DRONE_POINT[1]) + 0.75, DRONE_POINT[1]);
const DRONE_GROUND = iso(DRONE_POINT[0], heightAt(DRONE_POINT[0], DRONE_POINT[1]) + 0.07, DRONE_POINT[1]);

function gridLines(): string {
  let d = "";
  for (let i = 0; i <= GRID_DIVS; i++) {
    const c = -HALF + (i / GRID_DIVS) * TERRAIN_SIZE;
    const [ax, ay] = iso(-HALF, GRID_HEIGHT, c);
    const [bx, by] = iso(HALF, GRID_HEIGHT, c);
    const [cx, cy] = iso(c, GRID_HEIGHT, -HALF);
    const [ex, ey] = iso(c, GRID_HEIGHT, HALF);
    d += `M${ax},${ay}L${bx},${by}M${cx},${cy}L${ex},${ey}`;
  }
  return d;
}

const GRID_D = gridLines();
const CELLS = HIGHLIGHT_CELLS.map((c) => ({
  key: `${c.i}-${c.j}`,
  color: levelColor(c.level),
  points: pts(cellCorners(c.i, c.j).map(([x, z]) => iso(x, GRID_HEIGHT, z))),
}));
const SCAN_FROM = iso(-HALF + 3.5 * (TERRAIN_SIZE / GRID_DIVS), GRID_HEIGHT, -HALF);
const SCAN_TO = iso(-HALF + 3.5 * (TERRAIN_SIZE / GRID_DIVS), GRID_HEIGHT, HALF);
const ANCHORS = ([
  [-HALF, -HALF],
  [HALF, -HALF],
  [HALF, HALF],
  [-HALF, HALF],
] as const).map(([x, z]) => ({ top: iso(x, GRID_HEIGHT, z), bottom: iso(x, heightAt(x, z), z) }));

const layerClass = "transition-opacity duration-[400ms] ease-out motion-reduce:transition-none";

export default function TerrainFallback({ activeScale }: { activeScale: ScaleId }) {
  const opacityOf = (id: ScaleId) => (id === activeScale ? 1 : DIM_OPACITY);

  return (
    <svg
      viewBox={`0 0 ${ISO_VIEWBOX.width} ${ISO_VIEWBOX.height}`}
      className="h-full w-full"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <g>
        {ROWS_DATA.map((row, i) => (
          <path
            key={i}
            d={row.d}
            fill={row.fill}
            stroke={row.front > 0.5 ? PALETTE.green400 : PALETTE.green700}
            strokeOpacity={0.5 + row.front * 0.5}
            strokeWidth={1.1}
            strokeLinejoin="round"
          />
        ))}
      </g>

      <g className={layerClass} style={{ opacity: opacityOf("m2") }}>
        <path d={SWATH_D} fill={PALETTE.green400} fillOpacity={0.28} />
        <path
          d={PATH_D}
          fill="none"
          stroke={PALETTE.green200}
          strokeOpacity={0.7}
          strokeWidth={1}
          strokeDasharray="3 5"
        />
        <line
          x1={DRONE_GROUND[0]}
          y1={DRONE_GROUND[1]}
          x2={DRONE_XY[0]}
          y2={DRONE_XY[1]}
          stroke={PALETTE.green200}
          strokeOpacity={0.5}
          strokeWidth={1}
        />
        <g transform={`translate(${DRONE_XY[0]} ${DRONE_XY[1]})`}>
          <path d="M0,-9 L11,4 L0,0 L-11,4 Z" fill={PALETTE.green200} />
          <circle r={2} cy={-1} fill={PALETTE.green900} />
        </g>
      </g>

      <g className={layerClass} style={{ opacity: opacityOf("m1") }}>
        {SENSORS.map((s, i) => {
          const [x, y] = iso(s.x, s.y + 0.1, s.z);
          const color = levelColor(s.level);
          return (
            <g key={i}>
              <ellipse
                cx={x}
                cy={y + 1}
                rx={s.level ? 15 : 11}
                ry={s.level ? 7.5 : 5.5}
                fill="none"
                stroke={color}
                strokeOpacity={0.6}
                strokeWidth={1.2}
              />
              <circle cx={x} cy={y} r={s.level ? 5 : 4} fill={color} />
            </g>
          );
        })}
      </g>

      <g className={layerClass} style={{ opacity: opacityOf("m3") }}>
        {ANCHORS.map((a, i) => (
          <line
            key={i}
            x1={a.top[0]}
            y1={a.top[1]}
            x2={a.bottom[0]}
            y2={a.bottom[1]}
            stroke={PALETTE.green200}
            strokeOpacity={0.3}
            strokeDasharray="2 5"
          />
        ))}
        {CELLS.map((c) => (
          <polygon key={c.key} points={c.points} fill={c.color} fillOpacity={0.4} />
        ))}
        <path d={GRID_D} fill="none" stroke={PALETTE.green200} strokeOpacity={0.55} strokeWidth={1} />
        <line
          x1={SCAN_FROM[0]}
          y1={SCAN_FROM[1]}
          x2={SCAN_TO[0]}
          y2={SCAN_TO[1]}
          stroke={PALETTE.green200}
          strokeWidth={2.2}
          strokeOpacity={0.9}
        />
      </g>
    </svg>
  );
}
