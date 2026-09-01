/**
 * Display formatting for invoice values. Shared by the live editor preview and
 * the server-rendered PDF so both show identical numbers and dates.
 */

export function formatInvoiceAmount(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;

  return safeValue.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatInvoiceDate(value?: string | null): string {
  if (!value) {
    return '-';
  }

  const [year, month, day] = value.split('-');

  if (year && month && day) {
    return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleDateString('de-DE');
}
