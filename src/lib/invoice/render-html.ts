import { INVOICE_FONT_STACK } from '@/lib/invoice/font-stack';
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
  const padding = variant === 'pdf' ? '6mm 14mm 4mm' : '0 0 10px';

  return `<div style="font-family:${INVOICE_FONT_STACK};color:#1c1917;width:100%;box-sizing:border-box;padding:${padding};display:flex;align-items:flex-end;justify-content:space-between;gap:16px;border-bottom:2px solid #92400e;background:#fcfbf7;font-size:10px;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
  <img src="${esc(logoSrc)}" alt="pfalz-development.de" style="height:13mm;width:auto;object-fit:contain;" />
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
}

interface FooterOptions {
  qrSrc: string | null;
  variant: 'pdf' | 'preview';
}

export function renderInvoiceFooterHtml(
  invoice: InvoiceViewModel,
  { qrSrc, variant }: FooterOptions
): string {
  const padding = variant === 'pdf' ? '4mm 14mm 6mm' : '12px 0 0';
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

  const qrBlock = qrSrc
    ? `<div style="text-align:center;flex:0 0 auto;">
        <div style="font-size:7.5px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#047857;margin-bottom:1.5mm;">Scan un Pay</div>
        <img src="${esc(qrSrc)}" alt="EPC-QR-Code für die SEPA-Überweisung" style="width:22mm;height:22mm;border:1px solid #d6d3d1;background:#ffffff;padding:1mm;box-sizing:border-box;" />
        <div style="margin-top:1mm;color:#78716c;">${esc(invoice.totalText)}</div>
      </div>`
    : '';

  return `<div style="font-family:${INVOICE_FONT_STACK};color:#57534e;width:100%;box-sizing:border-box;padding:${padding};border-top:1px solid #e0d5c3;background:#fcfbf7;font-size:9px;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
  <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:14px;">
    <div style="max-width:120mm;">
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
      <div style="margin-top:2mm;color:#78716c;">${esc(
        invoice.sender.company || 'pfalz-development.de'
      )} — Seite ${pageNumber}</div>
    </div>
    ${qrBlock}
  </div>
</div>`;
}
