import 'server-only';
import { existsSync } from 'node:fs';
import puppeteer, { type Browser } from 'puppeteer-core';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { INVOICE_DOCUMENT_CSS } from '@/lib/invoice/document-css';
import { INVOICE_FONT_FACE_CSS } from '@/lib/invoice/fonts';
import {
  INVOICE_BACKGROUND,
  PDF_HORIZONTAL_INSET,
  PDF_PAGE_MARGIN_BOTTOM,
  PDF_PAGE_MARGIN_TOP,
} from '@/lib/invoice/pdf-layout';
import {
  renderInvoiceBodyHtml,
  renderInvoiceFooterHtml,
  renderInvoiceHeaderHtml,
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

  // Nothing found on disk: fall back to the configured path so puppeteer can
  // surface a precise spawn error, otherwise fail with a clear hint.
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

function buildDocumentHtml(invoice: InvoiceViewModel): string {
  // Horizontal page margins are 0 in page.pdf() so this inset stays in sync
  // with the header/footer templates (which Puppeteer renders full-bleed).
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<style>
  ${INVOICE_FONT_FACE_CSS}
  html, body { margin: 0; padding: 0; background: ${INVOICE_BACKGROUND}; }
  .inv-page { padding: 0 ${PDF_HORIZONTAL_INSET}; }
  ${INVOICE_DOCUMENT_CSS}
</style>
</head>
<body><div class="inv-page">${renderInvoiceBodyHtml(invoice)}</div></body>
</html>`;
}

function wrapChromeTemplate(markup: string): string {
  // Puppeteer renders header/footer templates in an isolated document with a
  // default font-size of 0, so the font-face is repeated here and every size is
  // set explicitly inside the markup.
  return `<style>${INVOICE_FONT_FACE_CSS}</style><div style="width:100%;">${markup}</div>`;
}

export interface InvoicePdfAssets {
  logoDataUri: string;
  qrDataUri: string | null;
  qrBadgeDataUri: string | null;
}

export async function renderInvoicePdf(
  invoice: InvoiceViewModel,
  assets: InvoicePdfAssets
): Promise<Uint8Array<ArrayBuffer>> {
  const headerTemplate = wrapChromeTemplate(
    renderInvoiceHeaderHtml(invoice, {
      logoSrc: assets.logoDataUri,
      variant: 'pdf',
    })
  );
  const footerTemplate = wrapChromeTemplate(
    renderInvoiceFooterHtml(invoice, {
      qrSrc: assets.qrDataUri,
      qrBadgeSrc: assets.qrBadgeDataUri,
      variant: 'pdf',
    })
  );

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(buildDocumentHtml(invoice), { waitUntil: 'load' });
    await page.evaluateHandle('document.fonts.ready');

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      margin: {
        top: PDF_PAGE_MARGIN_TOP,
        bottom: PDF_PAGE_MARGIN_BOTTOM,
        left: '0',
        right: '0',
      },
    });

    // Copy into a plain ArrayBuffer-backed view so it satisfies `BodyInit`.
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
