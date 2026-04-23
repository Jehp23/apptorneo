import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isValidAdminToken } from "@/lib/admin-auth"

const WRITE_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"])

const PUBLIC_WRITE_PREFIXES = [
  "/api/tournaments",
  "/api/disciplines",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteger /api/admin/* excepto /api/admin/auth
  if (pathname.startsWith("/api/admin")) {
    if (pathname.startsWith("/api/admin/auth")) {
      return NextResponse.next()
    }
    const token = request.cookies.get("admin_session")?.value
    if (!isValidAdminToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Proteger métodos de escritura en rutas públicas de la API
  if (WRITE_METHODS.has(request.method)) {
    const isPublicWriteRoute = PUBLIC_WRITE_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    )
    if (isPublicWriteRoute) {
      const token = request.cookies.get("admin_session")?.value
      if (!isValidAdminToken(token)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/api/admin/:path*",
    "/api/tournaments",
    "/api/tournaments/:path*",
    "/api/disciplines",
    "/api/disciplines/:path*",
  ],
}
