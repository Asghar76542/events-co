import { NextRequest } from 'next/server';
import { getSession } from './auth';

export function requireAuth(request: NextRequest): { userId: number } | { error: string; status: number } {
  const sessionId = request.cookies.get('sessionId')?.value;

  if (!sessionId) {
    return { error: 'Unauthorized', status: 401 };
  }

  const session = getSession(sessionId);
  if (!session) {
    return { error: 'Unauthorized', status: 401 };
  }

  return { userId: session.userId };
}