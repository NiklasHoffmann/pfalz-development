import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logger } from './logger';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Success response wrapper
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * Error response wrapper
 */
export function errorResponse(
  error: string,
  status: number = 400
): NextResponse<ApiResponse> {
  logger.error(`API Error: ${error}`);

  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

/**
 * Handle API errors with proper logging
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  logger.error('API Error:', error);

  // Zod validation error
  if (error instanceof ZodError) {
    return errorResponse('Validation error', 400);
  }

  // MongoDB duplicate key error
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 11000
  ) {
    return errorResponse('Duplicate entry found', 409);
  }

  // Generic error
  if (error instanceof Error) {
    return errorResponse('Internal server error', 500);
  }

  return errorResponse('An unknown error occurred', 500);
}
