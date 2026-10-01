const COLOMBIA_MOBILE = /^\+57(\d{3})(\d{3})(\d{4})$/;

/**
 * Reading form of an E.164 number ("+573001234567" -> "+57 300 123 4567"). Only the Colombian plan is
 * known here; any other number is shown as configured rather than guessed. The `tel:` href stays E.164.
 */
export function formatPhone(e164: string): string {
  const match = COLOMBIA_MOBILE.exec(e164);
  return match ? `+57 ${match[1]} ${match[2]} ${match[3]}` : e164;
}
