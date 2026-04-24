import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const COOKIE_NAME = "admin_session"

async function computeExpectedToken(): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return null
  const encoder = new TextEncoder()
  const data = encoder.encode(`admin:${password}`)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const cookieValue = request.cookies.get(COOKIE_NAME)?.value
    const expected = await computeExpectedToken()

    if (!expected || cookieValue !== expected) {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("next", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
