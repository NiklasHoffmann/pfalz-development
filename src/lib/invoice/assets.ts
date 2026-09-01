import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const dataUriCache = new Map<string, Promise<string>>();

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

/**
 * Optimised assets read from `public/` and cached as data URIs, so they can be
 * inlined into the PDF (where `<img src="/...">` has no origin to resolve).
 */
export function getInvoiceLogoDataUri(): Promise<string> {
  return readPublicDataUri('invoice-logo.webp', 'image/webp');
}

export function getInvoiceQrBadgeDataUri(): Promise<string> {
  return readPublicDataUri('invoice-qr-badge.webp', 'image/webp');
}
