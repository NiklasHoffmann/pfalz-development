import { INVOICE_FONT_STACK } from '@/lib/invoice/font-stack';
import {
  INVOICE_BACKGROUND,
  PDF_HORIZONTAL_INSET,
  PDF_MARGIN_BOTTOM,
  PDF_MARGIN_TOP,
} from '@/lib/invoice/pdf-layout';
import type { InvoiceViewModel } from '@/lib/invoice/view-model';

/**
 * The invoice is built as HTML strings (not React) so it renders in a Next
 * route handler and is reused verbatim in the editor preview via
 * `dangerouslySetInnerHTML`. The running header/footer are CSS `@page` margin
 * boxes for the PDF; the preview fakes them with plain bars.
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

function runningHeaderTitle(invoice: InvoiceViewModel): string {
  return [invoice.statusLabel, `RECHNUNG · Nr. ${invoice.invoiceNumber}`]
    .filter(Boolean)
    .join(' · ');
}

interface BodyOptions {
  qrSrc: string | null;
  qrBadgeSrc?: string | null;
}

export function renderInvoiceBodyHtml(
  invoice: InvoiceViewModel,
  { qrSrc, qrBadgeSrc }: BodyOptions
): string {
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

  const bankLine = [
    invoice.payment.ibanText ? `IBAN ${invoice.payment.ibanText}` : '',
    invoice.payment.bic ? `BIC ${invoice.payment.bic}` : '',
    invoice.payment.bank ? invoice.payment.bank : '',
  ]
    .filter(Boolean)
    .join(' · ');

  const qrBadge = qrBadgeSrc
    ? `<span class="inv-qr__badge"><img src="${esc(
        qrBadgeSrc
      )}" alt="" /></span>`
    : '';

  const paymentBlock = `<section class="inv-pay">
    <div class="inv-pay__text">
      <p class="inv-card__label">Zahlung</p>
      <p><strong>Zahlungsziel:</strong> bis ${esc(invoice.dueDateText)} unter Angabe der Rechnungsnummer ${esc(
        invoice.invoiceNumber
      )}${invoice.payment.payee ? ` an ${esc(invoice.payment.payee)}` : ''}.</p>
      ${
        bankLine
          ? `<p><strong>Bankverbindung:</strong> ${esc(bankLine)}</p>`
          : ''
      }
    </div>
    ${
      qrSrc
        ? `<div class="inv-qr">
             <p class="inv-qr__label">Scan un Pay</p>
             <div class="inv-qr__frame">
               <img src="${esc(qrSrc)}" alt="EPC-QR-Code für die SEPA-Überweisung" />
               ${qrBadge}
             </div>
             <p class="inv-qr__amount">${esc(invoice.totalText)}</p>
           </div>`
        : ''
    }
  </section>`;

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

  ${paymentBlock}
</div>`;
}

/**
 * The `@page` block: full-bleed cream margins, a logo + title in the top band
 * and a "pfalz-development.de · Seite X von Y · IBAN" line in the bottom band,
 * repeated on every sheet. `logoDataUri` must be an SVG-wrapped image so it
 * renders at a fixed size (raster `content: url()` can't be scaled).
 */
export function renderInvoicePageCss(
  invoice: InvoiceViewModel,
  { logoDataUri }: { logoDataUri: string }
): string {
  const footerRight = invoice.payment.ibanText
    ? `IBAN ${invoice.payment.ibanText}`
    : `Rechnung ${invoice.invoiceNumber}`;
  const footerLeft = invoice.sender.company || 'pfalz-development.de';

  return `@page {
  size: A4;
  margin: ${PDF_MARGIN_TOP} 0 ${PDF_MARGIN_BOTTOM} 0;

  @top-left-corner { background: ${INVOICE_BACKGROUND}; }
  @top-right-corner { background: ${INVOICE_BACKGROUND}; }
  @top-left {
    background: ${INVOICE_BACKGROUND};
    content: url("${logoDataUri}");
    vertical-align: bottom;
    padding: 0 0 3.5mm ${PDF_HORIZONTAL_INSET};
    border-bottom: 2px solid #92400e;
  }
  @top-center { background: ${INVOICE_BACKGROUND}; border-bottom: 2px solid #92400e; }
  @top-right {
    background: ${INVOICE_BACKGROUND};
    content: ${JSON.stringify(runningHeaderTitle(invoice))};
    color: #78350f;
    font: 700 11pt ${INVOICE_FONT_STACK};
    vertical-align: bottom;
    padding: 0 ${PDF_HORIZONTAL_INSET} 4mm 0;
    border-bottom: 2px solid #92400e;
  }

  @bottom-left-corner { background: ${INVOICE_BACKGROUND}; }
  @bottom-right-corner { background: ${INVOICE_BACKGROUND}; }
  @bottom-left {
    background: ${INVOICE_BACKGROUND};
    content: ${JSON.stringify(footerLeft)};
    color: #78716c;
    font: 9pt ${INVOICE_FONT_STACK};
    vertical-align: middle;
    padding-left: ${PDF_HORIZONTAL_INSET};
    border-top: 1px solid #e0d5c3;
  }
  @bottom-center {
    background: ${INVOICE_BACKGROUND};
    content: "Seite " counter(page) " von " counter(pages);
    color: #78716c;
    font: 9pt ${INVOICE_FONT_STACK};
    vertical-align: middle;
    border-top: 1px solid #e0d5c3;
  }
  @bottom-right {
    background: ${INVOICE_BACKGROUND};
    content: ${JSON.stringify(footerRight)};
    color: #78716c;
    font: 9pt ${INVOICE_FONT_STACK};
    vertical-align: middle;
    padding-right: ${PDF_HORIZONTAL_INSET};
    border-top: 1px solid #e0d5c3;
  }
}`;
}

/* ---- On-screen preview only: fake header/footer bars ---- */

export function renderInvoicePreviewHeaderHtml(
  invoice: InvoiceViewModel,
  { logoSrc }: { logoSrc: string }
): string {
  return `<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:16px;border-bottom:2px solid #92400e;padding-bottom:3mm;margin-bottom:6mm;font-family:${INVOICE_FONT_STACK};">
    <img src="${esc(logoSrc)}" alt="pfalz-development.de" style="height:16mm;width:auto;object-fit:contain;" />
    <div style="font-size:11pt;font-weight:700;color:#78350f;">${esc(
      runningHeaderTitle(invoice)
    )}</div>
  </div>`;
}

export function renderInvoicePreviewFooterHtml(
  invoice: InvoiceViewModel
): string {
  const right = invoice.payment.ibanText
    ? `IBAN ${invoice.payment.ibanText}`
    : `Rechnung ${invoice.invoiceNumber}`;

  return `<div style="display:flex;justify-content:space-between;gap:12px;border-top:1px solid #e0d5c3;padding-top:3mm;margin-top:6mm;font-family:${INVOICE_FONT_STACK};font-size:9pt;color:#78716c;">
    <span>${esc(invoice.sender.company || 'pfalz-development.de')}</span>
    <span>Seite 1 von 1</span>
    <span>${esc(right)}</span>
  </div>`;
}
