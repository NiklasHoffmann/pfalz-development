import { NextRequest } from 'next/server';
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response';
import { getAdminActorUserId, writeAdminAuditLog } from '@/lib/admin-audit';
import {
  requireIntakeAdminAccess,
  requireIntakeAdminMutationAccess,
} from '@/lib/api-auth';
import { siteConfig } from '@/config/site';
import { createIntakeFormSnapshot } from '@/lib/intake/forms';
import { buildProjectTokenPath } from '@/lib/intake/path';
import {
  generateIntakeToken,
  getIntakeTokenPreview,
  hashIntakeToken,
} from '@/lib/intake/token';
import connectToDatabase from '@/lib/mongodb';
import IntakeAccessLink from '@/models/IntakeAccessLink';
import IntakeForm from '@/models/IntakeForm';
import { escapeRegex } from '@/lib/utils';
import {
  createIntakeAccessLinkSchema,
  listIntakeAccessLinksQuerySchema,
} from '@/schemas/intake/admin.schema';

export async function GET(request: NextRequest) {
  try {
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
      .limit(100)
      .exec();

    return successResponse(accessLinks, 'Access links retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin'],
      'intake-access-link-create'
    );

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const body = createIntakeAccessLinkSchema.parse(await request.json());
    const form = await IntakeForm.findById(body.formId).exec();

    if (!form) {
      return errorResponse('Intake form not found', 404);
    }

    const rawToken = generateIntakeToken();
    const locale = body.locale || form.defaultLocale || 'de';
    const actorUserId = getAdminActorUserId(authState);
    const createdAccessLink = await IntakeAccessLink.create({
      formId: String(form.id ?? form._id),
      formVersion: form.version,
      formSnapshot: createIntakeFormSnapshot(form),
      locale,
      projectId: body.projectId,
      customerName: body.customerName,
      company: body.company,
      email: body.email,
      phone: body.phone,
      tokenHash: hashIntakeToken(rawToken),
      tokenPreview: getIntakeTokenPreview(rawToken),
      isActive: true,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      createdBy: actorUserId || 'api-key',
    });
    const accessPath = buildProjectTokenPath(locale, rawToken);

    await writeAdminAuditLog({
      request,
      authState,
      action: 'intake.access-link.create',
      resourceType: 'access-link',
      resourceId: String(createdAccessLink.id ?? createdAccessLink._id),
      required: true,
      metadata: {
        formId: String(form.id ?? form._id),
        projectId: body.projectId,
        customerName: body.customerName,
        locale,
        expiresAt: body.expiresAt || null,
        createdBy: createdAccessLink.createdBy,
      },
    });

    return successResponse(
      {
        accessLink: createdAccessLink,
        accessUrl: `${siteConfig.url}${accessPath}`,
        qrValue: `${siteConfig.url}${accessPath}`,
        tokenPreview: getIntakeTokenPreview(rawToken),
      },
      'Access link created successfully',
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
