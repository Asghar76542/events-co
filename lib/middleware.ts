import { NextRequest } from 'next/server';
import { verifyJWT } from './auth';

export function requireAuth(request: NextRequest): { userId: number } | { error: string; status: number } {
  const token = request.cookies.get('authToken')?.value;

  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return { error: 'Unauthorized', status: 401 };
  }

  return { userId: decoded.userId };
}