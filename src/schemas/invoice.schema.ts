import { z } from 'zod';
import { formatIban } from '@/lib/iban';
import { normalizeInvoiceNoteText } from '@/lib/invoice-admin';
import { invoiceStatuses } from '@/types/invoice';

const trimmedString = z.string().trim();
const ibanString = trimmedString.transform((value) => formatIban(value));
const invoiceNoteString = trimmedString.transform((value) =>
  normalizeInvoiceNoteText(value)
);

export const invoiceProfileSchema = z.object({
  senderProfile: z.object({
    company: trimmedString.default(''),
    name: trimmedString.default(''),
    street: trimmedString.default(''),
    city: trimmedString.default(''),
    email: trimmedString.default(''),
    phone: trimmedString.default(''),
    taxNumber: trimmedString.default(''),
  }),
  paymentProfile: z.object({
    payee: trimmedString.default(''),
    iban: ibanString.default(''),
    bic: trimmedString.default(''),
    bank: trimmedString.default(''),
  }),
  defaultNote: invoiceNoteString.default(''),
});

export const invoiceLineItemInputSchema = z.object({
  id: trimmedString.min(1),
  description: trimmedString.min(1),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
});

export const invoiceUpsertSchema = z.object({
  invoiceNumber: trimmedString.min(1).optional(),
  status: z.enum(invoiceStatuses).default('draft'),
  invoiceDate: z.string().min(1),
  dueDate: z.string().optional().nullable(),
  servicePeriod: trimmedString.default(''),
  project: trimmedString.default(''),
  senderProfile: invoiceProfileSchema.shape.senderProfile,
  recipient: z.object({
    company: trimmedString.default(''),
    contact: trimmedString.default(''),
    street: trimmedString.default(''),
    city: trimmedString.default(''),
    email: trimmedString.optional(),
  }),
  paymentProfile: invoiceProfileSchema.shape.paymentProfile,
  note: invoiceNoteString.default(''),
  lineItems: z.array(invoiceLineItemInputSchema).min(1),
});
