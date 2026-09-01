import { INVOICE_DOCUMENT_CSS } from '@/lib/invoice/document-css';
import {
  renderInvoiceBodyHtml,
  renderInvoiceFooterHtml,
  renderInvoiceHeaderHtml,
} from '@/lib/invoice/render-html';
import type { InvoiceViewModel } from '@/lib/invoice/view-model';

interface InvoicePreviewProps {
  invoice: InvoiceViewModel;
  qrDataUrl: string | null;
  /** Public path or data URL of the logo shown in the running header. */
  logoSrc: string;
}

/**
 * On-screen approximation of the generated PDF. The running header/footer live
 * in the PDF page margins; here they are stacked above and below the document
 * body so the whole layout can be reviewed while editing. Uses the exact same
 * HTML builders as the PDF.
 */
export function InvoicePreview({
  invoice,
  qrDataUrl,
  logoSrc,
}: InvoicePreviewProps): React.JSX.Element {
  const markup =
    renderInvoiceHeaderHtml(invoice, { logoSrc, variant: 'preview' }) +
    renderInvoiceBodyHtml(invoice) +
    renderInvoiceFooterHtml(invoice, {
      qrSrc: qrDataUrl,
      qrBadgeSrc: '/invoice-qr-badge.webp',
      variant: 'preview',
    });

  return (
    <div className="mx-auto w-full max-w-[210mm] overflow-hidden rounded-2xl border border-[#e0d5c3] bg-[#fcfbf7] shadow-sm">
      <style dangerouslySetInnerHTML={{ __html: INVOICE_DOCUMENT_CSS }} />
      <div
        className="flex flex-col gap-4 p-6 sm:p-9"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </div>
  );
}
