"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  InstancedMesh,
  MathUtils,
  Mesh,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  RingGeometry,
  SphereGeometry,
  SRGBColorSpace,
  type Material,
} from "three";
import {
  GRID_HEIGHT,
  PALETTE,
  TERRAIN_SIZE,
  cellQuadPositions,
  generateSensors,
  gridLinePositions,
  heightAt,
  levelColor,
  surveyPath,
  swathMesh,
  terrainVertexGrid,
  terrainWirePositions,
} from "./terrain";
import type { ScaleId } from "@/types";

const TERRAIN_SEGMENTS = 64;
const DIM_LEVEL = 0.12;
const FADE_LAMBDA = 8; // ~400 ms to settle
const ORBIT_DEGREES = 8;
const ORBIT_SPEED = 0.11;
const CAMERA_RADIUS = 20.5;
const CAMERA_TARGET_Y = 0.9;
const CAMERA_HEIGHT = 11.5;
const CAMERA_BASE_AZIMUTH = Math.PI / 4;
const SURVEY_SECONDS = 26;
const SURVEY_HEAD_START = 0.45;
const SCAN_SECONDS = 9;
const PULSE_SECONDS = 3.2;

interface TerrainSceneProps {
  activeScale: ScaleId;
  /** Stops the render loop while the canvas is off screen. */
  paused: boolean;
  onReady: () => void;
  onFail: () => void;
}

function srgb(hex: string): Color {
  return new Color().setStyle(hex, SRGBColorSpace);
}

/** Dispose GPU resources when the owning component unmounts. */
function useDisposable<T extends { dispose(): void }>(resource: T): T {
  useEffect(() => () => resource.dispose(), [resource]);
  return resource;
}

function CameraRig() {
  useFrame(({ camera, clock }) => {
    const az = CAMERA_BASE_AZIMUTH + MathUtils.degToRad(ORBIT_DEGREES) * Math.sin(clock.elapsedTime * ORBIT_SPEED);
    camera.position.set(Math.cos(az) * CAMERA_RADIUS, CAMERA_HEIGHT, Math.sin(az) * CAMERA_RADIUS);
    camera.lookAt(0, CAMERA_TARGET_Y, 0);
  });
  return null;
}

/** Eases a layer between full opacity (active) and dimmed, scaling every material's authored opacity. */
function Layer({ active, children }: { active: boolean; children: ReactNode }) {
  const ref = useRef<Group>(null);
  const level = useRef(active ? 1 : DIM_LEVEL);
  useFrame((_, dt) => {
    const group = ref.current;
    if (!group) return;
    level.current = MathUtils.damp(level.current, active ? 1 : DIM_LEVEL, FADE_LAMBDA, dt);
    group.traverse((obj) => {
      const material = (obj as Mesh).material as Material | Material[] | undefined;
      if (!material || Array.isArray(material)) return;
      const base = (material.userData.baseOpacity ??= material.opacity) as number;
      material.opacity = base * level.current;
    });
  });
  return <group ref={ref}>{children}</group>;
}

function Terrain() {
  const geometry = useDisposable(
    useMemo(() => {
      const geo = new PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS);
      geo.rotateX(-Math.PI / 2);
      const { positions, colors } = terrainVertexGrid(TERRAIN_SEGMENTS);
      geo.setAttribute("position", new BufferAttribute(positions, 3));
      const linear = new Float32Array(colors.length);
      const c = new Color();
      for (let i = 0; i < colors.length; i += 3) {
        c.setRGB(colors[i], colors[i + 1], colors[i + 2], SRGBColorSpace);
        linear.set([c.r, c.g, c.b], i);
      }
      geo.setAttribute("color", new BufferAttribute(linear, 3));
      geo.computeVertexNormals();
      return geo;
    }, []),
  );
  const wire = useDisposable(
    useMemo(() => {
      const geo = new BufferGeometry();
      geo.setAttribute("position", new BufferAttribute(terrainWirePositions(24, 48, 0.012), 3));
      return geo;
    }, []),
  );
  return (
    <group>
      <mesh geometry={geometry}>
        <meshLambertMaterial vertexColors flatShading />
      </mesh>
      <lineSegments geometry={wire}>
        <lineBasicMaterial color={srgb(PALETTE.green200)} transparent opacity={0.24} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

function Sensors() {
  const sensors = useMemo(() => generateSensors(), []);
  const heads = useRef<InstancedMesh>(null);
  const stems = useRef<InstancedMesh>(null);
  const rings = useRef<InstancedMesh>(null);
  const headGeo = useDisposable(useMemo(() => new SphereGeometry(0.12, 12, 8), []));
  const stemGeo = useDisposable(useMemo(() => new CylinderGeometry(0.014, 0.014, 0.34, 5), []));
  const ringGeo = useDisposable(
    useMemo(() => {
      const geo = new RingGeometry(0.17, 0.21, 28);
      geo.rotateX(-Math.PI / 2);
      return geo;
    }, []),
  );
  const dummy = useMemo(() => new Object3D(), []);

  useEffect(() => {
    const color = new Color();
    sensors.forEach((s, i) => {
      color.setStyle(levelColor(s.level), SRGBColorSpace);
      heads.current?.setColorAt(i, color);
      rings.current?.setColorAt(i, color);
      dummy.position.set(s.x, s.y + 0.17, s.z);
      dummy.scale.setScalar(s.level ? 1.25 : 1);
      dummy.updateMatrix();
      heads.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(s.x, s.y + 0.15, s.z);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      stems.current?.setMatrixAt(i, dummy.matrix);
    });
    for (const mesh of [heads.current, stems.current]) {
      if (mesh) mesh.instanceMatrix.needsUpdate = true;
    }
    if (heads.current?.instanceColor) heads.current.instanceColor.needsUpdate = true;
    if (rings.current?.instanceColor) rings.current.instanceColor.needsUpdate = true;
  }, [sensors, dummy]);

  useFrame(({ clock }) => {
    const mesh = rings.current;
    if (!mesh) return;
    sensors.forEach((s, i) => {
      const phase = (clock.elapsedTime / PULSE_SECONDS + i * 0.37) % 1;
      dummy.position.set(s.x, s.y + 0.04, s.z);
      dummy.scale.setScalar((s.level ? 1.3 : 1) * (0.7 + phase * 1.9));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  const n = sensors.length;
  return (
    <>
      <instancedMesh ref={stems} args={[stemGeo, undefined, n]} frustumCulled={false}>
        <meshBasicMaterial color={srgb(PALETTE.green200)} transparent opacity={0.6} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[headGeo, undefined, n]} frustumCulled={false}>
        <meshBasicMaterial transparent opacity={1} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={rings} args={[ringGeo, undefined, n]} frustumCulled={false}>
        <meshBasicMaterial transparent opacity={0.55} side={DoubleSide} depthWrite={false} />
      </instancedMesh>
    </>
  );
}

function Survey() {
  const path = useMemo(() => surveyPath(), []);
  const ribbon = useDisposable(
    useMemo(() => {
      const { positions, indices } = swathMesh(path);
      const geo = new BufferGeometry();
      geo.setAttribute("position", new BufferAttribute(positions, 3));
      geo.setIndex(new BufferAttribute(indices, 1));
      geo.setDrawRange(0, 0);
      return geo;
    }, [path]),
  );
  const droneGeo = useDisposable(useMemo(() => new ConeGeometry(0.18, 0.3, 4), []));
  const drone = useRef<Mesh>(null);
  const segments = path.length - 1;

  useFrame(({ clock }) => {
    const p = ((clock.elapsedTime + SURVEY_SECONDS * SURVEY_HEAD_START) % SURVEY_SECONDS) / SURVEY_SECONDS;
    const pos = p * segments;
    const i = Math.min(segments - 1, Math.floor(pos));
    ribbon.setDrawRange(0, Math.floor(pos) * 6);
    const d = drone.current;
    if (!d) return;
    const f = pos - i;
    const x = path[i][0] + (path[i + 1][0] - path[i][0]) * f;
    const z = path[i][1] + (path[i + 1][1] - path[i][1]) * f;
    d.position.set(x, heightAt(x, z) + 0.75 + Math.sin(clock.elapsedTime * 1.6) * 0.04, z);
    d.rotation.y = Math.atan2(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]);
  });

  return (
    <>
      <mesh geometry={ribbon} frustumCulled={false}>
        <meshBasicMaterial
          color={srgb(PALETTE.green400)}
          transparent
          opacity={0.3}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={drone} geometry={droneGeo} rotation-x={Math.PI / 2}>
        <meshBasicMaterial color={srgb(PALETTE.green200)} transparent opacity={1} />
      </mesh>
    </>
  );
}

function SatelliteGrid() {
  const lines = useDisposable(
    useMemo(() => {
      const geo = new BufferGeometry();
      geo.setAttribute("position", new BufferAttribute(gridLinePositions(), 3));
      return geo;
    }, []),
  );
  const cells = useMemo(
    () =>
      ([1, 2] as const).map((level) => {
        const geo = new BufferGeometry();
        geo.setAttribute("position", new BufferAttribute(cellQuadPositions(level), 3));
        return { level, geo };
      }),
    [],
  );
  useEffect(() => () => cells.forEach((c) => c.geo.dispose()), [cells]);
  const scan = useRef<Mesh>(null);
  const scanGeo = useDisposable(useMemo(() => new PlaneGeometry(0.05, TERRAIN_SIZE), []));

  useFrame(({ clock }) => {
    const s = scan.current;
    if (!s) return;
    const p = (clock.elapsedTime % SCAN_SECONDS) / SCAN_SECONDS;
    s.position.set((p - 0.5) * TERRAIN_SIZE, GRID_HEIGHT + 0.005, 0);
  });

  return (
    <>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color={srgb(PALETTE.green200)} transparent opacity={0.5} depthWrite={false} />
      </lineSegments>
      {cells.map(({ level, geo }) => (
        <mesh key={level} geometry={geo}>
          <meshBasicMaterial
            color={srgb(levelColor(level))}
            transparent
            opacity={0.38}
            side={DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
      <mesh ref={scan} geometry={scanGeo} rotation-x={-Math.PI / 2}>
        <meshBasicMaterial
          color={srgb(PALETTE.green200)}
          transparent
          opacity={0.85}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

export default function TerrainScene({ activeScale, paused, onReady, onFail }: TerrainSceneProps) {
  const lights = useMemo(() => {
    const ambient = new AmbientLight(srgb(PALETTE.green200), 1.0);
    const sun = new DirectionalLight(0xffffff, 1.2);
    sun.position.set(-5, 10, 4);
    return { ambient, sun };
  }, []);

  return (
    <Canvas
      frameloop={paused ? "never" : "always"}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ fov: 30, near: 0.1, far: 60, position: [11, CAMERA_HEIGHT, 11] }}
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
      onCreated={({ gl, camera }) => {
        (camera as PerspectiveCamera).lookAt(0, CAMERA_TARGET_Y, 0);
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onFail();
        });
        onReady();
      }}
    >
      <CameraRig />
      <primitive object={lights.ambient} />
      <primitive object={lights.sun} />
      <Terrain />
      <Layer active={activeScale === "m1"}>
        <Sensors />
      </Layer>
      <Layer active={activeScale === "m2"}>
        <Survey />
      </Layer>
      <Layer active={activeScale === "m3"}>
        <SatelliteGrid />
      </Layer>
    </Canvas>
  );
}

