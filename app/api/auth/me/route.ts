import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getAdminUsers, createTestJWT } from '@/lib/auth';

// Test endpoint to create a JWT token for debugging
export async function POST(request: NextRequest) {
  const token = createTestJWT();
  console.log('Test JWT created');

  const response = NextResponse.json({ message: 'Test JWT created' });
  response.cookies.set('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60
  });

  return response;
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  console.log('Auth check - JWT token present:', !!token);

  if (!token) {
    console.log('Auth check - No JWT token found');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const decoded = verifyJWT(token);
  console.log('Auth check - JWT verified:', !!decoded);

  if (!decoded) {
    console.log('Auth check - Invalid or expired JWT token');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const users = getAdminUsers();
  const user = users.find(u => u.id === decoded.userId);
  console.log('Auth check - User found:', !!user, 'User ID:', decoded.userId);

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