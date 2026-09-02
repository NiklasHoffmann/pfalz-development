/**
 * Invoice PDF geometry. The running header/footer are CSS `@page` margin boxes
 * (not Puppeteer templates): they fill their band with the cream background for
 * a full-bleed sheet, reserve their space reliably, and carry `counter(page)`
 * for "Seite X von Y". `page.pdf()` is called without a `margin` option so these
 * `@page` margins apply.
 */
export const INVOICE_BACKGROUND = '#fcfbf7';

/** Page margins = the running header/footer bands. Sides are 0; the body insets
 *  itself so the cream reaches the sheet edge left and right. */
export const PDF_MARGIN_TOP = '32mm';
export const PDF_MARGIN_BOTTOM = '24mm';
export const PDF_HORIZONTAL_INSET = '13mm';

/** Rendered width of the header logo (an SVG wrapper keeps it crisp at this
 *  physical size). */
export const PDF_LOGO_WIDTH_MM = 34;
export const PDF_LOGO_HEIGHT_MM = 19.1;
