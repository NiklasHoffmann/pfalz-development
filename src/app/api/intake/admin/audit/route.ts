import { NextRequest } from 'next/server';
import { handleApiError, successResponse } from '@/lib/api-response';
import { requireIntakeAdminAccess } from '@/lib/api-auth';
import connectToDatabase from '@/lib/mongodb';
import AdminAuditLog from '@/models/AdminAuditLog';
import { escapeRegex } from '@/lib/utils';
import { listAdminAuditLogsQuerySchema } from '@/schemas/intake/admin.schema';

export async function GET(request: NextRequest) {
  try {
    const authState = await requireIntakeAdminAccess(request, ['admin']);

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();

    const query = listAdminAuditLogsQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );
    const filters: Record<string, unknown> = {};

    if (query.actorType) {
      filters.actorType = query.actorType;
    }

    if (query.resourceType) {
      filters.resourceType = query.resourceType.trim();
    }

    if (query.method) {
      filters.method = query.method;
    }

    if (query.search) {
      const searchPattern = escapeRegex(query.search);

      filters.$or = [
        { action: { $regex: searchPattern, $options: 'i' } },
        { resourceType: { $regex: searchPattern, $options: 'i' } },
        { resourceId: { $regex: searchPattern, $options: 'i' } },
        { actorEmail: { $regex: searchPattern, $options: 'i' } },
        { requestPath: { $regex: searchPattern, $options: 'i' } },
        { ip: { $regex: searchPattern, $options: 'i' } },
        { method: { $regex: searchPattern, $options: 'i' } },
      ];
    }

    const auditLogs = await AdminAuditLog.find(filters)
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(query.limit ?? 100)
      .exec();

    return successResponse(
      auditLogs,
      'Admin audit logs retrieved successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
