import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuth } from 'next-auth/middleware'

// This middleware does nothing except pass through all requests
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// Protect only the upload page and upload API
export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token
  }
})

// Empty matcher means it won't run on any routes
export const config = {
  matcher: [
    '/admin/upload',
    '/api/upload'
  ]
} 