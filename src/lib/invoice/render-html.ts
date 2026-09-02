import { INVOICE_FONT_STACK } from '@/lib/invoice/font-stack';
import {
  INVOICE_BACKGROUND,
  PDF_FOOTER_BAND_HEIGHT,
  PDF_HEADER_BAND_HEIGHT,
  PDF_HORIZONTAL_INSET,
} from '@/lib/invoice/pdf-layout';
import type { InvoiceViewModel } from '@/lib/invoice/view-model';

/**
 * The invoice document, header and footer are built as HTML strings rather than
 * React so they can render in a Next route handler (where `react-dom/server`
 * resolves to the RSC build) and be reused verbatim in the editor preview via
 * `dangerouslySetInnerHTML` and as Puppeteer header/footer templates.
 */

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

function multiline(lines: Array<string | false | undefined>): string {
  return lines
    .filter((line): line is string => Boolean(line))
    .map(esc)
    .join('<br />');
}

export function renderInvoiceBodyHtml(invoice: InvoiceViewModel): string {
  const senderContact = [
    invoice.sender.phoneText !== '-'
      ? `Telefon: ${invoice.sender.phoneText}`
      : '',
    invoice.sender.email ? `E-Mail: ${invoice.sender.email}` : '',
    invoice.sender.taxNumber ? `Steuernummer: ${invoice.sender.taxNumber}` : '',
  ].filter(Boolean);

  const lineRows = invoice.lineItems
    .map(
      (lineItem) => `<tr>
        <td class="inv-num">${lineItem.position}</td>
        <td>${esc(lineItem.description)}</td>
        <td class="inv-num">${esc(lineItem.quantityText)}</td>
        <td class="inv-num">${esc(lineItem.unitPriceText)}</td>
        <td class="inv-num">${esc(lineItem.totalText)}</td>
      </tr>`
    )
    .join('');

  return `<div class="inv-root">
  <div class="inv-parties">
    <section class="inv-card">
      <p class="inv-card__label">Absender</p>
      <p class="inv-address">${multiline([
        invoice.sender.name,
        invoice.sender.street,
        invoice.sender.city,
      ])}</p>
      ${
        senderContact.length > 0
          ? `<p class="inv-contact">${multiline(senderContact)}</p>`
          : ''
      }
    </section>
    <section class="inv-card">
      <p class="inv-card__label">Empfänger</p>
      <p class="inv-address">${multiline([
        invoice.recipient.company,
        invoice.recipient.contact,
        invoice.recipient.street,
        invoice.recipient.city,
      ])}</p>
    </section>
  </div>

  <section class="inv-card inv-card--stacked">
    <p class="inv-card__label">Rechnungsdaten</p>
    <div class="inv-meta">
      <span>Rechnungsnummer: ${esc(invoice.invoiceNumber)}</span>
      <span>Rechnungsdatum: ${esc(invoice.invoiceDateText)}</span>
      ${
        invoice.servicePeriod
          ? `<span>Leistungszeitraum: ${esc(invoice.servicePeriod)}</span>`
          : ''
      }
      <span>Fällig bis: ${esc(invoice.dueDateText)}</span>
      ${
        invoice.project
          ? `<span class="inv-meta__full">Projekt: ${esc(invoice.project)}</span>`
          : ''
      }
    </div>
  </section>

  <table class="inv-table">
    <thead>
      <tr>
        <th class="inv-num">Pos.</th>
        <th>Leistung</th>
        <th class="inv-num">Menge</th>
        <th class="inv-num">Einzelpreis</th>
        <th class="inv-num">Gesamt</th>
      </tr>
    </thead>
    <tbody>${lineRows}</tbody>
  </table>

  <div class="inv-summary">
    <div class="inv-summary__row">
      <span>Zwischensumme</span><span>${esc(invoice.subtotalText)}</span>
    </div>
    <div class="inv-summary__row">
      <span>Umsatzsteuer</span><span>0,00 EUR</span>
    </div>
    <div class="inv-summary__row inv-summary__row--total">
      <span>Rechnungsbetrag</span><span>${esc(invoice.totalText)}</span>
    </div>
  </div>

  ${invoice.note ? `<p class="inv-note">${esc(invoice.note)}</p>` : ''}
</div>`;
}

interface HeaderOptions {
  logoSrc: string;
  variant: 'pdf' | 'preview';
}

export function renderInvoiceHeaderHtml(
  invoice: InvoiceViewModel,
  { logoSrc, variant }: HeaderOptions
): string {
  const row = `<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:16px;border-bottom:2px solid #92400e;padding-bottom:3mm;font-size:10px;color:#1c1917;">
    <img src="${esc(
      logoSrc
    )}" alt="pfalz-development.de" style="height:13mm;width:auto;object-fit:contain;" />
    <div style="text-align:right;line-height:1.35;">
      <div style="font-size:15px;font-weight:700;letter-spacing:0.08em;color:#78350f;">RECHNUNG</div>
      <div style="color:#57534e;">Nr. ${esc(invoice.invoiceNumber)}</div>
      ${
        invoice.statusLabel
          ? `<div style="color:#b91c1c;">${esc(invoice.statusLabel)}</div>`
          : ''
      }
    </div>
  </div>`;

  const wrapper =
    variant === 'pdf'
      ? `font-family:${INVOICE_FONT_STACK};box-sizing:border-box;width:100%;height:${PDF_HEADER_BAND_HEIGHT};background:${INVOICE_BACKGROUND};display:flex;flex-direction:column;justify-content:flex-end;padding:0 ${PDF_HORIZONTAL_INSET} 4mm;-webkit-print-color-adjust:exact;print-color-adjust:exact;`
      : `font-family:${INVOICE_FONT_STACK};padding:0 0 10px;`;

  return `<div style="${wrapper}">${row}</div>`;
}

interface FooterOptions {
  qrSrc: string | null;
  /** Small logo shown in the centre of the QR code. */
  qrBadgeSrc?: string | null;
  variant: 'pdf' | 'preview';
}

export function renderInvoiceFooterHtml(
  invoice: InvoiceViewModel,
  { qrSrc, qrBadgeSrc, variant }: FooterOptions
): string {
  const pageNumber =
    variant === 'pdf'
      ? '<span class="pageNumber"></span> von <span class="totalPages"></span>'
      : '1 von 1';

  const bankLine = [
    invoice.payment.ibanText ? `IBAN ${invoice.payment.ibanText}` : '',
    invoice.payment.bic ? `BIC ${invoice.payment.bic}` : '',
    invoice.payment.bank ? invoice.payment.bank : '',
  ]
    .filter(Boolean)
    .join(' · ');

  const qrBadge = qrBadgeSrc
    ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#ffffff;border:1px solid #a7f3d0;border-radius:2.5px;padding:0.9mm;line-height:0;box-shadow:0 0 0 1px rgba(255,255,255,0.9);">
        <img src="${esc(
          qrBadgeSrc
        )}" alt="" style="width:4.4mm;height:4.4mm;object-fit:contain;display:block;" />
      </div>`
    : '';

  const qrBlock = qrSrc
    ? `<div style="text-align:center;flex:0 0 auto;">
        <div style="font-size:8px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#047857;margin-bottom:1.5mm;">Scan un Pay</div>
        <div style="position:relative;width:24mm;height:24mm;border:1px solid #d6d3d1;background:#ffffff;padding:1mm;box-sizing:border-box;margin:0 auto;">
          <img src="${esc(
            qrSrc
          )}" alt="EPC-QR-Code für die SEPA-Überweisung" style="width:100%;height:100%;display:block;" />
          ${qrBadge}
        </div>
        <div style="margin-top:1mm;font-size:10px;color:#78716c;">${esc(
          invoice.totalText
        )}</div>
      </div>`
    : '';

  const row = `<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;">
    <div style="max-width:118mm;">
      <div><strong style="color:#1c1917;">Zahlungsziel:</strong> bis ${esc(
        invoice.dueDateText
      )} unter Angabe der Rechnungsnummer ${esc(invoice.invoiceNumber)}${
        invoice.payment.payee ? ` an ${esc(invoice.payment.payee)}` : ''
      }.</div>
      ${
        bankLine
          ? `<div><strong style="color:#1c1917;">Bankverbindung:</strong> ${esc(
              bankLine
            )}</div>`
          : ''
      }
      <div style="margin-top:2mm;font-size:10px;color:#78716c;">${esc(
        invoice.sender.company || 'pfalz-development.de'
      )} — Seite ${pageNumber}</div>
    </div>
    ${qrBlock}
  </div>`;

  const base = `font-family:${INVOICE_FONT_STACK};font-size:11px;line-height:1.55;color:#44403c;border-top:1px solid #d9cfbf;`;
  const wrapper =
    variant === 'pdf'
      ? `${base}box-sizing:border-box;width:100%;height:${PDF_FOOTER_BAND_HEIGHT};background:${INVOICE_BACKGROUND};padding:4mm ${PDF_HORIZONTAL_INSET} 0;-webkit-print-color-adjust:exact;print-color-adjust:exact;`
      : `${base}padding:12px 0 0;`;

  return `<div style="${wrapper}">${row}</div>`;
}
