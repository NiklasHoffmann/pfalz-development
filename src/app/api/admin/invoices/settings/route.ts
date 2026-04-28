import { NextRequest } from 'next/server';
import { handleApiError, successResponse } from '@/lib/api-response';
import {
  requireIntakeAdminAccess,
  requireIntakeAdminMutationAccess,
} from '@/lib/api-auth';
import { writeAdminAuditLog } from '@/lib/admin-audit';
import {
  getNextInvoiceNumberPreview,
  getOrCreateInvoiceSettings,
  resetInvoiceNumberingToPersistedState,
} from '@/lib/invoice-admin';
import connectToDatabase from '@/lib/mongodb';
import InvoiceSettings from '@/models/InvoiceSettings';
import { invoiceProfileSchema } from '@/schemas/invoice.schema';

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
    const settings = await getOrCreateInvoiceSettings();
    const nextInvoiceNumber = await getNextInvoiceNumberPreview();

    return successResponse(
      { settings, nextInvoiceNumber },
      'Invoice settings retrieved successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin', 'editor'],
      'intake-invoice-settings-update'
    );

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const body = invoiceProfileSchema.parse(await request.json());

    const settings = await InvoiceSettings.findOneAndUpdate(
      { scope: 'default' },
      {
        $set: {
          senderProfile: body.senderProfile,
          paymentProfile: body.paymentProfile,
          defaultNote: body.defaultNote,
        },
        $setOnInsert: {
          scope: 'default',
        },
      },
      { new: true, upsert: true }
    ).exec();

    await writeAdminAuditLog({
      request,
      authState,
      action: 'intake.invoice-settings.update',
      resourceType: 'invoice-settings',
      resourceId: String(settings.id ?? settings._id),
      required: true,
    });

    return successResponse(settings, 'Invoice settings updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin', 'editor'],
      'intake-invoice-numbering-reset'
    );

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const settings = await resetInvoiceNumberingToPersistedState();
    const nextInvoiceNumber = await getNextInvoiceNumberPreview();

    await writeAdminAuditLog({
      request,
      authState,
      action: 'intake.invoice-numbering.reset',
      resourceType: 'invoice-settings',
      resourceId: String(settings.id ?? settings._id),
      required: true,
      metadata: {
        nextInvoiceNumber,
      },
    });

    return successResponse(
      { settings, nextInvoiceNumber },
      'Invoice numbering reset successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
