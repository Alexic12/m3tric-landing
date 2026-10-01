/** Release-like values used to build out/ for the suite (see the test:e2e script). */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://m3tric-test.co";
export const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://app.m3tric-test.co/login";
export const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contacto@m3tric-test.co";
export const PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+573000000000";

export const SECTION_IDS = [
  "inicio",
  "propuesta",
  "plataforma",
  "escalas",
  "productos",
  "capacidades",
  "tecnologia",
  "casos",
  "contacto",
] as const;

export const NAV_IDS = SECTION_IDS.filter((id) => id !== "inicio");
