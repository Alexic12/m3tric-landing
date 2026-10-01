import type { MetadataRoute } from "next";
import { BRAND_GREEN_900, BRAND_WHITE } from "@/config/brand";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "M3TRIC",
    short_name: "M3TRIC",
    description: "Lectura multiescala del territorio",
    lang: "es-CO",
    start_url: "/",
    display: "browser",
    theme_color: BRAND_GREEN_900,
    background_color: BRAND_WHITE,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
