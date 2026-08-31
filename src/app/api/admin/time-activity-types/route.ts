import { NextRequest } from 'next/server';
import { handleApiError, successResponse } from '@/lib/api-response';
import {
  requireIntakeAdminAccess,
  requireIntakeAdminMutationAccess,
} from '@/lib/api-auth';
import { writeAdminAuditLog } from '@/lib/admin-audit';
import connectToDatabase from '@/lib/mongodb';
import TimeActivityType from '@/models/TimeActivityType';
import { timeActivityTypeUpsertSchema } from '@/schemas/time-tracking.schema';

export async function GET(request: NextRequest) {
  try {
    const authState = await requireIntakeAdminAccess(request, [
      'admin',
      'editor',
    ]);

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const onlyActive = searchParams.get('active') === 'true';

    const filter = onlyActive ? { isActive: true } : {};
    const activityTypes = await TimeActivityType.find(filter)
      .sort({ name: 1 })
      .exec();

    return successResponse(
      activityTypes,
      'Tätigkeitsarten erfolgreich geladen'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin', 'editor'],
      'time-activity-type-create'
    );

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const body = timeActivityTypeUpsertSchema.parse(await request.json());

    const activityType = await TimeActivityType.create({
      ...body,
      createdBy:
        authState.via === 'session'
          ? String(authState.staffUser?.id ?? authState.staffUser?._id ?? '')
          : undefined,
    });

    await writeAdminAuditLog({
      request,
      authState,
      action: 'time.activityType.create',
      resourceType: 'time-activity-type',
      resourceId: String(activityType.id ?? activityType._id),
      required: true,
      metadata: { name: activityType.name },
    });

    return successResponse(
      activityType,
      'Tätigkeitsart erfolgreich erstellt',
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
