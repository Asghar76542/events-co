import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Check for authentication
    const sessionId = request.cookies.get('sessionId')?.value

    if (!sessionId) {
      // Redirect to login page
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // For API routes, let them handle authentication
    if (request.nextUrl.pathname.startsWith('/api/admin') || request.nextUrl.pathname.startsWith('/api/auth')) {
      return NextResponse.next()
    }

    // For admin pages, check session validity
    // In a real app, you'd verify the session is still valid here
    // For now, we'll let the API handle this
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
}