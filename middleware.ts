import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isValidAdminToken } from "@/lib/admin-auth"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const isAuthRoute = pathname === "/admin/login" || pathname.startsWith("/api/admin/auth")
    if (isAuthRoute) {
      return NextResponse.next()
    }

    const token = request.cookies.get("admin_session")?.value
    if (!isValidAdminToken(token)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const url = request.nextUrl.clone()
      url.pathname = "/admin/login"
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
