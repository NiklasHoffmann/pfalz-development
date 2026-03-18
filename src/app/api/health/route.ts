import { NextResponse } from 'next/server';
import { successResponse } from '@/lib/api-response';
import connectToDatabase from '@/lib/mongodb';

export async function GET() {
  try {
    // Check database connection
    await connectToDatabase();

    return successResponse(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
      },
      'System is healthy'
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
