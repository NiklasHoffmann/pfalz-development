/**
 * Shared geometry for the invoice PDF. The header/footer band heights slightly
 * over-fill the `page.pdf` margins so the cream background bleeds to the sheet
 * edge (Puppeteer clips the overflow at the page boundary).
 */
export const PDF_PAGE_MARGIN_TOP = '38mm';
export const PDF_PAGE_MARGIN_BOTTOM = '48mm';
export const PDF_HEADER_BAND_HEIGHT = '44mm';
export const PDF_FOOTER_BAND_HEIGHT = '56mm';
export const PDF_HORIZONTAL_INSET = '14mm';
export const INVOICE_BACKGROUND = '#fcfbf7';
