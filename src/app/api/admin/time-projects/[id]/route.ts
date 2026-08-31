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
import TimeProject from '@/models/TimeProject';
import { timeProjectUpsertSchema } from '@/schemas/time-tracking.schema';

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
    const project = await TimeProject.findById(id).exec();

    if (!project) {
      return errorResponse('Projekt nicht gefunden', 404);
    }

    return successResponse(project, 'Projekt erfolgreich geladen');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin', 'editor'],
      'time-project-update'
    );

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const { id } = await context.params;
    const body = timeProjectUpsertSchema.parse(await request.json());
    const project = await TimeProject.findById(id).exec();

    if (!project) {
      return errorResponse('Projekt nicht gefunden', 404);
    }

    project.name = body.name;
    project.color = body.color;
    project.description = body.description;
    project.isActive = body.isActive;

    await project.save();

    await writeAdminAuditLog({
      request,
      authState,
      action: 'time.project.update',
      resourceType: 'time-project',
      resourceId: String(project.id ?? project._id),
      required: true,
      metadata: { name: project.name },
    });

    return successResponse(project, 'Projekt erfolgreich aktualisiert');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin'],
      'time-project-delete'
    );

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const { id } = await context.params;
    const project = await TimeProject.findById(id).exec();

    if (!project) {
      return errorResponse('Projekt nicht gefunden', 404);
    }

    await project.deleteOne();

    await writeAdminAuditLog({
      request,
      authState,
      action: 'time.project.delete',
      resourceType: 'time-project',
      resourceId: id,
      required: true,
      metadata: { name: project.name },
    });

    return successResponse(null, 'Projekt erfolgreich gelöscht');
  } catch (error) {
    return handleApiError(error);
  }
}
