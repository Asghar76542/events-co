import { NextRequest, NextResponse } from 'next/server';
import { getSession, getAdminUsers, createTestSession } from '@/lib/auth';

// Test endpoint to create a session for debugging
export async function POST(request: NextRequest) {
  const sessionId = createTestSession();
  console.log('Test session created:', sessionId);

  const response = NextResponse.json({ message: 'Test session created', sessionId });
  response.cookies.set('sessionId', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60
  });

  return response;
}

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('sessionId')?.value;
  console.log('Auth check - Session ID:', sessionId);

  if (!sessionId) {
    console.log('Auth check - No session ID found');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const session = getSession(sessionId);
  console.log('Auth check - Session found:', !!session);

  if (!session) {
    console.log('Auth check - Invalid or expired session');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const users = getAdminUsers();
  const user = users.find(u => u.id === session.userId);
  console.log('Auth check - User found:', !!user, 'User ID:', session.userId);

  if (!user) {
    console.log('Auth check - User not found in database');
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  console.log('Auth check - Authentication successful for user:', user.username);
  return NextResponse.json({
    id: user.id,
    username: user.username,
    role: user.role
  });
}