interface NodeNetworkProps {
  className?: string;
  /** Number of nodes (kept small on purpose; max 60). */
  nodes?: number;
  seed?: number;
}

const VIEW_W = 800;
const VIEW_H = 500;
const MAX_NODES = 60;
const MAX_LINK_DISTANCE = 170;
const MAX_LINKS_PER_NODE = 3;

// Mulberry32: deterministic PRNG so server and client render identical markup.
function createRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildNetwork(count: number, seed: number) {
  const rand = createRng(seed);
  const n = Math.min(Math.max(count, 2), MAX_NODES);
  const points = Array.from({ length: n }, () => ({
    x: Math.round(rand() * VIEW_W * 10) / 10,
    y: Math.round(rand() * VIEW_H * 10) / 10,
    r: Math.round((1.6 + rand() * 2.4) * 10) / 10,
  }));
  const links: Array<[number, number]> = [];
  const degree = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    const near = points
      .map((p, j) => ({ j, d: Math.hypot(p.x - points[i].x, p.y - points[i].y) }))
      .filter(({ j, d }) => j !== i && d <= MAX_LINK_DISTANCE)
      .sort((a, b) => a.d - b.d);
    for (const { j } of near) {
      if (degree[i] >= MAX_LINKS_PER_NODE) break;
      if (degree[j] >= MAX_LINKS_PER_NODE) continue;
      if (links.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) continue;
      links.push([i, j]);
      degree[i]++;
      degree[j]++;
    }
  }
  return { points, links };
}

export function NodeNetwork({ className, nodes = 44, seed = 7 }: NodeNetworkProps) {
  const { points, links } = buildNetwork(nodes, seed);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      <g stroke="#B7E3C7" strokeOpacity="0.28" strokeWidth="1" fill="none">
        {links.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={points[a].x} y1={points[a].y} x2={points[b].x} y2={points[b].y} />
        ))}
      </g>
      <g fill="#B7E3C7" fillOpacity="0.55">
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} />
        ))}
      </g>
    </svg>
  );
}
