import mongoose, { Schema } from 'mongoose';
import type { IInvoiceSettings } from '@/types/invoice';

type InvoiceSettingsJson = Omit<IInvoiceSettings, '_id'> & {
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

const numberingSchema = new Schema(
  {
    year: { type: Number, required: true, default: new Date().getFullYear() },
    nextSequence: { type: Number, required: true, default: 111 },
    startSequence: { type: Number, required: true, default: 111 },
    padding: { type: Number, required: true, default: 3 },
  },
  { _id: false }
);

const InvoiceSettingsSchema = new Schema<IInvoiceSettings>(
  {
    scope: {
      type: String,
      required: true,
      unique: true,
      default: 'default',
    },
    senderProfile: {
      type: senderProfileSchema,
      default: () => ({}),
    },
    paymentProfile: {
      type: paymentProfileSchema,
      default: () => ({}),
    },
    defaultNote: {
      type: String,
      default:
        'Als Kleinunternehmer wird gemäß § 19 UStG keine Umsatzsteuer berechnet und ausgewiesen.',
    },
    numbering: {
      type: numberingSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: InvoiceSettingsJson) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const InvoiceSettings =
  (mongoose.models.InvoiceSettings as mongoose.Model<IInvoiceSettings>) ||
  mongoose.model<IInvoiceSettings>('InvoiceSettings', InvoiceSettingsSchema);

export default InvoiceSettings;
