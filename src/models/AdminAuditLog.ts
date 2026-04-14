import mongoose, { Schema } from 'mongoose';
import type { IAdminAuditLog } from '@/types/intake';
import { intakeStaffRoles } from '@/types/intake';

type AdminAuditLogJson = Omit<IAdminAuditLog, '_id'> & {
  _id?: unknown;
  __v?: number;
  id?: unknown;
};

const AdminAuditLogSchema = new Schema<IAdminAuditLog>(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    resourceType: {
      type: String,
      required: true,
      trim: true,
    },
    resourceId: {
      type: String,
      trim: true,
    },
    actorType: {
      type: String,
      enum: ['staff-user', 'api-key', 'system'],
      required: true,
    },
    actorUserId: {
      type: String,
      trim: true,
    },
    actorEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    actorRole: {
      type: String,
      enum: intakeStaffRoles,
    },
    requestPath: {
      type: String,
      required: true,
      trim: true,
    },
    method: {
      type: String,
      required: true,
      trim: true,
    },
    ip: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: AdminAuditLogJson) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

AdminAuditLogSchema.index({ createdAt: -1 });
AdminAuditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
AdminAuditLogSchema.index({ actorUserId: 1, createdAt: -1 });

export const AdminAuditLog =
  (mongoose.models.AdminAuditLog as mongoose.Model<IAdminAuditLog>) ||
  mongoose.model<IAdminAuditLog>('AdminAuditLog', AdminAuditLogSchema);

export default AdminAuditLog;
