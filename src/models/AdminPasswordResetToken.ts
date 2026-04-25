import mongoose, { Schema, Types } from 'mongoose';

interface IAdminPasswordResetToken {
  staffUserId: Types.ObjectId;
  email: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const AdminPasswordResetTokenSchema = new Schema<IAdminPasswordResetToken>(
  {
    staffUserId: {
      type: Schema.Types.ObjectId,
      ref: 'StaffUser',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

AdminPasswordResetTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);
AdminPasswordResetTokenSchema.index({ staffUserId: 1, usedAt: 1 });

const AdminPasswordResetToken =
  (mongoose.models
    .AdminPasswordResetToken as mongoose.Model<IAdminPasswordResetToken>) ||
  mongoose.model<IAdminPasswordResetToken>(
    'AdminPasswordResetToken',
    AdminPasswordResetTokenSchema
  );

export default AdminPasswordResetToken;
