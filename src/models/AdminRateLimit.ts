import mongoose, { Schema } from 'mongoose';

interface IAdminRateLimit {
  identifier: string;
  count: number;
  resetAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const AdminRateLimitSchema = new Schema<IAdminRateLimit>(
  {
    identifier: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    count: {
      type: Number,
      required: true,
      min: 0,
    },
    resetAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

AdminRateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

const AdminRateLimit =
  (mongoose.models.AdminRateLimit as mongoose.Model<IAdminRateLimit>) ||
  mongoose.model<IAdminRateLimit>('AdminRateLimit', AdminRateLimitSchema);

export default AdminRateLimit;