import mongoose, { Schema } from 'mongoose';
import type { IQrScan } from '@/types/database';

const QrScanSchema = new Schema<IQrScan>(
  {
    code: {
      type: String,
      enum: ['vk', 'fl', 'pub'],
      required: true,
      index: true,
    },
    campaign: {
      type: String,
      enum: ['visitenkarte', 'flyer', 'public_display'],
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ['qr'],
      default: 'qr',
      required: true,
    },
    medium: {
      type: String,
      enum: ['offline'],
      default: 'offline',
      required: true,
    },
    targetUrl: {
      type: String,
      required: true,
      trim: true,
    },
    ip: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: null,
    },
    referer: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

QrScanSchema.index({ createdAt: -1 });
QrScanSchema.index({ campaign: 1, createdAt: -1 });

export const QrScan =
  (mongoose.models.QrScan as mongoose.Model<IQrScan>) ||
  mongoose.model<IQrScan>('QrScan', QrScanSchema);

export default QrScan;
