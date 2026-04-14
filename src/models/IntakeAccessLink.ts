import mongoose, { Schema } from 'mongoose';
import type { IIntakeAccessLink } from '@/types/intake';
import { intakeFormSnapshotSchema } from './intake/shared';

type IntakeAccessLinkJson = Omit<IIntakeAccessLink, '_id'> & {
  _id?: unknown;
  __v?: number;
  id?: unknown;
};

const IntakeAccessLinkSchema = new Schema<IIntakeAccessLink>(
  {
    formId: {
      type: String,
      required: true,
      trim: true,
    },
    formVersion: {
      type: Number,
      required: true,
      min: 1,
    },
    formSnapshot: {
      type: intakeFormSnapshotSchema,
      required: true,
    },
    locale: {
      type: String,
      default: 'de',
      trim: true,
    },
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    tokenPreview: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    lastOpenedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: IntakeAccessLinkJson) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

IntakeAccessLinkSchema.index({ projectId: 1, createdAt: -1 });
IntakeAccessLinkSchema.index({ email: 1, createdAt: -1 });
IntakeAccessLinkSchema.index({ isActive: 1, expiresAt: 1 });

export const IntakeAccessLink =
  (mongoose.models.IntakeAccessLink as mongoose.Model<IIntakeAccessLink>) ||
  mongoose.model<IIntakeAccessLink>('IntakeAccessLink', IntakeAccessLinkSchema);

export default IntakeAccessLink;
