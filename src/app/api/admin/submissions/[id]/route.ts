import { NextRequest } from 'next/server';
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response';
import { writeAdminAuditLog } from '@/lib/admin-audit';
import {
  requireIntakeAdminAccess,
  requireIntakeAdminMutationAccess,
} from '@/lib/api-auth';
import { getAdminSubmissionDetail } from '@/lib/intake/admin-submissions';
import connectToDatabase from '@/lib/mongodb';
import IntakeSubmission from '@/models/IntakeSubmission';
import StaffUser from '@/models/StaffUser';
import { updateIntakeSubmissionAdminSchema } from '@/schemas/intake/admin.schema';

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
    const submissionDetail = await getAdminSubmissionDetail(id);

    if (!submissionDetail) {
      return errorResponse('Intake submission not found', 404);
    }

    return successResponse(
      submissionDetail,
      'Intake submission retrieved successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin', 'editor'],
      'intake-submission-update'
    );

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const { id } = await context.params;
    const body = updateIntakeSubmissionAdminSchema.parse(await request.json());
    const submission = await IntakeSubmission.findById(id).exec();

    if (!submission) {
      return errorResponse('Intake submission not found', 404);
    }

    if (body.status !== undefined) {
      submission.status = body.status;
    }

    if (body.internalNotes !== undefined) {
      submission.internalNotes = body.internalNotes?.trim() || undefined;
    }

    if (body.assigneeUserId !== undefined) {
      if (!body.assigneeUserId) {
        submission.assigneeUserId = undefined;
      } else {
        const assignee = await StaffUser.findOne({
          _id: body.assigneeUserId,
          isActive: true,
        })
          .select('_id')
          .exec();

        if (!assignee) {
          return errorResponse('Assignee user not found or inactive', 404);
        }

        submission.assigneeUserId = String(assignee.id ?? assignee._id);
      }
    }

    await submission.save();
    const submissionDetail = await getAdminSubmissionDetail(id);

    if (!submissionDetail) {
      return errorResponse('Intake submission not found', 404);
    }

    await writeAdminAuditLog({
      request,
      authState,
      action: 'intake.submission.update',
      resourceType: 'submission',
      resourceId: String(submission.id ?? submission._id),
      required: true,
      metadata: {
        projectId: submission.projectId,
        status: body.status,
        assigneeUserId:
          body.assigneeUserId === null ? null : body.assigneeUserId,
        internalNotesUpdated: body.internalNotes !== undefined,
      },
    });

    return successResponse(
      submissionDetail,
      'Intake submission updated successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
