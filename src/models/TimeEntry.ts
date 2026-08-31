import mongoose, { Schema } from 'mongoose';
import type { ITimeEntry } from '@/types/time-tracking';

type TimeEntryJson = Omit<ITimeEntry, '_id'> & {
  _id?: unknown;
  __v?: number;
  id?: unknown;
};

const TimeEntrySchema = new Schema<ITimeEntry>(
  {
    staffUserId: { type: String, required: true },
    staffUserName: { type: String, required: true, trim: true },
    projectId: { type: String, default: null },
    projectName: { type: String, default: null },
    projectColor: { type: String, default: null },
    activityTypeId: { type: String, default: null },
    activityTypeName: { type: String, default: null },
    date: { type: Date, required: true },
    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },
    durationMinutes: { type: Number, required: true, min: 0, default: 0 },
    description: { type: String, default: '' },
    isRunning: { type: Boolean, default: false },
    isBillable: { type: Boolean, default: true },
    createdBy: { type: String, default: null },
    updatedBy: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: TimeEntryJson) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

TimeEntrySchema.index({ staffUserId: 1, date: -1 });
TimeEntrySchema.index({ isRunning: 1 });
TimeEntrySchema.index({ date: -1, createdAt: -1 });

export const TimeEntry =
  (mongoose.models.TimeEntry as mongoose.Model<ITimeEntry>) ||
  mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);

export default TimeEntry;
