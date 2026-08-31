import mongoose, { Schema } from 'mongoose';
import type { ITimeActivityType } from '@/types/time-tracking';

type TimeActivityTypeJson = Omit<ITimeActivityType, '_id'> & {
  _id?: unknown;
  __v?: number;
  id?: unknown;
};

const TimeActivityTypeSchema = new Schema<ITimeActivityType>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: TimeActivityTypeJson) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

TimeActivityTypeSchema.index({ isActive: 1, name: 1 });

export const TimeActivityType =
  (mongoose.models.TimeActivityType as mongoose.Model<ITimeActivityType>) ||
  mongoose.model<ITimeActivityType>('TimeActivityType', TimeActivityTypeSchema);

export default TimeActivityType;
