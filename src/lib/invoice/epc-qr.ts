import QRCode from 'qrcode';
import { compactIban } from '@/lib/iban';

export interface EpcQrInput {
  payee: string;
  iban: string;
  bic: string;
  invoiceNumber: string;
  amount: number;
}

/**
 * Builds an EPC QR (GiroCode) payload for a SEPA credit transfer. Returns an
 * empty string when the mandatory fields are missing so callers can skip
 * rendering a code.
 */
export function buildEpcQrPayload(input: EpcQrInput): string {
  const payee = input.payee.trim();
  const iban = compactIban(input.iban);

  if (!payee || !iban || !(input.amount > 0)) {
    return '';
  }

  const amountValue = (
    Number.isFinite(input.amount) ? input.amount : 0
  ).toFixed(2);
  const remittance = `Rechnung ${input.invoiceNumber}`.trim().slice(0, 140);

  return [
    'BCD',
    '002',
    '1',
    'SCT',
    input.bic.trim().toUpperCase(),
    payee.slice(0, 70),
    iban,
    `EUR${amountValue}`,
    '',
    '',
    remittance,
    '',
  ].join('\n');
}

/**
 * Renders an EPC QR payload to a PNG data URL. Returns null for an empty
 * payload. Works in the browser and in Node. Uses high error correction so the
 * centred logo badge does not break scannability.
 */
export async function renderEpcQrDataUrl(
  payload: string
): Promise<string | null> {
  if (!payload) {
    return null;
  }

  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 360,
    color: {
      dark: '#1c1917',
      light: '#ffffff',
    },
  });
}
