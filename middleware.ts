import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Redirect if they're not an admin
    if (req.nextUrl.pathname.startsWith("/admin") && 
        req.nextauth.token?.role !== "admin") {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ["/admin/:path*"]
} 