import { INVOICE_DOCUMENT_CSS } from '@/lib/invoice/document-css';
import {
  renderInvoiceBodyHtml,
  renderInvoicePreviewFooterHtml,
  renderInvoicePreviewHeaderHtml,
} from '@/lib/invoice/render-html';
import type { InvoiceViewModel } from '@/lib/invoice/view-model';

interface InvoicePreviewProps {
  invoice: InvoiceViewModel;
  qrDataUrl: string | null;
  /** Public path or data URL of the logo shown in the running header. */
  logoSrc: string;
}

/**
 * On-screen approximation of the generated PDF. The real running header/footer
 * are `@page` margin boxes that only exist when printing, so here they are
 * faked as plain bars around the same document body the PDF uses.
 */
export function InvoicePreview({
  invoice,
  qrDataUrl,
  logoSrc,
}: InvoicePreviewProps): React.JSX.Element {
  const markup =
    renderInvoicePreviewHeaderHtml(invoice, { logoSrc }) +
    renderInvoiceBodyHtml(invoice, {
      qrSrc: qrDataUrl,
      qrBadgeSrc: '/invoice-qr-badge.webp',
    }) +
    renderInvoicePreviewFooterHtml(invoice);

  return (
    <div className="mx-auto w-full max-w-[210mm] overflow-hidden rounded-2xl border border-[#e0d5c3] bg-[#fcfbf7] shadow-sm">
      <style dangerouslySetInnerHTML={{ __html: INVOICE_DOCUMENT_CSS }} />
      <div
        className="p-6 sm:p-9"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </div>
  );
}
