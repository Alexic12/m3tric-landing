"use client";

import { useEffect } from "react";

/**
 * Tells the inline failsafe in layout.tsx that JavaScript loaded and React hydrated.
 * Without this attribute the failsafe removes the `js` class so scroll-reveal content stays visible.
 */
export function HydrationMarker() {
  useEffect(() => {
    document.documentElement.setAttribute("data-hydrated", "");
  }, []);
  return null;
}
