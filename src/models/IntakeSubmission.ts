import mongoose, { Schema } from 'mongoose';
import type { IIntakeSubmission } from '@/types/intake';
import { intakeSubmissionStatuses } from '@/types/intake';
import {
  intakeAnswerSchema,
  intakeConsentSchema,
  intakeCustomerSnapshotSchema,
} from './intake/shared';

type IntakeSubmissionJson = Omit<IIntakeSubmission, '_id'> & {
  _id?: unknown;
  __v?: number;
  id?: unknown;
};

const IntakeSubmissionSchema = new Schema<IIntakeSubmission>(
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
    accessLinkId: {
      type: String,
      required: true,
      trim: true,
    },
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    customerSnapshot: {
      type: intakeCustomerSnapshotSchema,
      required: true,
    },
    status: {
      type: String,
      enum: intakeSubmissionStatuses,
      default: 'begonnen',
    },
    currentStep: {
      type: String,
      default: null,
    },
    progressPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    answers: {
      type: [intakeAnswerSchema],
      default: [],
    },
    internalNotes: {
      type: String,
      default: null,
    },
    assigneeUserId: {
      type: String,
      default: null,
    },
    consent: {
      type: intakeConsentSchema,
      default: undefined,
    },
    lastSavedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: IntakeSubmissionJson) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

IntakeSubmissionSchema.index({ accessLinkId: 1, updatedAt: -1 });
IntakeSubmissionSchema.index({ status: 1, updatedAt: -1 });
IntakeSubmissionSchema.index({ projectId: 1, updatedAt: -1 });
IntakeSubmissionSchema.index({ submittedAt: -1 });

export const IntakeSubmission =
  (mongoose.models.IntakeSubmission as mongoose.Model<IIntakeSubmission>) ||
  mongoose.model<IIntakeSubmission>('IntakeSubmission', IntakeSubmissionSchema);

export default IntakeSubmission;
