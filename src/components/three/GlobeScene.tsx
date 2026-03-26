"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function seededRandom(seed: number) {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

function GlobePoints() {
  const ref = useRef<THREE.Points>(null!);
  const gridRef = useRef<THREE.Points>(null!);

  const [spherePositions, sphereColors] = useMemo(() => {
    const count = 4000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const radius = 2.2;

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Green tones for light background
      const lat = Math.abs(phi - Math.PI / 2) / (Math.PI / 2);
      colors[i * 3] = 0.1 + lat * 0.15;     // R
      colors[i * 3 + 1] = 0.4 + seededRandom(i * 2 + 1) * 0.35; // G
      colors[i * 3 + 2] = 0.15 + seededRandom(i * 2 + 2) * 0.2;  // B
    }
    return [positions, colors];
  }, []);

  const gridPositions = useMemo(() => {
    const points: number[] = [];
    const radius = 2.22;
    for (let lat = -80; lat <= 80; lat += 20) {
      const phi = ((90 - lat) * Math.PI) / 180;
      for (let lng = 0; lng < 360; lng += 3) {
        const theta = (lng * Math.PI) / 180;
        points.push(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        );
      }
    }
    for (let lng = 0; lng < 360; lng += 30) {
      const theta = (lng * Math.PI) / 180;
      for (let lat = -90; lat <= 90; lat += 3) {
        const phi = ((90 - lat) * Math.PI) / 180;
        points.push(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        );
      }
    }
    return new Float32Array(points);
  }, []);

  // Hotspot blob layer disabled for now. Uncomment this block and the matching
  // <Points> block below if you want to restore the brighter static clusters.
  // const hotspotPositions = useMemo(() => {
  //   const points: number[] = [];
  //   const radius = 2.35;
  //   const hotspots = [
  //     { lat: 6.25, lng: -75.57, count: 60 },
  //     { lat: 4.71, lng: -74.07, count: 40 },
  //     { lat: 3.45, lng: -76.53, count: 30 },
  //     { lat: 10.39, lng: -75.51, count: 25 },
  //     { lat: -12.05, lng: -77.04, count: 15 },
  //     { lat: -23.55, lng: -46.63, count: 20 },
  //     { lat: 19.43, lng: -99.13, count: 15 },
  //   ];
  //   for (const hs of hotspots) {
  //     for (let i = 0; i < hs.count; i++) {
  //       const pointSeed = hs.lat * 1000 + hs.lng * 100 + i;
  //       const lat = hs.lat + (seededRandom(pointSeed) - 0.5) * 5;
  //       const lng = hs.lng + (seededRandom(pointSeed + 1) - 0.5) * 5;
  //       const phi = ((90 - lat) * Math.PI) / 180;
  //       const theta = ((lng + 180) * Math.PI) / 180;
  //       const r = radius + seededRandom(pointSeed + 2) * 0.15;
  //       points.push(
  //         r * Math.sin(phi) * Math.cos(theta),
  //         r * Math.cos(phi),
  //         r * Math.sin(phi) * Math.sin(theta)
  //       );
  //     }
  //   }
  //   return new Float32Array(points);
  // }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) ref.current.rotation.y = t * 0.05;
    if (gridRef.current) gridRef.current.rotation.y = t * 0.05;
  });

  return (
    <group>
      <Points ref={gridRef} positions={gridPositions} stride={3}>
        <PointMaterial transparent color="#3a8a5c" size={0.008} sizeAttenuation depthWrite={false} opacity={0.12} />
      </Points>
      <Points ref={ref} positions={spherePositions} colors={sphereColors} stride={3}>
        <PointMaterial transparent vertexColors size={0.04} sizeAttenuation depthWrite={false} opacity={0.8} />
      </Points>
      {/* Hotspot blob layer disabled. Uncomment with `hotspotPositions` above to restore it.
      <Points positions={hotspotPositions} stride={3}>
        <PointMaterial transparent color="#2ecc71" size={0.04} sizeAttenuation depthWrite={false} opacity={0.7} />
      </Points>
      */}
    </group>
  );
}

function AmbientParticles() {
  const ref = useRef<THREE.Points>(null!);
  const positions = useMemo(() => {
    const count = 600;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (seededRandom(i * 3 + 1) - 0.5) * 15;
      pos[i * 3 + 1] = (seededRandom(i * 3 + 2) - 0.5) * 15;
      pos[i * 3 + 2] = (seededRandom(i * 3 + 3) - 0.5) * 15;
    }
    return pos;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = t * 0.01;
      ref.current.rotation.x = Math.sin(t * 0.02) * 0.1;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial transparent color="#6dbe6d" size={0.01} sizeAttenuation depthWrite={false} opacity={0.2} />
    </Points>
  );
}

export default function GlobeScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.4} color="#2ecc71" />
        <GlobePoints />
        <AmbientParticles />
      </Canvas>
    </div>
  );
}
