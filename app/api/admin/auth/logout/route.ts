import { NextResponse } from "next/server"
import { createAdminLogoutCookie } from "@/lib/admin-auth"

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 })
}

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(createAdminLogoutCookie())
  return response
}
