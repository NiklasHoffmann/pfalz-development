import { NextRequest } from 'next/server';
import { handleApiError, successResponse } from '@/lib/api-response';
import {
  requireIntakeAdminAccess,
  requireIntakeAdminMutationAccess,
} from '@/lib/api-auth';
import { writeAdminAuditLog } from '@/lib/admin-audit';
import connectToDatabase from '@/lib/mongodb';
import TimeProject from '@/models/TimeProject';
import { timeProjectUpsertSchema } from '@/schemas/time-tracking.schema';

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
    const projects = await TimeProject.find(filter).sort({ name: 1 }).exec();

    return successResponse(projects, 'Projekte erfolgreich geladen');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin', 'editor'],
      'time-project-create'
    );

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const body = timeProjectUpsertSchema.parse(await request.json());

    const project = await TimeProject.create({
      ...body,
      createdBy:
        authState.via === 'session'
          ? String(authState.staffUser?.id ?? authState.staffUser?._id ?? '')
          : undefined,
    });

    await writeAdminAuditLog({
      request,
      authState,
      action: 'time.project.create',
      resourceType: 'time-project',
      resourceId: String(project.id ?? project._id),
      required: true,
      metadata: { name: project.name },
    });

    return successResponse(project, 'Projekt erfolgreich erstellt', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
