import mongoose, { Schema } from 'mongoose';
import type { IIntakeForm } from '@/types/intake';
import { intakeFormStatuses, intakeFormTypes } from '@/types/intake';
import {
  intakeNotificationConfigSchema,
  intakeSectionSchema,
} from './intake/shared';

type IntakeFormJson = Omit<IIntakeForm, '_id'> & {
  _id?: unknown;
  __v?: number;
  id?: unknown;
};

const IntakeFormSchema = new Schema<IIntakeForm>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: intakeFormStatuses,
      default: 'draft',
    },
    version: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    formType: {
      type: String,
      enum: intakeFormTypes,
      required: true,
    },
    defaultLocale: {
      type: String,
      default: 'de',
    },
    sections: {
      type: [intakeSectionSchema],
      default: [],
    },
    notificationConfig: {
      type: intakeNotificationConfigSchema,
      default: undefined,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: IntakeFormJson) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

IntakeFormSchema.index({ formType: 1, status: 1 });
IntakeFormSchema.index({ updatedAt: -1 });

export const IntakeForm =
  (mongoose.models.IntakeForm as mongoose.Model<IIntakeForm>) ||
  mongoose.model<IIntakeForm>('IntakeForm', IntakeFormSchema);

export default IntakeForm;
