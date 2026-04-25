import { NextRequest } from 'next/server';
import { handleApiError, successResponse } from '@/lib/api-response';
import { writeAdminAuditLog } from '@/lib/admin-audit';
import { requireIntakeAdminMutationAccess } from '@/lib/api-auth';
import { seedIntakeTemplates } from '@/lib/intake/templates';
import { intakeAdminBootstrapSchema } from '@/schemas/intake/admin.schema';

export async function POST(request: NextRequest) {
  try {
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin'],
      'intake-template-bootstrap'
    );

    if ('status' in authState) {
      return authState;
    }

    const body = intakeAdminBootstrapSchema.parse(await request.json());
    const result = await seedIntakeTemplates({ overwrite: body.overwrite });

    await writeAdminAuditLog({
      request,
      authState,
      action: 'intake.templates.bootstrap',
      resourceType: 'template-bootstrap',
      required: true,
      metadata: {
        overwrite: Boolean(body.overwrite),
        result,
      },
    });

    return successResponse(
      {
        result,
      },
      'Intake templates bootstrapped successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
