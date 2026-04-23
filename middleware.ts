import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isValidAdminToken } from "@/lib/admin-auth"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/admin")) {
    if (pathname.startsWith("/api/admin/auth")) {
      return NextResponse.next()
    }

    const token = request.cookies.get("admin_session")?.value
    if (!isValidAdminToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/admin/:path*"],
}
