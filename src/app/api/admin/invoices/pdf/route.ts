import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { errorResponse, handleApiError } from '@/lib/api-response';
import { requireIntakeAdminAccess } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { invoiceUpsertSchema } from '@/schemas/invoice.schema';
import {
  toInvoiceViewModel,
  type InvoiceViewModel,
} from '@/lib/invoice/view-model';
import { buildEpcQrPayload, renderEpcQrDataUrl } from '@/lib/invoice/epc-qr';
import {
  getInvoiceLogoSvgDataUri,
  getInvoiceQrBadgeDataUri,
} from '@/lib/invoice/assets';
import { renderInvoicePdf } from '@/lib/invoice/render-pdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function pdfFilename(invoiceNumber: string): string {
  const safe = invoiceNumber.replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '');
  return `Rechnung-${safe || 'Entwurf'}.pdf`;
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const authState = await requireIntakeAdminAccess(request, [
      'admin',
      'editor',
    ]);

    if ('status' in authState) {
      return authState;
    }

    let invoice: InvoiceViewModel;

    try {
      invoice = toInvoiceViewModel(
        invoiceUpsertSchema.parse(await request.json())
      );
    } catch (error) {
      if (error instanceof ZodError) {
        return errorResponse(
          'Die Rechnungsdaten sind unvollständig. Bitte alle Positionen ausfüllen.',
          400
        );
      }

      throw error;
    }

    const [qrDataUri, logoDataUri, qrBadgeDataUri] = await Promise.all([
      renderEpcQrDataUrl(
        buildEpcQrPayload({
          payee: invoice.payment.payee,
          iban: invoice.payment.iban,
          bic: invoice.payment.bic,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.totalAmount,
        })
      ),
      getInvoiceLogoSvgDataUri(),
      getInvoiceQrBadgeDataUri().catch(() => null),
    ]);

    let pdf: Uint8Array<ArrayBuffer>;

    try {
      pdf = await renderInvoicePdf(invoice, {
        logoDataUri,
        qrDataUri,
        qrBadgeDataUri,
      });
    } catch (error) {
      logger.error('Invoice PDF request failed', { error });
      return errorResponse(
        'PDF konnte nicht erzeugt werden. Chromium-Konfiguration prüfen (PUPPETEER_EXECUTABLE_PATH).',
        500
      );
    }

    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pdfFilename(invoice.invoiceNumber)}"`,
        'Content-Length': String(pdf.byteLength),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
