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
import TimeEntry from '@/models/TimeEntry';
import TimeProject from '@/models/TimeProject';
import TimeActivityType from '@/models/TimeActivityType';
import { timeEntryUpsertSchema } from '@/schemas/time-tracking.schema';

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
    const entry = await TimeEntry.findById(id).exec();

    if (!entry) {
      return errorResponse('Zeiteintrag nicht gefunden', 404);
    }

    return successResponse(entry, 'Zeiteintrag erfolgreich geladen');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin', 'editor'],
      'time-entry-update'
    );

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const { id } = await context.params;
    const rawBody = await request.json();
    const isTimerStop = rawBody.timerStop === true;
    const entry = await TimeEntry.findById(id).exec();

    if (!entry) {
      return errorResponse('Zeiteintrag nicht gefunden', 404);
    }

    const staffUserId =
      authState.via === 'session'
        ? String(authState.staffUser?.id ?? authState.staffUser?._id ?? '')
        : '';

    if (isTimerStop) {
      const now = new Date();
      const durationMinutes = entry.startTime
        ? Math.round((now.getTime() - entry.startTime.getTime()) / 60000)
        : 0;

      entry.isRunning = false;
      entry.endTime = now;
      entry.durationMinutes = durationMinutes;
      entry.updatedBy = staffUserId;

      await entry.save();

      return successResponse(entry, 'Timer gestoppt');
    }

    const body = timeEntryUpsertSchema.parse(rawBody);

    let projectName: string | null = entry.projectName ?? null;
    let projectColor: string | null = entry.projectColor ?? null;
    let activityTypeName: string | null = entry.activityTypeName ?? null;

    if (body.projectId !== entry.projectId) {
      if (body.projectId) {
        const project = await TimeProject.findById(body.projectId).exec();
        projectName = project?.name ?? null;
        projectColor = project?.color ?? null;
      } else {
        projectName = null;
        projectColor = null;
      }
    }

    if (body.activityTypeId !== entry.activityTypeId) {
      if (body.activityTypeId) {
        const activityType = await TimeActivityType.findById(
          body.activityTypeId
        ).exec();
        activityTypeName = activityType?.name ?? null;
      } else {
        activityTypeName = null;
      }
    }

    const entryDate = new Date(body.date);
    const startTime = body.startTime ? new Date(body.startTime) : null;
    const endTime = body.endTime ? new Date(body.endTime) : null;

    let durationMinutes = body.durationMinutes;
    if (startTime && endTime && durationMinutes === 0) {
      durationMinutes = Math.round(
        (endTime.getTime() - startTime.getTime()) / 60000
      );
    }

    entry.projectId = body.projectId ?? null;
    entry.projectName = projectName;
    entry.projectColor = projectColor;
    entry.activityTypeId = body.activityTypeId ?? null;
    entry.activityTypeName = activityTypeName;
    entry.date = entryDate;
    entry.startTime = startTime;
    entry.endTime = endTime;
    entry.durationMinutes = durationMinutes;
    entry.description = body.description;
    entry.isBillable = body.isBillable;
    entry.isRunning = body.isRunning;
    entry.updatedBy = staffUserId;

    await entry.save();

    await writeAdminAuditLog({
      request,
      authState,
      action: 'time.entry.update',
      resourceType: 'time-entry',
      resourceId: String(entry.id ?? entry._id),
      required: false,
      metadata: { durationMinutes, projectName },
    });

    return successResponse(entry, 'Zeiteintrag erfolgreich aktualisiert');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin', 'editor'],
      'time-entry-delete'
    );

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const { id } = await context.params;
    const entry = await TimeEntry.findById(id).exec();

    if (!entry) {
      return errorResponse('Zeiteintrag nicht gefunden', 404);
    }

    await entry.deleteOne();

    await writeAdminAuditLog({
      request,
      authState,
      action: 'time.entry.delete',
      resourceType: 'time-entry',
      resourceId: id,
      required: false,
      metadata: {},
    });

    return successResponse(null, 'Zeiteintrag erfolgreich gelöscht');
  } catch (error) {
    return handleApiError(error);
  }
}
