"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { ScaleId } from "@/types";

const TerrainScene = dynamic(() => import("./TerrainScene"), { ssr: false });
// The SVG is decorative, far below the fold and ~50 KB of markup: it is mounted client-side, in its own
// chunk, only once the visual is about to scroll into view, so it costs nothing on the critical path.
const TerrainFallback = dynamic(() => import("./TerrainFallback"), { ssr: false });

const VIEWPORT_MARGIN = "200px";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(notify: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", notify);
  return () => mq.removeEventListener("change", notify);
}
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
// Server and first paint assume reduced: the static SVG is always the safe default.
const getServerReducedMotion = () => true;

/** three.js r163+ requires WebGL2, so a WebGL1-only device must keep the SVG fallback. */
function hasWebGL2(): boolean {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return false;
    // Release the probe context now: browsers cap live contexts per page, and the real one is created by r3f.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function ScaleVisual({ activeScale, className = "" }: { activeScale: ScaleId; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [near, setNear] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let probed = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && !probed) {
          probed = true;
          setNear(true);
          setWebgl(hasWebGL2());
        }
      },
      { rootMargin: VIEWPORT_MARGIN },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fail = useCallback(() => setFailed(true), []);
  const markReady = useCallback(() => setReady(true), []);

  const use3d = webgl && !reduced && !failed;
  // The scene unmounts when 3D is switched off; a stale `ready` would show a blank canvas on the next mount.
  if (!use3d && ready) setReady(false);
  const showing3d = use3d && ready;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-visual={showing3d ? "3d" : "fallback"}
      className={`relative aspect-[4/3] w-full overflow-hidden ${className}`}
    >
      <div
        className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${
          showing3d ? "opacity-0" : "opacity-100"
        }`}
      >
        {near ? <TerrainFallback activeScale={activeScale} /> : null}
      </div>
      {use3d && (
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        >
          <SceneBoundary onError={fail}>
            <TerrainScene activeScale={activeScale} paused={!inView} onReady={markReady} onFail={fail} />
          </SceneBoundary>
        </div>
      )}
    </div>
  );
}
