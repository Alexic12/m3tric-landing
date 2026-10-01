import type { Metadata, Viewport } from "next";
import { Barlow } from "next/font/google";
import { BRAND_GREEN_900 } from "@/config/brand";
import { HydrationMarker } from "@/components/layout/HydrationMarker";
import { siteConfig } from "@/config/site";
import "./globals.css";

const barlow = Barlow({
  weight: ["300", "400", "500", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-barlow",
});

const TITLE = "M3TRIC | Lectura multiescala del territorio";
const DESCRIPTION =
  "M3TRIC integra sensores en campo, drones e información satelital para leer el territorio y anticipar el riesgo.";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "M3TRIC",
    "Metric",
    "monitoreo multiescala",
    "gestión del riesgo",
    "monitoreo territorial",
    "sensores en campo",
    "información satelital",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "/",
    siteName: "M3TRIC",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "M3TRIC: entender el territorio para anticipar el riesgo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: BRAND_GREEN_900,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "M3TRIC",
      alternateName: "Metric",
      url: siteConfig.siteUrl,
      logo: `${siteConfig.siteUrl}/icon-512.png`,
    },
    {
      "@type": "WebSite",
      name: "M3TRIC",
      alternateName: "Metric",
      url: siteConfig.siteUrl,
      inLanguage: "es-CO",
    },
  ],
};

/** If React has not hydrated by then (blocked or stale chunks), reveal content instead of leaving it invisible. */
const HYDRATION_DEADLINE_MS = 3000;

const JS_CLASS_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');setTimeout(function(){if(!d.hasAttribute('data-hydrated'))d.classList.remove('js')},${HYDRATION_DEADLINE_MS})})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CO" className={barlow.variable} suppressHydrationWarning>
      <head>
        {/* Enables the CSS-only reveal state before first paint. Without JS, or if hydration never happens
            (HydrationMarker sets data-hydrated), the failsafe drops the class and content stays visible. */}
        <script dangerouslySetInnerHTML={{ __html: JS_CLASS_SCRIPT }} />
      </head>
      <body className="bg-white text-m3-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <HydrationMarker />
        {children}
      </body>
    </html>
  );
}
