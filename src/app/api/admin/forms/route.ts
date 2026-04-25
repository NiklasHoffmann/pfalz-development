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
import connectToDatabase from '@/lib/mongodb';
import IntakeForm from '@/models/IntakeForm';
import { getIntakeTemplateBySlug } from '@/content/intake/templates';
import { escapeRegex } from '@/lib/utils';
import {
  createIntakeFormSchema,
  listIntakeFormsQuerySchema,
} from '@/schemas/intake/admin.schema';

export async function GET(request: NextRequest) {
  try {
    const authState = await requireIntakeAdminAccess(request, ['admin']);

    if ('status' in authState) {
      return authState;
    }

    const query = listIntakeFormsQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );

    await connectToDatabase();

    const filters: Record<string, unknown> = {};

    if (query.status) {
      filters.status = query.status;
    }

    if (query.formType) {
      filters.formType = query.formType;
    }

    if (query.search) {
      const searchPattern = escapeRegex(query.search);

      filters.$or = [
        { title: { $regex: searchPattern, $options: 'i' } },
        { slug: { $regex: searchPattern, $options: 'i' } },
        { description: { $regex: searchPattern, $options: 'i' } },
      ];
    }

    const forms = await IntakeForm.find(filters)
      .select('-__v')
      .sort({ updatedAt: -1 })
      .exec();

    return successResponse(forms, 'Intake forms retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin'],
      'intake-form-create'
    );

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const body = createIntakeFormSchema.parse(await request.json());

    const existingForm = await IntakeForm.findOne({ slug: body.slug }).exec();

    if (existingForm) {
      return errorResponse('An intake form with this slug already exists', 409);
    }

    if (body.templateSlug) {
      const template = getIntakeTemplateBySlug(body.templateSlug);

      if (!template) {
        return errorResponse('Template not found', 404);
      }

      const createdForm = await IntakeForm.create({
        ...template,
        title: body.title,
        slug: body.slug,
        description: body.description ?? template.description,
        status: body.status ?? 'draft',
        version: 1,
      });

      await writeAdminAuditLog({
        request,
        authState,
        action: 'intake.form.create',
        resourceType: 'form',
        resourceId: String(createdForm.id ?? createdForm._id),
        required: true,
        metadata: {
          source: 'template',
          templateSlug: body.templateSlug,
          slug: createdForm.slug,
          title: createdForm.title,
          status: createdForm.status,
          formType: createdForm.formType,
          version: createdForm.version,
        },
      });

      return successResponse(
        createdForm,
        'Intake form created successfully',
        201
      );
    }

    if (body.duplicateFromFormId) {
      const sourceForm = await IntakeForm.findById(
        body.duplicateFromFormId
      ).exec();

      if (!sourceForm) {
        return errorResponse('Source form not found', 404);
      }

      const createdForm = await IntakeForm.create({
        title: body.title,
        slug: body.slug,
        description: body.description ?? sourceForm.description,
        status: body.status ?? 'draft',
        version: sourceForm.version + 1,
        formType: sourceForm.formType,
        defaultLocale: sourceForm.defaultLocale,
        sections: JSON.parse(JSON.stringify(sourceForm.sections)),
        notificationConfig: sourceForm.notificationConfig
          ? JSON.parse(JSON.stringify(sourceForm.notificationConfig))
          : undefined,
      });

      await writeAdminAuditLog({
        request,
        authState,
        action: 'intake.form.create',
        resourceType: 'form',
        resourceId: String(createdForm.id ?? createdForm._id),
        required: true,
        metadata: {
          source: 'duplicate',
          duplicateFromFormId: body.duplicateFromFormId,
          slug: createdForm.slug,
          title: createdForm.title,
          status: createdForm.status,
          formType: createdForm.formType,
          version: createdForm.version,
        },
      });

      return successResponse(
        createdForm,
        'Intake form duplicated successfully',
        201
      );
    }

    return errorResponse('No source for form creation provided', 400);
  } catch (error) {
    return handleApiError(error);
  }
}
