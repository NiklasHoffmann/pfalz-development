import { NextRequest } from 'next/server';
import {
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-response';
import {
  requireIntakeAdminAccess,
  requireIntakeAdminMutationAccess,
} from '@/lib/api-auth';
import { writeAdminAuditLog } from '@/lib/admin-audit';
import {
  calculateInvoiceTotals,
  ensureUniqueInvoiceNumber,
  getNextInvoiceNumberPreview,
  normalizeInvoiceDates,
  reserveNextInvoiceNumber,
  syncInvoiceNumbering,
} from '@/lib/invoice-admin';
import connectToDatabase from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { invoiceUpsertSchema } from '@/schemas/invoice.schema';

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

    const invoices = await Invoice.find({})
      .sort({ invoiceDate: -1, createdAt: -1 })
      .exec();
    const nextInvoiceNumber = await getNextInvoiceNumberPreview();

    return successResponse(
      { invoices, nextInvoiceNumber },
      'Invoices retrieved successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin', 'editor'],
      'intake-invoice-create'
    );

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const body = invoiceUpsertSchema.parse(await request.json());
    const invoiceNumber =
      body.invoiceNumber?.trim() || (await reserveNextInvoiceNumber());

    const isUnique = await ensureUniqueInvoiceNumber(invoiceNumber);

    if (!isUnique) {
      return errorResponse('Rechnungsnummer existiert bereits', 409);
    }

    const { invoiceDate, dueDate } = normalizeInvoiceDates(
      body.invoiceDate,
      body.dueDate
    );
    const totals = calculateInvoiceTotals(body.lineItems);

    const createdInvoice = await Invoice.create({
      invoiceNumber,
      status: body.status,
      invoiceDate,
      dueDate,
      servicePeriod: body.servicePeriod,
      project: body.project,
      senderProfile: body.senderProfile,
      recipient: body.recipient,
      paymentProfile: body.paymentProfile,
      note: body.note,
      lineItems: totals.lineItems,
      subtotal: totals.subtotal,
      total: totals.total,
      createdBy:
        authState.via === 'session'
          ? String(authState.staffUser?.id ?? authState.staffUser?._id ?? '')
          : undefined,
      updatedBy:
        authState.via === 'session'
          ? String(authState.staffUser?.id ?? authState.staffUser?._id ?? '')
          : undefined,
    });

    await syncInvoiceNumbering(invoiceNumber);

    await writeAdminAuditLog({
      request,
      authState,
      action: 'intake.invoice.create',
      resourceType: 'invoice',
      resourceId: String(createdInvoice.id ?? createdInvoice._id),
      required: true,
      metadata: {
        invoiceNumber,
        status: createdInvoice.status,
      },
    });

    return successResponse(createdInvoice, 'Invoice created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
