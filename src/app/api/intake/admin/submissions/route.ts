import { NextRequest } from 'next/server';
import { handleApiError, successResponse } from '@/lib/api-response';
import { requireIntakeAdminAccess } from '@/lib/api-auth';
import connectToDatabase from '@/lib/mongodb';
import IntakeSubmission from '@/models/IntakeSubmission';
import IntakeAccessLink from '@/models/IntakeAccessLink';
import { escapeRegex } from '@/lib/utils';
import { listIntakeSubmissionsQuerySchema } from '@/schemas/intake/admin.schema';

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
    const query = listIntakeSubmissionsQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );
    const filters: Record<string, unknown> = {};

    if (query.status) {
      filters.status = query.status;
    }

    if (query.search) {
      const searchPattern = escapeRegex(query.search);

      const matchingAccessLinks = await IntakeAccessLink.find({
        $or: [
          { customerName: { $regex: searchPattern, $options: 'i' } },
          { email: { $regex: searchPattern, $options: 'i' } },
          { company: { $regex: searchPattern, $options: 'i' } },
          { projectId: { $regex: searchPattern, $options: 'i' } },
        ],
      })
        .select('_id')
        .exec();

      filters.accessLinkId = {
        $in: matchingAccessLinks.map((accessLink) => String(accessLink._id)),
      };
    }

    const submissions = await IntakeSubmission.find(filters)
      .select('-__v')
      .sort({ updatedAt: -1 })
      .limit(query.limit ?? 50)
      .exec();

    const accessLinks = await IntakeAccessLink.find({
      _id: {
        $in: submissions.map((submission) => submission.accessLinkId),
      },
    })
      .select(
        '_id customerName email company projectId formSnapshot.title formSnapshot.formType tokenPreview'
      )
      .exec();
    const accessLinkMap = new Map(
      accessLinks.map((accessLink) => [String(accessLink._id), accessLink])
    );

    const enrichedSubmissions = submissions
      .filter((submission) => {
        const accessLink = accessLinkMap.get(submission.accessLinkId);

        if (
          query.formType &&
          accessLink?.formSnapshot.formType !== query.formType
        ) {
          return false;
        }

        return true;
      })
      .map((submission) => ({
        ...submission.toJSON(),
        accessLink: accessLinkMap.get(submission.accessLinkId) ?? null,
      }));

    return successResponse(
      enrichedSubmissions,
      'Intake submissions retrieved successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
