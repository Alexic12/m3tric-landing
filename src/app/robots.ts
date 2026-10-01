import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

// Staging/dev: block everything and advertise no sitemap (ADR-004). The X-Robots-Tag header at the edge
// and the robots meta in layout.tsx say the same thing; scripts/check-artifact.mjs asserts all three agree.
export default function robots(): MetadataRoute.Robots {
  if (!siteConfig.isIndexable) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}
