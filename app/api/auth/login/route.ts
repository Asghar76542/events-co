import { NextRequest, NextResponse } from 'next/server';
import { getAdminUsers, verifyPassword, createJWT, logAction } from '@/lib/auth';

export async function POST(request: NextRequest) {
  let requestBody: any = null;
  let username = '';
  let password = '';

  try {
    // Enhanced JSON parsing for Next.js 15 compatibility
    console.log('Login attempt started');

    // Try to read request body as text first, then parse JSON manually
    // This avoids the body consumption issue in Next.js 15
    let textBody: string;
    try {
      textBody = await request.text();
      console.log('Raw request body length:', textBody.length);
    } catch (textError) {
      console.error('Failed to read request body:', textError);
      return NextResponse.json({
        error: 'Failed to read request body'
      }, { status: 400 });
    }

    if (!textBody || textBody.trim() === '') {
      return NextResponse.json({
        error: 'Empty request body'
      }, { status: 400 });
    }

    // Parse JSON manually
    try {
      requestBody = JSON.parse(textBody);
      console.log('JSON parsed successfully');
    } catch (jsonError) {
      console.error('JSON parsing failed:', jsonError);
      return NextResponse.json({
        error: 'Invalid JSON in request body',
        details: 'Request body is not valid JSON',
        debug: {
          jsonError: jsonError instanceof Error ? jsonError.message : String(jsonError),
          bodyLength: textBody.length,
          bodyPreview: textBody.substring(0, 100)
        }
      }, { status: 400 });
    }

    // Extract and validate credentials
    username = requestBody?.username;
    password = requestBody?.password;

    console.log('Credentials extracted:', { username: username, hasPassword: !!password });

    if (!username || !password) {
      console.log('Missing credentials');
      return NextResponse.json({
        error: 'Username and password are required'
      }, { status: 400 });
    }

    // Validate input types
    if (typeof username !== 'string' || typeof password !== 'string') {
      console.log('Invalid credential types');
      return NextResponse.json({
        error: 'Username and password must be strings'
      }, { status: 400 });
    }

    // Get admin users and find the user
    console.log('Loading admin users...');
    const users = getAdminUsers();

    if (!Array.isArray(users) || users.length === 0) {
      console.error('No admin users found');
      return NextResponse.json({
        error: 'No admin users configured'
      }, { status: 500 });
    }

    const user = users.find(u => u.username === username);
    console.log('User lookup result:', !!user);

    if (!user) {
      console.log('User not found:', username);
      return NextResponse.json({
        error: 'Invalid credentials'
      }, { status: 401 });
    }

    // Verify password
    console.log('Verifying password...');
    const isValidPassword = await verifyPassword(password, user.password);
    console.log('Password verification result:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password for user:', username);
      return NextResponse.json({
        error: 'Invalid credentials'
      }, { status: 401 });
    }

    // Create JWT token
    console.log('Creating JWT token...');
    const token = createJWT(user.id);

    if (!token) {
      console.error('Failed to create JWT token');
      return NextResponse.json({
        error: 'Failed to create authentication token'
      }, { status: 500 });
    }

    console.log('JWT token created successfully');

    // Log the login action
    try {
      logAction('login', user.id, `User ${username} logged in successfully`);
    } catch (logError) {
      console.error('Failed to log action:', logError);
      // Don't fail the login if logging fails
    }

    // Create response with cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

    // Set secure JWT cookie
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    console.log('Login successful for user:', username);
    return response;

  } catch (error) {
    console.error('Unexpected error in login endpoint:', error);

    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error occurred',
      debug: {
        username: username,
        hasRequestBody: !!requestBody,
        requestBodyType: typeof requestBody,
        errorType: error?.constructor?.name
      }
    }, { status: 500 });
  }
}