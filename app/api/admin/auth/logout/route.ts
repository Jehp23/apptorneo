import { NextResponse } from "next/server"
import { createAdminSessionCookie } from "@/lib/admin-auth"

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(createAdminSessionCookie("", true))
  return response
}
