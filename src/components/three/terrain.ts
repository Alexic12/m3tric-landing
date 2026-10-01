/**
 * Pure, deterministic helpers shared by the WebGL scene and the SVG fallback.
 * No Math.random, no DOM, no three.js: the same inputs always yield the same
 * numbers, so server-rendered SVG and the client scene describe the same land.
 */

export const PALETTE = {
  green900: "#004124",
  green700: "#2C694F",
  green400: "#74C69D",
  green200: "#B7E3C7",
  yellow: "#FFD166",
  orange: "#F77F00",
} as const;

export const TERRAIN_SIZE = 10;
const HALF = TERRAIN_SIZE / 2;
/** World-space height of the M3 satellite grid plane. */
export const GRID_HEIGHT = 3;
export const GRID_DIVS = 8;
/** Max terrain height, used to normalise colours. */
export const MAX_HEIGHT = 1.7;

const NOISE_SEED = 20240611;

/** Small fast seeded PRNG (mulberry32). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(ix: number, iz: number): number {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iz, 668265263) ^ NOISE_SEED;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function valueNoise(x: number, z: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = smooth(x - ix);
  const fz = smooth(z - iz);
  const a = hash2(ix, iz);
  const b = hash2(ix + 1, iz);
  const c = hash2(ix, iz + 1);
  const d = hash2(ix + 1, iz + 1);
  return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
}

function fbm(x: number, z: number): number {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let o = 0; o < 3; o++) {
    sum += valueNoise(x * freq, z * freq) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

/** 1 in the interior, easing to 0 at the square border of the terrain. */
export function edgeFalloff(x: number, z: number): number {
  const e = Math.max(Math.abs(x), Math.abs(z)) / HALF;
  const t = Math.min(1, Math.max(0, (e - 0.55) / 0.45));
  return 1 - smooth(t);
}

export function heightAt(x: number, z: number): number {
  const n = fbm(x * 0.3 + 3.1, z * 0.3 - 1.7);
  const h = Math.max(0, n - 0.22) * 2.7 * edgeFalloff(x, z);
  return Math.min(MAX_HEIGHT, h);
}

type RGB = readonly [number, number, number];

function hexToRgb(hex: string): RGB {
  const v = parseInt(hex.slice(1), 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

const LOW = hexToRgb(PALETTE.green700);
const MID = hexToRgb(PALETTE.green400);
const PEAK = hexToRgb(PALETTE.green200);
const BG = hexToRgb(PALETTE.green900);

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/** sRGB colour (0..1) of the terrain at a point: low to mid to peak, fading into the background at the edges. */
export function terrainColor(x: number, z: number): RGB {
  const t = Math.pow(Math.min(1, heightAt(x, z) / MAX_HEIGHT), 1.35);
  const base = t < 0.55 ? mix(LOW, MID, t / 0.55) : mix(MID, PEAK, (t - 0.55) / 0.45);
  const edge = edgeFalloff(x, z);
  return mix(BG, base, Math.min(1, 0.25 + edge * 0.75));
}

/** Displaced plane vertices (x, y, z) for a square grid of `segments` cells. */
export function terrainVertexGrid(segments: number): { positions: Float32Array; colors: Float32Array } {
  const n = segments + 1;
  const positions = new Float32Array(n * n * 3);
  const colors = new Float32Array(n * n * 3);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const x = (i / segments - 0.5) * TERRAIN_SIZE;
      const z = (j / segments - 0.5) * TERRAIN_SIZE;
      const k = (j * n + i) * 3;
      positions[k] = x;
      positions[k + 1] = heightAt(x, z);
      positions[k + 2] = z;
      const c = terrainColor(x, z);
      colors[k] = c[0];
      colors[k + 1] = c[1];
      colors[k + 2] = c[2];
    }
  }
  return { positions, colors };
}

/** Line segments (pairs of points) draped over the terrain: a coarse network echoing the brand node graph. */
export function terrainWirePositions(divs: number, samples: number, lift: number): Float32Array {
  const out: number[] = [];
  const pt = (x: number, z: number) => out.push(x, heightAt(x, z) + lift, z);
  for (let a = 0; a <= divs; a++) {
    const c = (a / divs - 0.5) * TERRAIN_SIZE;
    for (let s = 0; s < samples; s++) {
      const u0 = (s / samples - 0.5) * TERRAIN_SIZE;
      const u1 = ((s + 1) / samples - 0.5) * TERRAIN_SIZE;
      pt(u0, c);
      pt(u1, c);
      pt(c, u0);
      pt(c, u1);
    }
  }
  return new Float32Array(out);
}

export type SensorLevel = 0 | 1 | 2;
export interface Sensor {
  x: number;
  y: number;
  z: number;
  /** 0 normal, 1 attention (yellow), 2 alert (orange). */
  level: SensorLevel;
}

const SENSOR_COUNT = 18;
const SENSOR_MIN_DISTANCE = 1.15;
const SENSOR_REACH = 3.9;
const SENSOR_ATTENTION_INDEX = 4;
const SENSOR_ALERT_INDEX = 11;

export function generateSensors(): Sensor[] {
  const rand = mulberry32(7);
  const pts: Sensor[] = [];
  let guard = 0;
  while (pts.length < SENSOR_COUNT && guard++ < 2000) {
    const x = (rand() * 2 - 1) * SENSOR_REACH;
    const z = (rand() * 2 - 1) * SENSOR_REACH;
    if (pts.some((p) => Math.hypot(p.x - x, p.z - z) < SENSOR_MIN_DISTANCE)) continue;
    const index = pts.length;
    const level: SensorLevel =
      index === SENSOR_ATTENTION_INDEX ? 1 : index === SENSOR_ALERT_INDEX ? 2 : 0;
    pts.push({ x, y: heightAt(x, z), z, level });
  }
  return pts;
}

export function levelColor(level: SensorLevel): string {
  return level === 1 ? PALETTE.yellow : level === 2 ? PALETTE.orange : PALETTE.green200;
}

const SURVEY_X = 3.6;
const SURVEY_Z = 2.4;
const SURVEY_PASSES = 4;
const SURVEY_STEP = 0.14;
export const SWATH_HALF_WIDTH = 0.55;
const SWATH_LIFT = 0.07;
/** Samples either side used to smooth the ribbon direction so corners do not twist. */
const DIRECTION_WINDOW = 4;

/** Lawnmower survey path sampled at a fixed step: [x, z] pairs. */
export function surveyPath(): [number, number][] {
  const pts: [number, number][] = [];
  const push = (x: number, z: number) => pts.push([x, z]);
  for (let p = 0; p < SURVEY_PASSES; p++) {
    const z = -SURVEY_Z + (p * 2 * SURVEY_Z) / (SURVEY_PASSES - 1);
    const dir = p % 2 === 0 ? 1 : -1;
    const from = -SURVEY_X * dir;
    const steps = Math.round((2 * SURVEY_X) / SURVEY_STEP);
    for (let s = 0; s <= steps; s++) push(from + (2 * SURVEY_X * dir * s) / steps, z);
    if (p < SURVEY_PASSES - 1) {
      const zNext = -SURVEY_Z + ((p + 1) * 2 * SURVEY_Z) / (SURVEY_PASSES - 1);
      const turn = Math.round((zNext - z) / SURVEY_STEP);
      for (let s = 1; s < turn; s++) push(from + 2 * SURVEY_X * dir, z + ((zNext - z) * s) / turn);
    }
  }
  return pts;
}

/** Left/right edge points of a ribbon following the path, plus its centre. */
export function swathEdges(path: [number, number][]): {
  left: [number, number][];
  right: [number, number][];
} {
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  for (let i = 0; i < path.length; i++) {
    const a = path[Math.max(0, i - DIRECTION_WINDOW)];
    const b = path[Math.min(path.length - 1, i + DIRECTION_WINDOW)];
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const len = Math.hypot(dx, dz) || 1;
    const nx = (-dz / len) * SWATH_HALF_WIDTH;
    const nz = (dx / len) * SWATH_HALF_WIDTH;
    left.push([path[i][0] + nx, path[i][1] + nz]);
    right.push([path[i][0] - nx, path[i][1] - nz]);
  }
  return { left, right };
}

/** Triangle-strip mesh (positions + indices) for the swath ribbon draped on the terrain. */
export function swathMesh(path: [number, number][]): { positions: Float32Array; indices: Uint32Array } {
  const { left, right } = swathEdges(path);
  const positions = new Float32Array(path.length * 6);
  for (let i = 0; i < path.length; i++) {
    const [lx, lz] = left[i];
    const [rx, rz] = right[i];
    positions.set([lx, heightAt(lx, lz) + SWATH_LIFT, lz, rx, heightAt(rx, rz) + SWATH_LIFT, rz], i * 6);
  }
  const indices = new Uint32Array((path.length - 1) * 6);
  for (let i = 0; i < path.length - 1; i++) {
    const a = i * 2;
    indices.set([a, a + 1, a + 2, a + 1, a + 3, a + 2], i * 6);
  }
  return { positions, indices };
}

/** Line segments of the M3 grid plane. */
export function gridLinePositions(): Float32Array {
  const out: number[] = [];
  for (let i = 0; i <= GRID_DIVS; i++) {
    const c = (i / GRID_DIVS - 0.5) * TERRAIN_SIZE;
    out.push(-HALF, GRID_HEIGHT, c, HALF, GRID_HEIGHT, c, c, GRID_HEIGHT, -HALF, c, GRID_HEIGHT, HALF);
  }
  return new Float32Array(out);
}

export interface GridCell {
  i: number;
  j: number;
  level: 1 | 2;
}

export const HIGHLIGHT_CELLS: readonly GridCell[] = [
  { i: 2, j: 5, level: 1 },
  { i: 3, j: 5, level: 1 },
  { i: 5, j: 2, level: 2 },
  { i: 6, j: 6, level: 1 },
  { i: 1, j: 2, level: 1 },
];

export function cellCorners(i: number, j: number): [number, number][] {
  const s = TERRAIN_SIZE / GRID_DIVS;
  const x0 = -HALF + i * s;
  const z0 = -HALF + j * s;
  return [
    [x0, z0],
    [x0 + s, z0],
    [x0 + s, z0 + s],
    [x0, z0 + s],
  ];
}

/** Flat quads (two triangles each) for the highlighted cells of one level. */
export function cellQuadPositions(level: 1 | 2): Float32Array {
  const out: number[] = [];
  for (const c of HIGHLIGHT_CELLS) {
    if (c.level !== level) continue;
    const [a, b, cc, d] = cellCorners(c.i, c.j);
    for (const [x, z] of [a, b, cc, a, cc, d]) out.push(x, GRID_HEIGHT, z);
  }
  return new Float32Array(out);
}

/* ---------- Isometric projection for the SVG fallback ---------- */

export const ISO_VIEWBOX = { width: 800, height: 600 } as const;
const ISO_K = 36;
const ISO_LIFT = 58;
const ISO_ORIGIN_Y = 372;
const COS30 = Math.sqrt(3) / 2;

/** World (x, y, z) to SVG coordinates, rounded so server and client markup match. */
export function iso(x: number, y: number, z: number): [number, number] {
  const sx = ISO_VIEWBOX.width / 2 + (x - z) * COS30 * ISO_K;
  const sy = ISO_ORIGIN_Y + (x + z) * 0.5 * ISO_K - y * ISO_LIFT;
  return [Math.round(sx * 10) / 10, Math.round(sy * 10) / 10];
}
