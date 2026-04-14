import mongoose, { Schema } from 'mongoose';
import {
  intakeFieldTypes,
  intakeFormTypes,
  intakeStaffRoles,
  intakeSubmissionStatuses,
  intakeUploadOwners,
  intakeUploadScanStatuses,
  intakeVisibilityOperators,
  type IntakeAnswer,
  type IntakeConsentRecord,
  type IntakeCustomerSnapshot,
  type IntakeFieldOption,
  type IntakeFormSnapshot,
  type IntakeNotificationConfig,
  type IntakeQuestionDefinition,
  type IntakeSectionDefinition,
  type IntakeValidationRules,
  type IntakeVisibilityRule,
} from '@/types/intake';

export const intakeFieldOptionSchema = new Schema<IntakeFieldOption>(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

export const intakeVisibilityRuleSchema = new Schema<IntakeVisibilityRule>(
  {
    sourceQuestionKey: {
      type: String,
      required: true,
      trim: true,
    },
    operator: {
      type: String,
      enum: intakeVisibilityOperators,
      required: true,
    },
    value: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    values: {
      type: [Schema.Types.Mixed],
      default: undefined,
    },
  },
  { _id: false }
);

export const intakeValidationRulesSchema = new Schema<IntakeValidationRules>(
  {
    minLength: Number,
    maxLength: Number,
    pattern: String,
    min: Number,
    max: Number,
    allowedMimeTypes: {
      type: [String],
      default: undefined,
    },
    maxFileSize: Number,
    allowMultiple: Boolean,
    minSelections: Number,
    maxSelections: Number,
  },
  { _id: false }
);

export const intakeQuestionSchema = new Schema<IntakeQuestionDefinition>(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    fieldType: {
      type: String,
      enum: intakeFieldTypes,
      required: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    helpText: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: null,
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: {
      type: [intakeFieldOptionSchema],
      default: undefined,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    visibilityRules: {
      type: [intakeVisibilityRuleSchema],
      default: undefined,
    },
    validationRules: {
      type: intakeValidationRulesSchema,
      default: undefined,
    },
    defaultValue: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  },
  { _id: false }
);

export const intakeSectionSchema = new Schema<IntakeSectionDefinition>(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: null,
    },
    stepKey: {
      type: String,
      required: true,
      trim: true,
    },
    questions: {
      type: [intakeQuestionSchema],
      default: [],
    },
  },
  { _id: false }
);

export const intakeNotificationConfigSchema =
  new Schema<IntakeNotificationConfig>(
    {
      internalRecipients: {
        type: [String],
        default: [],
      },
      internalSubject: {
        type: String,
        required: true,
        trim: true,
      },
      internalTemplateKey: {
        type: String,
        required: true,
        trim: true,
      },
      customerConfirmationEnabled: {
        type: Boolean,
        default: false,
      },
      customerSubject: {
        type: String,
        default: null,
      },
      customerTemplateKey: {
        type: String,
        default: null,
      },
    },
    { _id: false }
  );

export const intakeFormSnapshotSchema = new Schema<IntakeFormSnapshot>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    formType: {
      type: String,
      enum: intakeFormTypes,
      required: true,
    },
    version: {
      type: Number,
      required: true,
      min: 1,
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
  { _id: false }
);

const intakeAnswerFileReferenceSchema = new Schema(
  {
    fileAssetId: {
      type: String,
      required: true,
      trim: true,
    },
    originalFilename: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

export const intakeAnswerSchema = new Schema<IntakeAnswer>(
  {
    questionId: {
      type: String,
      required: true,
      trim: true,
    },
    questionKey: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    displayValue: {
      type: String,
      default: null,
    },
    files: {
      type: [intakeAnswerFileReferenceSchema],
      default: undefined,
    },
  },
  { _id: false }
);

export const intakeCustomerSnapshotSchema = new Schema<IntakeCustomerSnapshot>(
  {
    name: {
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
  },
  { _id: false }
);

export const intakeConsentSchema = new Schema<IntakeConsentRecord>(
  {
    accepted: {
      type: Boolean,
      default: false,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    privacyVersion: {
      type: String,
      default: null,
    },
    ipHash: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

export const intakeStaffRoleEnum = intakeStaffRoles;
export const intakeSubmissionStatusEnum = intakeSubmissionStatuses;
export const intakeUploadOwnerEnum = intakeUploadOwners;
export const intakeUploadScanStatusEnum = intakeUploadScanStatuses;

export type IntakeObjectId = mongoose.Types.ObjectId;
