/**
 * Font stack for the invoice document. Kept in its own module (no embedded font
 * data) so client bundles that only need the family name don't pull in the
 * base64 woff2 from `fonts.ts`.
 */
export const INVOICE_FONT_STACK =
  "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
