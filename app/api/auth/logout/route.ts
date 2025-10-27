import { NextRequest, NextResponse } from 'next/server';
import { getSession, deleteSession, logAction } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get('sessionId')?.value;

  if (!sessionId) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const session = getSession(sessionId);
  if (session) {
    logAction('logout', session.userId, 'User logged out');
  }

  deleteSession(sessionId);

  const response = NextResponse.json({ message: 'Logout successful' });
  response.cookies.set('sessionId', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  });

  return response;
}