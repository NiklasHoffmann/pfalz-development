import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  PDF_LOGO_HEIGHT_MM,
  PDF_LOGO_WIDTH_MM,
} from '@/lib/invoice/pdf-layout';

const dataUriCache = new Map<string, Promise<string>>();

async function readPublicBase64(fileName: string): Promise<string> {
  const buffer = await readFile(path.join(process.cwd(), 'public', fileName));
  return buffer.toString('base64');
}

function cached(key: string, load: () => Promise<string>): Promise<string> {
  const existing = dataUriCache.get(key);

  if (existing) {
    return existing;
  }

  const promise = load().catch((error: unknown) => {
    dataUriCache.delete(key);
    throw error;
  });

  dataUriCache.set(key, promise);
  return promise;
}

/**
 * The header logo, wrapped in an SVG sized in millimetres. `@page` margin boxes
 * take images via `content: url()` but render them at intrinsic pixel size with
 * no way to scale, so the SVG wrapper pins the physical size while keeping the
 * raster crisp.
 */
export function getInvoiceLogoSvgDataUri(): Promise<string> {
  return cached('logo-svg', async () => {
    const raster = await readPublicBase64('invoice-logo.webp');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PDF_LOGO_WIDTH_MM}mm" height="${PDF_LOGO_HEIGHT_MM}mm" viewBox="0 0 360 202"><image href="data:image/webp;base64,${raster}" width="360" height="202"/></svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  });
}

/** Small logo badge shown in the centre of the payment QR code. */
export function getInvoiceQrBadgeDataUri(): Promise<string> {
  return cached('qr-badge', async () => {
    const raster = await readPublicBase64('invoice-qr-badge.webp');
    return `data:image/webp;base64,${raster}`;
  });
}
