import mongoose, { Schema } from 'mongoose';
import type { IIntakeFileAsset } from '@/types/intake';
import { intakeUploadOwners, intakeUploadScanStatuses } from '@/types/intake';

type IntakeFileAssetJson = Omit<IIntakeFileAsset, '_id'> & {
  _id?: unknown;
  __v?: number;
  id?: unknown;
};

const IntakeFileAssetSchema = new Schema<IIntakeFileAsset>(
  {
    submissionId: {
      type: String,
      required: true,
      trim: true,
    },
    accessLinkId: {
      type: String,
      required: true,
      trim: true,
    },
    questionKey: {
      type: String,
      required: true,
      trim: true,
    },
    storagePath: {
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
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    uploadedBy: {
      type: String,
      enum: intakeUploadOwners,
      default: 'customer',
    },
    scanStatus: {
      type: String,
      enum: intakeUploadScanStatuses,
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: IntakeFileAssetJson) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

IntakeFileAssetSchema.index({ submissionId: 1, uploadedAt: -1 });
IntakeFileAssetSchema.index({ accessLinkId: 1, uploadedAt: -1 });
IntakeFileAssetSchema.index({ questionKey: 1 });

export const IntakeFileAsset =
  (mongoose.models.IntakeFileAsset as mongoose.Model<IIntakeFileAsset>) ||
  mongoose.model<IIntakeFileAsset>('IntakeFileAsset', IntakeFileAssetSchema);

export default IntakeFileAsset;
