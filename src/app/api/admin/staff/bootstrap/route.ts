import { NextRequest } from 'next/server';
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response';
import { writeAdminAuditLog } from '@/lib/admin-audit';
import {
  requireAdminApiKey,
  requireAdminRouteRateLimit,
  requireTrustedAdminOrigin,
} from '@/lib/api-auth';
import { getClientIp, isLocalAdminIp } from '@/lib/admin-network';
import { hashPassword } from '@/lib/auth/password';
import { env } from '@/lib/env';
import connectToDatabase from '@/lib/mongodb';
import StaffUser from '@/models/StaffUser';
import { bootstrapStaffUserSchema } from '@/schemas/intake/staff-auth.schema';

export async function POST(request: NextRequest) {
  try {
    const rateLimitError = await requireAdminRouteRateLimit(
      request,
      'staff-bootstrap'
    );

    if (rateLimitError) {
      return rateLimitError;
    }

    await connectToDatabase();
    const hasExistingStaffUsers = (await StaffUser.countDocuments().exec()) > 0;
    const hasConfiguredAdminApiKey = Boolean(env.ADMIN_API_KEY?.trim());
    const clientIp = getClientIp(request);
    const canBootstrapWithoutApiKey =
      !hasExistingStaffUsers &&
      env.NODE_ENV === 'development' &&
      !hasConfiguredAdminApiKey &&
      isLocalAdminIp(clientIp);

    if (canBootstrapWithoutApiKey) {
      const originError = requireTrustedAdminOrigin(request);

      if (originError) {
        return originError;
      }
    } else {
      const authError = requireAdminApiKey(request);

      if (authError) {
        return authError;
      }
    }

    const body = bootstrapStaffUserSchema.parse(await request.json());
    const existingUser = await StaffUser.findOne({
      email: body.email.toLowerCase(),
    }).exec();

    if (existingUser) {
      if (canBootstrapWithoutApiKey) {
        return errorResponse(
          'Bootstrap ist nur für die initiale Erstellung verfügbar',
          409
        );
      }

      existingUser.name = body.name;
      existingUser.role = body.role;
      existingUser.passwordHash = hashPassword(body.password);
      existingUser.isActive = true;
      await existingUser.save();

      await writeAdminAuditLog({
        request,
        authState: canBootstrapWithoutApiKey
          ? null
          : { via: 'api-key', staffUser: null },
        action: 'admin.staff.bootstrap.update',
        resourceType: 'staff-user',
        resourceId: String(existingUser.id ?? existingUser._id),
        required: true,
        metadata: {
          email: existingUser.email,
          role: existingUser.role,
          isActive: existingUser.isActive,
          bootstrapMode: canBootstrapWithoutApiKey
            ? 'development-local'
            : 'api-key',
        },
      });

      return successResponse(existingUser, 'Staff user updated successfully');
    }

    const createdUser = await StaffUser.create({
      name: body.name,
      email: body.email.toLowerCase(),
      passwordHash: hashPassword(body.password),
      role: body.role,
      isActive: true,
    });

    await writeAdminAuditLog({
      request,
      authState: canBootstrapWithoutApiKey
        ? null
        : { via: 'api-key', staffUser: null },
      action: 'admin.staff.bootstrap.create',
      resourceType: 'staff-user',
      resourceId: String(createdUser.id ?? createdUser._id),
      required: true,
      metadata: {
        email: createdUser.email,
        role: createdUser.role,
        isActive: createdUser.isActive,
        bootstrapMode: canBootstrapWithoutApiKey
          ? 'development-local'
          : 'api-key',
      },
    });

    return successResponse(createdUser, 'Staff user created successfully', 201);
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 11000
    ) {
      return errorResponse('Staff user already exists', 409);
    }

    return handleApiError(error);
  }
}
