import { formatIban } from '@/lib/iban';
import { formatPhoneDisplay } from '@/lib/format';
import { calculateInvoiceTotals } from '@/lib/invoice/totals';
import { formatInvoiceAmount, formatInvoiceDate } from '@/lib/invoice/format';
import type { InvoiceStatus } from '@/types/invoice';

/**
 * Loose shape accepted from the editor payload and the persisted invoice.
 * Not tied to the zod schema so the client can build it without importing
 * server-only modules.
 */
export interface InvoicePdfPayload {
  invoiceNumber?: string;
  status: InvoiceStatus;
  invoiceDate: string;
  dueDate?: string | null;
  servicePeriod?: string;
  project?: string;
  senderProfile: {
    company: string;
    name: string;
    street: string;
    city: string;
    email: string;
    phone: string;
    taxNumber: string;
  };
  recipient: {
    company: string;
    contact: string;
    street: string;
    city: string;
    email?: string;
  };
  paymentProfile: {
    payee: string;
    iban: string;
    bic: string;
    bank: string;
  };
  note?: string;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface InvoiceLineView {
  id: string;
  position: number;
  description: string;
  quantityText: string;
  unitPriceText: string;
  totalText: string;
}

export interface InvoiceViewModel {
  invoiceNumber: string;
  status: InvoiceStatus;
  /** Shown under the "RECHNUNG" label for drafts / cancelled invoices. */
  statusLabel: string | null;
  invoiceDateText: string;
  dueDateText: string;
  servicePeriod: string;
  project: string;
  sender: {
    company: string;
    name: string;
    street: string;
    city: string;
    email: string;
    phoneText: string;
    taxNumber: string;
  };
  recipient: {
    company: string;
    contact: string;
    street: string;
    city: string;
  };
  payment: {
    payee: string;
    iban: string;
    ibanText: string;
    bic: string;
    bank: string;
  };
  note: string;
  lineItems: InvoiceLineView[];
  subtotalText: string;
  totalText: string;
  /** Raw total, used for the payment QR amount. */
  totalAmount: number;
}

const DEFAULT_INVOICE_NUMBER = 'ENTWURF';

function statusLabel(status: InvoiceStatus): string | null {
  if (status === 'draft') {
    return 'Entwurf';
  }

  if (status === 'cancelled') {
    return 'Storniert';
  }

  return null;
}

export function toInvoiceViewModel(
  payload: InvoicePdfPayload
): InvoiceViewModel {
  const totals = calculateInvoiceTotals(payload.lineItems);

  return {
    invoiceNumber: payload.invoiceNumber?.trim() || DEFAULT_INVOICE_NUMBER,
    status: payload.status,
    statusLabel: statusLabel(payload.status),
    invoiceDateText: formatInvoiceDate(payload.invoiceDate),
    dueDateText: formatInvoiceDate(payload.dueDate),
    servicePeriod: payload.servicePeriod?.trim() ?? '',
    project: payload.project?.trim() ?? '',
    sender: {
      company: payload.senderProfile.company.trim(),
      name: payload.senderProfile.name.trim(),
      street: payload.senderProfile.street.trim(),
      city: payload.senderProfile.city.trim(),
      email: payload.senderProfile.email.trim(),
      phoneText: formatPhoneDisplay(payload.senderProfile.phone),
      taxNumber: payload.senderProfile.taxNumber.trim(),
    },
    recipient: {
      company: payload.recipient.company.trim(),
      contact: payload.recipient.contact.trim(),
      street: payload.recipient.street.trim(),
      city: payload.recipient.city.trim(),
    },
    payment: {
      payee: payload.paymentProfile.payee.trim(),
      iban: payload.paymentProfile.iban,
      ibanText: formatIban(payload.paymentProfile.iban),
      bic: payload.paymentProfile.bic.trim().toUpperCase(),
      bank: payload.paymentProfile.bank.trim(),
    },
    note: (payload.note ?? '').trim(),
    lineItems: totals.lineItems.map((lineItem, index) => ({
      id: lineItem.id,
      position: index + 1,
      description: lineItem.description,
      quantityText: formatInvoiceAmount(lineItem.quantity),
      unitPriceText: `${formatInvoiceAmount(lineItem.unitPrice)} EUR`,
      totalText: `${formatInvoiceAmount(lineItem.total)} EUR`,
    })),
    subtotalText: `${formatInvoiceAmount(totals.subtotal)} EUR`,
    totalText: `${formatInvoiceAmount(totals.total)} EUR`,
    totalAmount: totals.total,
  };
}
