import { NextRequest } from 'next/server';
import {
  successResponse,
  errorResponse,
  handleApiError,
} from '@/lib/api-response';
import { rateLimit } from '@/lib/rate-limit';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { userSchema } from '@/schemas/user.schema';

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
    const rateLimitResult = rateLimit(ip);

    if (!rateLimitResult.success) {
      return errorResponse('Rate limit exceeded', 429);
    }

    await connectToDatabase();

    const users = await User.find({ isActive: true })
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(50);

    return successResponse(users, 'Users retrieved successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
    const rateLimitResult = rateLimit(ip);

    if (!rateLimitResult.success) {
      return errorResponse('Rate limit exceeded', 429);
    }

    await connectToDatabase();

    const body = await request.json();
    const validatedData = userSchema.parse(body);

    const user = await User.create(validatedData);

    return successResponse(user, 'User created successfully', 201);
  } catch (error) {
    return handleApiError(error);
  }
}
