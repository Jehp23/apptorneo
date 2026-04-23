import { NextResponse } from "next/server"
import { createAdminLogoutCookie } from "@/lib/admin-auth"

export async function GET(request: Request) {
  const url = new URL("/admin/login", request.url)
  const response = NextResponse.redirect(url)
  response.cookies.set(createAdminLogoutCookie())
  return response
}

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(createAdminLogoutCookie())
  return response
}
