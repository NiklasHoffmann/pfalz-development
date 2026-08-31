import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-response';
import { requireIntakeAdminAccess } from '@/lib/api-auth';
import connectToDatabase from '@/lib/mongodb';
import TimeEntry from '@/models/TimeEntry';

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('de-DE');
}

function formatDateTime(date: Date | null | undefined): string {
  if (!date) return '';
  return new Date(date).toLocaleString('de-DE');
}

function escapeCsv(value: string | null | undefined): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  try {
    const authState = await requireIntakeAdminAccess(request, [
      'admin',
      'editor',
    ]);

    if ('status' in authState) {
      return authState;
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const staffUserId = searchParams.get('staffUserId');
    const projectId = searchParams.get('projectId');
    const activityTypeId = searchParams.get('activityTypeId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const filter: Record<string, unknown> = { isRunning: false };

    if (staffUserId) filter.staffUserId = staffUserId;
    if (projectId) filter.projectId = projectId;
    if (activityTypeId) filter.activityTypeId = activityTypeId;

    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to) dateFilter.$lte = new Date(to);
      filter.date = dateFilter;
    }

    const entries = await TimeEntry.find(filter)
      .sort({ date: -1, startTime: -1 })
      .exec();

    const headers = [
      'Datum',
      'Mitarbeiter',
      'Projekt',
      'Tätigkeitsart',
      'Beschreibung',
      'Startzeit',
      'Endzeit',
      'Dauer (h:mm)',
      'Abrechenbar',
    ];

    const rows = entries.map((entry) => [
      escapeCsv(formatDate(entry.date)),
      escapeCsv(entry.staffUserName),
      escapeCsv(entry.projectName),
      escapeCsv(entry.activityTypeName),
      escapeCsv(entry.description),
      escapeCsv(formatDateTime(entry.startTime)),
      escapeCsv(formatDateTime(entry.endTime)),
      escapeCsv(formatMinutes(entry.durationMinutes)),
      entry.isBillable ? 'Ja' : 'Nein',
    ]);

    const csvContent =
      '﻿' + // BOM for Excel UTF-8
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    const filename = `zeiterfassung-export-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
