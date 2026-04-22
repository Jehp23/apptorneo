import { NextResponse } from "next/server"
import { createAdminToken, createAdminSessionCookie } from "@/lib/admin-auth"

export async function POST(request: Request) {
  const body = await request.json()
  const password = String(body.password || "")

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
  }

  const token = createAdminToken()
  const response = NextResponse.json({ ok: true })
  response.cookies.set(createAdminSessionCookie(token))
  return response
}
