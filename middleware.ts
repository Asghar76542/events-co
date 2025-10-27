import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from '@/lib/auth'

export default function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Check for JWT token authentication
    const token = request.cookies.get('authToken')?.value

    if (!token) {
      // Redirect to login page
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Verify JWT token
    const decoded = verifyJWT(token)
    if (!decoded) {
      // Redirect to login page if token is invalid/expired
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // For API routes, let them handle authentication
    if (request.nextUrl.pathname.startsWith('/api/admin') || request.nextUrl.pathname.startsWith('/api/auth')) {
      return NextResponse.next()
    }

    // Token is valid, allow access to admin pages
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
  runtime: 'nodejs'
}