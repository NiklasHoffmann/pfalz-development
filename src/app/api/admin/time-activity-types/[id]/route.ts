import { NextRequest } from 'next/server';
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response';
import {
  requireIntakeAdminAccess,
  requireIntakeAdminMutationAccess,
} from '@/lib/api-auth';
import { writeAdminAuditLog } from '@/lib/admin-audit';
import connectToDatabase from '@/lib/mongodb';
import TimeActivityType from '@/models/TimeActivityType';
import { timeActivityTypeUpsertSchema } from '@/schemas/time-tracking.schema';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const authState = await requireIntakeAdminAccess(request, [
      'admin',
      'editor',
    ]);

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const { id } = await context.params;
    const activityType = await TimeActivityType.findById(id).exec();

    if (!activityType) {
      return errorResponse('Tätigkeitsart nicht gefunden', 404);
    }

    return successResponse(activityType, 'Tätigkeitsart erfolgreich geladen');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin', 'editor'],
      'time-activity-type-update'
    );

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const { id } = await context.params;
    const body = timeActivityTypeUpsertSchema.parse(await request.json());
    const activityType = await TimeActivityType.findById(id).exec();

    if (!activityType) {
      return errorResponse('Tätigkeitsart nicht gefunden', 404);
    }

    activityType.name = body.name;
    activityType.description = body.description;
    activityType.isActive = body.isActive;

    await activityType.save();

    await writeAdminAuditLog({
      request,
      authState,
      action: 'time.activityType.update',
      resourceType: 'time-activity-type',
      resourceId: String(activityType.id ?? activityType._id),
      required: true,
      metadata: { name: activityType.name },
    });

    return successResponse(
      activityType,
      'Tätigkeitsart erfolgreich aktualisiert'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin'],
      'time-activity-type-delete'
    );

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const { id } = await context.params;
    const activityType = await TimeActivityType.findById(id).exec();

    if (!activityType) {
      return errorResponse('Tätigkeitsart nicht gefunden', 404);
    }

    await activityType.deleteOne();

    await writeAdminAuditLog({
      request,
      authState,
      action: 'time.activityType.delete',
      resourceType: 'time-activity-type',
      resourceId: id,
      required: true,
      metadata: { name: activityType.name },
    });

    return successResponse(null, 'Tätigkeitsart erfolgreich gelöscht');
  } catch (error) {
    return handleApiError(error);
  }
}
