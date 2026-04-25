import mongoose, { Schema } from 'mongoose';
import type { IInvoice } from '@/types/invoice';
import { invoiceStatuses } from '@/types/invoice';

type InvoiceJson = Omit<IInvoice, '_id'> & {
  _id?: unknown;
  __v?: number;
  id?: unknown;
};

const senderProfileSchema = new Schema(
  {
    company: { type: String, default: '' },
    name: { type: String, default: '' },
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    taxNumber: { type: String, default: '' },
  },
  { _id: false }
);

const paymentProfileSchema = new Schema(
  {
    payee: { type: String, default: '' },
    iban: { type: String, default: '' },
    bic: { type: String, default: '' },
    bank: { type: String, default: '' },
  },
  { _id: false }
);

const recipientSchema = new Schema(
  {
    company: { type: String, default: '' },
    contact: { type: String, default: '' },
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    email: { type: String, default: '' },
  },
  { _id: false }
);

const lineItemSchema = new Schema(
  {
    id: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: invoiceStatuses,
      default: 'draft',
    },
    invoiceDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    servicePeriod: {
      type: String,
      default: '',
    },
    project: {
      type: String,
      default: '',
    },
    senderProfile: {
      type: senderProfileSchema,
      required: true,
    },
    recipient: {
      type: recipientSchema,
      required: true,
    },
    paymentProfile: {
      type: paymentProfileSchema,
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
    lineItems: {
      type: [lineItemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    createdBy: {
      type: String,
      default: null,
    },
    updatedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: InvoiceJson) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

InvoiceSchema.index({ invoiceDate: -1 });
InvoiceSchema.index({ status: 1, updatedAt: -1 });

export const Invoice =
  (mongoose.models.Invoice as mongoose.Model<IInvoice>) ||
  mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
