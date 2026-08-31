import { NextRequest } from 'next/server';
import { handleApiError, successResponse } from '@/lib/api-response';
import {
  requireIntakeAdminAccess,
  requireIntakeAdminMutationAccess,
} from '@/lib/api-auth';
import { writeAdminAuditLog } from '@/lib/admin-audit';
import connectToDatabase from '@/lib/mongodb';
import TimeEntry from '@/models/TimeEntry';
import TimeProject from '@/models/TimeProject';
import TimeActivityType from '@/models/TimeActivityType';
import {
  timeEntryUpsertSchema,
  timeEntryStartTimerSchema,
} from '@/schemas/time-tracking.schema';

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
    const staffUserId = searchParams.get('staffUserId');
    const projectId = searchParams.get('projectId');
    const activityTypeId = searchParams.get('activityTypeId');
    const running = searchParams.get('running');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const filter: Record<string, unknown> = {};

    if (staffUserId) filter.staffUserId = staffUserId;
    if (projectId) filter.projectId = projectId;
    if (activityTypeId) filter.activityTypeId = activityTypeId;
    if (running === 'true') filter.isRunning = true;

    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to) dateFilter.$lte = new Date(to);
      filter.date = dateFilter;
    }

    const entries = await TimeEntry.find(filter)
      .sort({ date: -1, startTime: -1, createdAt: -1 })
      .exec();

    return successResponse(entries, 'Zeiteinträge erfolgreich geladen');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin', 'editor'],
      'time-entry-create'
    );

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();

    const rawBody = await request.json();
    const isTimerStart = rawBody.timerStart === true;

    const staffUserId =
      authState.via === 'session'
        ? String(authState.staffUser?.id ?? authState.staffUser?._id ?? '')
        : '';
    const staffUserName =
      authState.via === 'session' ? (authState.staffUser?.name ?? '') : '';

    if (isTimerStart) {
      // Stop any running timer first
      await TimeEntry.updateMany(
        { staffUserId, isRunning: true },
        { isRunning: false, endTime: new Date() }
      );

      const body = timeEntryStartTimerSchema.parse(rawBody);

      let projectName: string | null = null;
      let projectColor: string | null = null;
      let activityTypeName: string | null = null;

      if (body.projectId) {
        const project = await TimeProject.findById(body.projectId).exec();
        if (project) {
          projectName = project.name;
          projectColor = project.color;
        }
      }

      if (body.activityTypeId) {
        const activityType = await TimeActivityType.findById(
          body.activityTypeId
        ).exec();
        if (activityType) {
          activityTypeName = activityType.name;
        }
      }

      const now = new Date();
      const entry = await TimeEntry.create({
        staffUserId,
        staffUserName,
        projectId: body.projectId ?? null,
        projectName,
        projectColor,
        activityTypeId: body.activityTypeId ?? null,
        activityTypeName,
        date: now,
        startTime: now,
        endTime: null,
        durationMinutes: 0,
        description: body.description,
        isRunning: true,
        isBillable: body.isBillable,
        createdBy: staffUserId,
        updatedBy: staffUserId,
      });

      return successResponse(entry, 'Timer gestartet', 201);
    }

    // Manual entry
    const body = timeEntryUpsertSchema.parse(rawBody);

    let projectName: string | null = null;
    let projectColor: string | null = null;
    let activityTypeName: string | null = null;

    if (body.projectId) {
      const project = await TimeProject.findById(body.projectId).exec();
      if (project) {
        projectName = project.name;
        projectColor = project.color;
      }
    }

    if (body.activityTypeId) {
      const activityType = await TimeActivityType.findById(
        body.activityTypeId
      ).exec();
      if (activityType) {
        activityTypeName = activityType.name;
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

    const entry = await TimeEntry.create({
      staffUserId,
      staffUserName,
      projectId: body.projectId ?? null,
      projectName,
      projectColor,
      activityTypeId: body.activityTypeId ?? null,
      activityTypeName,
      date: entryDate,
      startTime,
      endTime,
      durationMinutes,
      description: body.description,
      isRunning: false,
      isBillable: body.isBillable,
      createdBy: staffUserId,
      updatedBy: staffUserId,
    });

    await writeAdminAuditLog({
      request,
      authState,
      action: 'time.entry.create',
      resourceType: 'time-entry',
      resourceId: String(entry.id ?? entry._id),
      required: false,
      metadata: { durationMinutes, projectName },
    });

    return successResponse(entry, 'Zeiteintrag erfolgreich erstellt', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
