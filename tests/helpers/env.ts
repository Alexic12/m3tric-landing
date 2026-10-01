/** Release-like values used to build out/ for the suite (see the test:e2e script). */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://m3tric-test.co";
export const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL ?? "https://app.m3tric-test.co/login";
export const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contacto@m3tric-test.co";
/** The e2e build is production-like (indexable, with contact); see the build:e2e script. */
export const RELEASE_PROFILE = process.env.RELEASE_PROFILE ?? "production";
export const PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+573000000000";

export const SECTION_IDS = [
  "inicio",
  "beneficios",
  "casos",
  "como-funciona",
  "escalas",
  "por-que",
  "preguntas",
  "tecnico",
  "contacto",
] as const;

/** Sections reachable from the header navigation (#por-que is read in flow, it has no nav entry). */
export const NAV_IDS = ["beneficios", "casos", "como-funciona", "escalas", "preguntas", "tecnico", "contacto"] as const;

/** Reading form of the e2e phone (Colombian plan), written out independently of the app helper. */
export const PHONE_DISPLAY = "+57 300 000 0000";
