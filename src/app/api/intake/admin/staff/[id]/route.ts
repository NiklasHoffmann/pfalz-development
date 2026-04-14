import { Types } from 'mongoose';
import { NextRequest } from 'next/server';
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response';
import { writeAdminAuditLog } from '@/lib/admin-audit';
import { requireIntakeAdminMutationAccess } from '@/lib/api-auth';
import { hashPassword } from '@/lib/auth/password';
import connectToDatabase from '@/lib/mongodb';
import StaffUser from '@/models/StaffUser';
import { updateStaffUserSchema } from '@/schemas/intake/staff-auth.schema';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function ensureAnotherActiveAdminExists(staffUserId: string) {
  const otherActiveAdminCount = await StaffUser.countDocuments({
    _id: { $ne: new Types.ObjectId(staffUserId) },
    role: 'admin',
    isActive: true,
  }).exec();

  return otherActiveAdminCount > 0;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin'],
      'intake-staff-update'
    );

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const { id } = await context.params;
    const body = updateStaffUserSchema.parse(await request.json());
    const staffUser = await StaffUser.findById(id).exec();

    if (!staffUser) {
      return errorResponse('Staff user not found', 404);
    }

    const changingAwayFromAdmin =
      body.role !== undefined && body.role !== 'admin';
    const deactivatingUser = body.isActive !== undefined && !body.isActive;
    const wouldRemoveAdminAccess =
      staffUser.role === 'admin' &&
      staffUser.isActive &&
      (changingAwayFromAdmin || deactivatingUser);

    if (wouldRemoveAdminAccess) {
      const hasAnotherActiveAdmin = await ensureAnotherActiveAdminExists(
        String(staffUser.id ?? staffUser._id)
      );

      if (!hasAnotherActiveAdmin) {
        return errorResponse('At least one active admin user must remain', 409);
      }
    }

    if (
      authState.via === 'session' &&
      authState.staffUser &&
      String(authState.staffUser.id ?? authState.staffUser._id) ===
        String(staffUser.id ?? staffUser._id) &&
      (deactivatingUser || changingAwayFromAdmin)
    ) {
      return errorResponse('You cannot remove your own admin access', 409);
    }

    if (body.name !== undefined) {
      staffUser.name = body.name;
    }

    if (body.role !== undefined) {
      staffUser.role = body.role;
    }

    if (body.isActive !== undefined) {
      staffUser.isActive = body.isActive;
    }

    if (body.password !== undefined) {
      staffUser.passwordHash = hashPassword(body.password);
    }

    await staffUser.save();

    await writeAdminAuditLog({
      request,
      authState,
      action: 'intake.staff.update',
      resourceType: 'staff-user',
      resourceId: String(staffUser.id ?? staffUser._id),
      metadata: {
        name: body.name,
        role: body.role,
        isActive: body.isActive,
        passwordUpdated: body.password !== undefined,
      },
    });

    return successResponse(staffUser, 'Staff user updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
