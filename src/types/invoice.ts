import type { BaseDocument } from '@/types/database';

export const invoiceStatuses = [
  'draft',
  'issued',
  'paid',
  'cancelled',
] as const;

export type InvoiceStatus = (typeof invoiceStatuses)[number];

export interface InvoiceSenderProfile {
  company: string;
  name: string;
  street: string;
  city: string;
  email: string;
  phone: string;
  taxNumber: string;
}

export interface InvoicePaymentProfile {
  payee: string;
  iban: string;
  bic: string;
  bank: string;
}

export interface InvoiceRecipient {
  company: string;
  contact: string;
  street: string;
  city: string;
  email?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceNumberingSettings {
  year: number;
  nextSequence: number;
  startSequence: number;
  padding: number;
}

export interface IInvoiceSettings extends BaseDocument {
  scope: 'default';
  senderProfile: InvoiceSenderProfile;
  paymentProfile: InvoicePaymentProfile;
  defaultNote: string;
  numbering: InvoiceNumberingSettings;
}

export interface IInvoice extends BaseDocument {
  invoiceNumber: string;
  status: InvoiceStatus;
  invoiceDate: Date;
  dueDate?: Date | null;
  servicePeriod?: string;
  project?: string;
  senderProfile: InvoiceSenderProfile;
  recipient: InvoiceRecipient;
  paymentProfile: InvoicePaymentProfile;
  note: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  total: number;
  createdBy?: string;
  updatedBy?: string;
}
