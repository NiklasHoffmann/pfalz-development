/**
 * Invoice PDF geometry. The running header/footer are CSS `@page` margin boxes
 * (not Puppeteer templates): they fill their band with the cream background for
 * a full-bleed sheet, reserve their space reliably, and carry `counter(page)`
 * for "Seite X von Y". `page.pdf()` is called without a `margin` option so these
 * `@page` margins apply.
 */
export const INVOICE_BACKGROUND = '#fcfbf7';

/** Page margins = the running header/footer bands. Sides are 0; the body insets
 *  itself so the cream reaches the sheet edge left and right. The top band is
 *  sized to the logo (~19.2mm) plus a small margin above and below it. */
export const PDF_MARGIN_TOP = '27mm';
export const PDF_MARGIN_BOTTOM = '19mm';
export const PDF_HORIZONTAL_INSET = '13mm';

/** Height of the content area between the header/footer bands (A4 297mm minus
 *  the two margins). Used to paginate the line items for the carry-over. */
export const PDF_CONTENT_HEIGHT_MM = 251;

/** Rendered size of the header logo in the top margin box (scaled via
 *  `background-size` from a high-res raster, so it stays crisp). Aspect ratio
 *  of `invoice-logo.webp` is 440:248. */
export const PDF_LOGO_WIDTH_MM = '34mm';
export const PDF_LOGO_BOTTOM_GAP_MM = '3.5mm';
