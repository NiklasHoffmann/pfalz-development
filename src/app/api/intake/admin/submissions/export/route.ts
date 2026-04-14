import { NextRequest } from 'next/server';
import { handleApiError } from '@/lib/api-response';
import {
  requireAdminRouteRateLimit,
  requireIntakeAdminAccess,
} from '@/lib/api-auth';
import { buildCsvString, createCsvDownloadResponse } from '@/lib/intake/csv';
import connectToDatabase from '@/lib/mongodb';
import { escapeRegex } from '@/lib/utils';
import IntakeAccessLink from '@/models/IntakeAccessLink';
import IntakeSubmission from '@/models/IntakeSubmission';
import { listIntakeSubmissionsQuerySchema } from '@/schemas/intake/admin.schema';

function formatDate(value?: Date | string | null) {
  if (!value) {
    return '';
  }

  return new Date(value).toISOString();
}

function formatAnswerValue(answer: {
  value?: unknown;
  displayValue?: string;
  files?: Array<{ originalFilename: string }>;
}) {
  if (answer.displayValue) {
    return answer.displayValue;
  }

  if (answer.files?.length) {
    return answer.files.map((file) => file.originalFilename).join(' | ');
  }

  if (Array.isArray(answer.value)) {
    return answer.value.join(' | ');
  }

  if (typeof answer.value === 'boolean') {
    return answer.value ? 'Ja' : 'Nein';
  }

  if (answer.value === null || answer.value === undefined) {
    return '';
  }

  if (typeof answer.value === 'object') {
    return JSON.stringify(answer.value);
  }

  return String(answer.value);
}

export async function GET(request: NextRequest) {
  try {
    const rateLimitError = requireAdminRouteRateLimit(
      request,
      'intake-submissions-export'
    );

    if (rateLimitError) {
      return rateLimitError;
    }

    const authState = await requireIntakeAdminAccess(request, ['admin']);

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
      .limit(query.limit ?? 500)
      .exec();

    const accessLinks = await IntakeAccessLink.find({
      _id: {
        $in: submissions.map((submission) => submission.accessLinkId),
      },
    })
      .select(
        '_id customerName email company phone projectId formSnapshot.title formSnapshot.formType'
      )
      .exec();

    const accessLinkMap = new Map(
      accessLinks.map((accessLink) => [String(accessLink._id), accessLink])
    );

    const filteredSubmissions = submissions.filter((submission) => {
      const accessLink = accessLinkMap.get(submission.accessLinkId);
      if (
        query.formType &&
        accessLink?.formSnapshot.formType !== query.formType
      ) {
        return false;
      }

      return true;
    });

    const questionKeys = Array.from(
      new Set(
        filteredSubmissions.flatMap((submission) =>
          submission.answers.map((answer) => answer.questionKey)
        )
      )
    ).sort();

    const headers = [
      'submissionId',
      'projectId',
      'status',
      'progressPercent',
      'currentStep',
      'customerName',
      'company',
      'email',
      'phone',
      'formTitle',
      'formType',
      'submittedAt',
      'lastSavedAt',
      'updatedAt',
      'internalNotes',
      ...questionKeys,
    ];

    const rows = filteredSubmissions.map((submission) => {
      const accessLink = accessLinkMap.get(submission.accessLinkId);
      const baseRow: Record<string, unknown> = {
        submissionId: String(submission.id ?? submission._id),
        projectId: submission.projectId,
        status: submission.status,
        progressPercent: submission.progressPercent,
        currentStep: submission.currentStep || '',
        customerName:
          accessLink?.customerName || submission.customerSnapshot.name || '',
        company:
          accessLink?.company || submission.customerSnapshot.company || '',
        email: accessLink?.email || submission.customerSnapshot.email || '',
        phone: accessLink?.phone || submission.customerSnapshot.phone || '',
        formTitle: accessLink?.formSnapshot.title || '',
        formType: accessLink?.formSnapshot.formType || '',
        submittedAt: formatDate(submission.submittedAt),
        lastSavedAt: formatDate(submission.lastSavedAt),
        updatedAt: formatDate(submission.updatedAt),
        internalNotes: submission.internalNotes || '',
      };

      const answerMap = new Map(
        submission.answers.map((answer) => [answer.questionKey, answer])
      );

      for (const questionKey of questionKeys) {
        const answer = answerMap.get(questionKey);
        baseRow[questionKey] = answer ? formatAnswerValue(answer) : '';
      }

      return baseRow;
    });

    const csvContent = buildCsvString(headers, rows);
    const dateSuffix = new Date().toISOString().slice(0, 10);

    return createCsvDownloadResponse(
      `intake-submissions-${dateSuffix}.csv`,
      csvContent
    );
  } catch (error) {
    return handleApiError(error);
  }
}
