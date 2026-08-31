import mongoose, { Schema } from 'mongoose';
import type { ITimeProject } from '@/types/time-tracking';

type TimeProjectJson = Omit<ITimeProject, '_id'> & {
  _id?: unknown;
  __v?: number;
  id?: unknown;
};

const TimeProjectSchema = new Schema<ITimeProject>(
  {
    name: { type: String, required: true, trim: true },
    color: { type: String, required: true, default: '#6366f1' },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: TimeProjectJson) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

TimeProjectSchema.index({ isActive: 1, name: 1 });

export const TimeProject =
  (mongoose.models.TimeProject as mongoose.Model<ITimeProject>) ||
  mongoose.model<ITimeProject>('TimeProject', TimeProjectSchema);

export default TimeProject;
