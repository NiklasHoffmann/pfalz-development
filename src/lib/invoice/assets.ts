import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const dataUriCache = new Map<string, Promise<string>>();

/**
 * Reads a `public/` image once and caches it as a data URI, so it can be
 * inlined into the PDF (`@page` margin boxes / QR block) where `<img src="/...">`
 * has no origin to resolve against.
 *
 * The invoice logo is pre-sized to ~34mm at 96dpi, because `@page` margin boxes
 * take images via `content: url()` and render them at intrinsic pixel size with
 * no way to scale.
 */
function readPublicDataUri(
  fileName: string,
  mimeType: string
): Promise<string> {
  const cached = dataUriCache.get(fileName);

  if (cached) {
    return cached;
  }

  const promise = readFile(path.join(process.cwd(), 'public', fileName))
    .then((buffer) => `data:${mimeType};base64,${buffer.toString('base64')}`)
    .catch((error: unknown) => {
      dataUriCache.delete(fileName);
      throw error;
    });

  dataUriCache.set(fileName, promise);
  return promise;
}

export function getInvoiceLogoDataUri(): Promise<string> {
  return readPublicDataUri('invoice-logo.webp', 'image/webp');
}

/** Small logo badge shown in the centre of the payment QR code. */
export function getInvoiceQrBadgeDataUri(): Promise<string> {
  return readPublicDataUri('invoice-qr-badge.webp', 'image/webp');
}
