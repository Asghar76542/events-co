import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getAdminUsers, logAction } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  const decoded = verifyJWT(token);
  if (decoded) {
    logAction('logout', decoded.userId, 'User logged out');
  }

  // Clear the JWT cookie by setting it to empty with maxAge 0
  const response = NextResponse.json({ message: 'Logout successful' });
  response.cookies.set('authToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0
  });

  return response;
}