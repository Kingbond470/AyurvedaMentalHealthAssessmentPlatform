import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect UI routes, not API routes
  if (pathname.startsWith('/admin') && !pathname.startsWith('/api/admin') && pathname !== '/admin/login') {
    const adminSession = request.cookies.get('admin_session')

    if (!adminSession?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
