import mongoose, { Schema } from 'mongoose';
import type { IStaffUser } from '@/types/intake';
import { intakeStaffRoles } from '@/types/intake';

type StaffUserJson = Omit<IStaffUser, '_id' | 'passwordHash'> & {
  _id?: unknown;
  __v?: number;
  id?: unknown;
  passwordHash?: string;
};

const StaffUserSchema = new Schema<IStaffUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: true,
      minlength: 32,
    },
    role: {
      type: String,
      enum: intakeStaffRoles,
      default: 'editor',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: StaffUserJson) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

StaffUserSchema.index({ role: 1, isActive: 1 });

export const StaffUser =
  (mongoose.models.StaffUser as mongoose.Model<IStaffUser>) ||
  mongoose.model<IStaffUser>('StaffUser', StaffUserSchema);

export default StaffUser;
