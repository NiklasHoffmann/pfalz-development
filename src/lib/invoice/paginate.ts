import { formatInvoiceAmount } from '@/lib/invoice/format';
import { PDF_CONTENT_HEIGHT_MM } from '@/lib/invoice/pdf-layout';
import type {
  InvoiceLineView,
  InvoiceViewModel,
} from '@/lib/invoice/view-model';

export interface InvoiceItemsPage {
  rows: InvoiceLineView[];
  /** Formatted carry-over brought from the previous page (null on page 1). */
  carryInText: string | null;
  /** Formatted carry-over to the next page (null on the last page). */
  carryOutText: string | null;
}

/*
 * The browser can't tell us where page breaks land, so the line items are split
 * into pages here from conservative height estimates. Under-filling is the safe
 * failure mode: a slightly short page just means the carry-over lands one row
 * earlier, still correct. Over-filling would let the table break on its own
 * without a carry-over line, so every estimate rounds up.
 */

// Deliberately generous: under-filling a page just moves the carry-over one row
// earlier (still correct), while over-filling would break a table with no
// carry-over line at all.
const SAFETY_MM = 9;
const TABLE_HEAD_MM = 10;
const CARRY_ROW_MM = 9;
const CHARS_PER_LINE = 52;
const ROW_LINE_MM = 5.2;
const ROW_MIN_MM = 10.5;
const TEXT_LINE_MM = 4.8;

function rowHeightMm(description: string): number {
  const lines = Math.max(
    1,
    Math.ceil(description.trim().length / CHARS_PER_LINE)
  );
  return Math.max(ROW_MIN_MM, lines * ROW_LINE_MM + 5.3);
}

function partiesHeightMm(invoice: InvoiceViewModel): number {
  const hasContact =
    invoice.sender.phoneText !== '-' ||
    Boolean(invoice.sender.email) ||
    Boolean(invoice.sender.taxNumber);
  const senderLines =
    [invoice.sender.name, invoice.sender.street, invoice.sender.city].filter(
      Boolean
    ).length + (hasContact ? 3 : 0);
  const recipientLines = [
    invoice.recipient.company,
    invoice.recipient.contact,
    invoice.recipient.street,
    invoice.recipient.city,
  ].filter(Boolean).length;

  return 9 + Math.max(senderLines, recipientLines) * TEXT_LINE_MM + 7;
}

function metaHeightMm(invoice: InvoiceViewModel): number {
  const rows = 2 + (invoice.project ? 1 : 0);
  return 8 + rows * TEXT_LINE_MM + 6;
}

export function paginateInvoiceItems(
  invoice: InvoiceViewModel
): InvoiceItemsPage[] {
  const items = invoice.lineItems;
  const firstPageBudget =
    PDF_CONTENT_HEIGHT_MM -
    SAFETY_MM -
    partiesHeightMm(invoice) -
    metaHeightMm(invoice) -
    TABLE_HEAD_MM;
  const continuedPageBudget =
    PDF_CONTENT_HEIGHT_MM - SAFETY_MM - TABLE_HEAD_MM - CARRY_ROW_MM;

  const pages: InvoiceItemsPage[] = [];
  let index = 0;
  let runningTotal = 0;

  while (index < items.length) {
    const isFirstPage = pages.length === 0;
    const budget = isFirstPage ? firstPageBudget : continuedPageBudget;
    const carryInText = isFirstPage
      ? null
      : `${formatInvoiceAmount(runningTotal)} EUR`;

    const rows: InvoiceLineView[] = [];
    let used = 0;

    while (index < items.length) {
      const row = items[index];
      const height = rowHeightMm(row.description);

      // Reserve room for the carry-over row that closes a filled page. The
      // summary/note/payment blocks aren't reserved: they carry no running
      // total, so they can simply flow onto the next page if they don't fit.
      if (rows.length > 0 && used + height + CARRY_ROW_MM > budget) {
        break;
      }

      rows.push(row);
      used += height;
      runningTotal += row.total;
      index += 1;
    }

    pages.push({
      rows,
      carryInText,
      carryOutText:
        index >= items.length
          ? null
          : `${formatInvoiceAmount(runningTotal)} EUR`,
    });
  }

  return pages.length > 0
    ? pages
    : [{ rows: [], carryInText: null, carryOutText: null }];
}
