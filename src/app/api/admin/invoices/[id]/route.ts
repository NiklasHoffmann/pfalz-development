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
  normalizeInvoiceDates,
  normalizeInvoiceNoteText,
  syncInvoiceNumbering,
} from '@/lib/invoice-admin';
import connectToDatabase from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { invoiceUpsertSchema } from '@/schemas/invoice.schema';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const authState = await requireIntakeAdminAccess(request, [
      'admin',
      'editor',
    ]);

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const { id } = await context.params;
    const invoice = await Invoice.findById(id).exec();

    if (!invoice) {
      return errorResponse('Rechnung nicht gefunden', 404);
    }

    const normalizedNote = normalizeInvoiceNoteText(invoice.note);

    if (normalizedNote !== invoice.note) {
      invoice.note = normalizedNote;
      await invoice.save();
    }

    return successResponse(invoice, 'Invoice retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const authState = await requireIntakeAdminMutationAccess(
      request,
      ['admin', 'editor'],
      'intake-invoice-update'
    );

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();
    const { id } = await context.params;
    const body = invoiceUpsertSchema.parse(await request.json());
    const invoice = await Invoice.findById(id).exec();

    if (!invoice) {
      return errorResponse('Rechnung nicht gefunden', 404);
    }

    const invoiceNumber = body.invoiceNumber?.trim() || invoice.invoiceNumber;
    const isUnique = await ensureUniqueInvoiceNumber(invoiceNumber, id);

    if (!isUnique) {
      return errorResponse('Rechnungsnummer existiert bereits', 409);
    }

    const { invoiceDate, dueDate } = normalizeInvoiceDates(
      body.invoiceDate,
      body.dueDate
    );
    const totals = calculateInvoiceTotals(body.lineItems);

    invoice.invoiceNumber = invoiceNumber;
    invoice.status = body.status;
    invoice.invoiceDate = invoiceDate;
    invoice.dueDate = dueDate;
    invoice.servicePeriod = body.servicePeriod;
    invoice.project = body.project;
    invoice.senderProfile = body.senderProfile;
    invoice.recipient = body.recipient;
    invoice.paymentProfile = body.paymentProfile;
    invoice.note = body.note;
    invoice.lineItems = totals.lineItems;
    invoice.subtotal = totals.subtotal;
    invoice.total = totals.total;
    invoice.updatedBy =
      authState.via === 'session'
        ? String(authState.staffUser?.id ?? authState.staffUser?._id ?? '')
        : invoice.updatedBy;

    await invoice.save();
    await syncInvoiceNumbering(invoiceNumber);

    await writeAdminAuditLog({
      request,
      authState,
      action: 'intake.invoice.update',
      resourceType: 'invoice',
      resourceId: String(invoice.id ?? invoice._id),
      required: true,
      metadata: {
        invoiceNumber,
        status: invoice.status,
      },
    });

    return successResponse(invoice, 'Invoice updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
