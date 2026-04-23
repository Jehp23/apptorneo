import { NextResponse } from "next/server"
import { createAdminSessionCookie } from "@/lib/admin-auth"

export async function POST(request: Request) {
  const body = await request.json()
  const password = String(body.password || "")
  const adminPassword = process.env.ADMIN_PASSWORD ?? ""

  if (!adminPassword || password !== adminPassword) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(createAdminSessionCookie(password))
  return response
}
