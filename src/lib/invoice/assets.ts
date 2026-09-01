import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

let logoDataUriPromise: Promise<string> | null = null;

/**
 * Reads the optimised invoice logo from `public/` once and caches it as a data
 * URI, so it can be inlined into the PDF (where `<img src="/...">` has no origin
 * to resolve against).
 */
export function getInvoiceLogoDataUri(): Promise<string> {
  if (!logoDataUriPromise) {
    logoDataUriPromise = readFile(
      path.join(process.cwd(), 'public', 'invoice-logo.webp')
    )
      .then((buffer) => `data:image/webp;base64,${buffer.toString('base64')}`)
      .catch((error: unknown) => {
        logoDataUriPromise = null;
        throw error;
      });
  }

  return logoDataUriPromise;
}
