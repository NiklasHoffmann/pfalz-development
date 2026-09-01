import { INVOICE_FONT_STACK } from '@/lib/invoice/font-stack';

/**
 * Plain CSS for the invoice body. Used as a string for the Puppeteer-rendered
 * PDF and injected into a <style> tag for the on-screen editor preview, so the
 * document looks the same in both places. Class names are prefixed `inv-` and
 * only used by the invoice components. The PDF renderer prepends the embedded
 * `@font-face`; the preview relies on the browser's own fonts.
 */
export const INVOICE_DOCUMENT_CSS = `
.inv-root {
  font-family: ${INVOICE_FONT_STACK};
  color: #1c1917;
  font-size: 12.5px;
  line-height: 1.5;
  background: #fcfbf7;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.inv-root * {
  box-sizing: border-box;
}

.inv-parties {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 4px;
}

.inv-card {
  border: 1px solid #cfb290;
  background: #fffdf8;
  border-radius: 8px;
  padding: 10px 12px;
  break-inside: avoid;
}

.inv-card + .inv-card--stacked {
  margin-top: 12px;
}

.inv-card__label {
  margin: 0 0 6px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #7c5a2c;
}

.inv-address {
  margin: 0;
  white-space: pre-line;
}

.inv-contact {
  margin: 8px 0 0;
  color: #4f3b20;
}

.inv-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px 16px;
  margin: 0;
}

.inv-meta__full {
  grid-column: 1 / -1;
}

.inv-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.inv-table thead {
  display: table-header-group;
}

.inv-table th {
  border: 1px solid #cfb290;
  background: #efdfc7;
  color: #78350f;
  font-weight: 600;
  padding: 7px 8px;
  text-align: left;
}

.inv-table td {
  border: 1px solid #d7c2a8;
  padding: 7px 8px;
  vertical-align: top;
}

.inv-table tr {
  break-inside: avoid;
}

.inv-num {
  text-align: right;
  white-space: nowrap;
}

.inv-summary {
  margin: 16px 0 0 auto;
  width: 62%;
  max-width: 340px;
  border: 1px solid #cfb290;
  border-radius: 8px;
  overflow: hidden;
  break-inside: avoid;
}

.inv-summary__row {
  display: grid;
  grid-template-columns: 1fr auto;
}

.inv-summary__row > span {
  padding: 7px 12px;
}

.inv-summary__row > span:first-child {
  background: #efdfc7;
  color: #6f4d1f;
  font-weight: 500;
}

.inv-summary__row > span:last-child {
  text-align: right;
  border-left: 1px solid #cfb290;
}

.inv-summary__row + .inv-summary__row > span {
  border-top: 1px solid #cfb290;
}

.inv-summary__row--total > span {
  background: #e9d6ba;
  color: #78350f;
  font-weight: 700;
  font-size: 13.5px;
}

.inv-note {
  margin: 16px 0 0;
  border: 1px solid #d3b07d;
  background: #fbf3e5;
  color: #4f3b20;
  border-radius: 8px;
  padding: 9px 12px;
  break-inside: avoid;
}
`;
