import { NextResponse } from 'next/server';

function stringifyCsvValue(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }

  if (Array.isArray(value)) {
    return value.join(' | ');
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

function escapeCsvCell(value: unknown, delimiter: string) {
  const normalized = stringifyCsvValue(value).replace(/\r?\n/g, ' ');
  const escaped = normalized.replace(/"/g, '""');
  return `"${escaped.replace(new RegExp(delimiter, 'g'), delimiter)}"`;
}

export function buildCsvString(
  headers: string[],
  rows: Array<Record<string, unknown>>,
  delimiter: string = ';'
) {
  const headerLine = headers
    .map((header) => escapeCsvCell(header, delimiter))
    .join(delimiter);
  const dataLines = rows.map((row) =>
    headers
      .map((header) => escapeCsvCell(row[header], delimiter))
      .join(delimiter)
  );

  return ['\uFEFF' + headerLine, ...dataLines].join('\n');
}

export function createCsvDownloadResponse(
  filename: string,
  csvContent: string
) {
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
