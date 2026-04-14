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
import { listIntakeAccessLinksQuerySchema } from '@/schemas/intake/admin.schema';

function formatDate(value?: Date | string | null) {
  if (!value) {
    return '';
  }

  return new Date(value).toISOString();
}

export async function GET(request: NextRequest) {
  try {
    const rateLimitError = requireAdminRouteRateLimit(
      request,
      'intake-access-links-export'
    );

    if (rateLimitError) {
      return rateLimitError;
    }

    const authState = await requireIntakeAdminAccess(request, ['admin']);

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const query = listIntakeAccessLinksQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );
    const filters: Record<string, unknown> = {};

    if (query.formId) {
      filters.formId = query.formId;
    }

    if (query.isActive) {
      filters.isActive = query.isActive === 'true';
    }

    if (query.search) {
      const searchPattern = escapeRegex(query.search);

      filters.$or = [
        { projectId: { $regex: searchPattern, $options: 'i' } },
        { customerName: { $regex: searchPattern, $options: 'i' } },
        { email: { $regex: searchPattern, $options: 'i' } },
        { company: { $regex: searchPattern, $options: 'i' } },
      ];
    }

    const accessLinks = await IntakeAccessLink.find(filters)
      .select('-__v -tokenHash')
      .sort({ createdAt: -1 })
      .limit(500)
      .exec();

    const headers = [
      'accessLinkId',
      'locale',
      'projectId',
      'customerName',
      'company',
      'email',
      'phone',
      'formTitle',
      'formType',
      'formVersion',
      'isActive',
      'expiresAt',
      'lastOpenedAt',
      'createdAt',
      'tokenPreview',
    ];

    const rows = accessLinks.map((accessLink) => ({
      accessLinkId: String(accessLink.id ?? accessLink._id),
      locale: accessLink.locale || 'de',
      projectId: accessLink.projectId,
      customerName: accessLink.customerName,
      company: accessLink.company || '',
      email: accessLink.email || '',
      phone: accessLink.phone || '',
      formTitle: accessLink.formSnapshot.title,
      formType: accessLink.formSnapshot.formType,
      formVersion: accessLink.formVersion,
      isActive: accessLink.isActive ? 'true' : 'false',
      expiresAt: formatDate(accessLink.expiresAt),
      lastOpenedAt: formatDate(accessLink.lastOpenedAt),
      createdAt: formatDate(accessLink.createdAt),
      tokenPreview: accessLink.tokenPreview,
    }));

    const csvContent = buildCsvString(headers, rows);
    const dateSuffix = new Date().toISOString().slice(0, 10);

    return createCsvDownloadResponse(
      `intake-access-links-${dateSuffix}.csv`,
      csvContent
    );
  } catch (error) {
    return handleApiError(error);
  }
}
