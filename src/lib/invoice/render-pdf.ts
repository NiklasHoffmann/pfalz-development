import 'server-only';
import { existsSync } from 'node:fs';
import puppeteer, { type Browser } from 'puppeteer-core';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { INVOICE_DOCUMENT_CSS } from '@/lib/invoice/document-css';
import { INVOICE_FONT_FACE_CSS } from '@/lib/invoice/fonts';
import { INVOICE_BACKGROUND } from '@/lib/invoice/pdf-layout';
import {
  renderInvoiceBodyHtml,
  renderInvoicePageCss,
} from '@/lib/invoice/render-html';
import type { InvoiceViewModel } from '@/lib/invoice/view-model';

const CHROMIUM_CANDIDATES = [
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
];

function resolveChromiumPath(): string {
  const fromEnv = env.PUPPETEER_EXECUTABLE_PATH?.trim();

  if (fromEnv && existsSync(fromEnv)) {
    return fromEnv;
  }

  const detected = CHROMIUM_CANDIDATES.find((candidate) =>
    existsSync(candidate)
  );

  if (detected) {
    return detected;
  }

  if (fromEnv) {
    return fromEnv;
  }

  throw new Error('Kein Chromium gefunden. PUPPETEER_EXECUTABLE_PATH setzen.');
}

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (browserPromise) {
    const existing = await browserPromise.catch(() => null);

    if (existing?.connected) {
      return existing;
    }

    browserPromise = null;
  }

  browserPromise = puppeteer.launch({
    executablePath: resolveChromiumPath(),
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
      '--force-color-profile=srgb',
    ],
  });

  const browser = await browserPromise;
  browser.on('disconnected', () => {
    browserPromise = null;
  });

  return browser;
}

export interface InvoicePdfAssets {
  logoDataUri: string;
  qrDataUri: string | null;
  qrBadgeDataUri: string | null;
}

function buildDocumentHtml(
  invoice: InvoiceViewModel,
  assets: InvoicePdfAssets
): string {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<style>
  ${INVOICE_FONT_FACE_CSS}
  ${renderInvoicePageCss(invoice, { logoDataUri: assets.logoDataUri })}
  html, body { margin: 0; padding: 0; background: ${INVOICE_BACKGROUND}; }
  .inv-page { padding: 0 13mm; }
  ${INVOICE_DOCUMENT_CSS}
</style>
</head>
<body><div class="inv-page">${renderInvoiceBodyHtml(invoice, {
    qrSrc: assets.qrDataUri,
    qrBadgeSrc: assets.qrBadgeDataUri,
  })}</div></body>
</html>`;
}

export async function renderInvoicePdf(
  invoice: InvoiceViewModel,
  assets: InvoicePdfAssets
): Promise<Uint8Array<ArrayBuffer>> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(buildDocumentHtml(invoice, assets), {
      waitUntil: 'load',
    });
    await page.evaluateHandle('document.fonts.ready');

    // No `margin` option: the CSS `@page` margins (the running header/footer
    // bands) apply instead.
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
    });

    const bytes = new Uint8Array(pdf.byteLength);
    bytes.set(pdf);
    return bytes;
  } catch (error) {
    logger.error('Invoice PDF rendering failed', { error });
    throw error;
  } finally {
    await page.close().catch(() => {});
  }
}
