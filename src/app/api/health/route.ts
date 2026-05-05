import { NextResponse } from 'next/server';
import { successResponse } from '@/lib/api-response';
import connectToDatabase from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();

    return successResponse({ status: 'ok' }, 'Service is healthy');
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Service unavailable',
      },
      { status: 503 }
    );
  }
}
