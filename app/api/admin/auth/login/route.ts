import { NextResponse } from "next/server"
import { createAdminSessionCookie, generateAdminToken, isValidAdminPassword } from "@/lib/admin-auth"

export async function POST(request: Request) {
  const body = await request.json()
  const password = String(body.password || "")

  if (!isValidAdminPassword(password)) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
  }

  const token = generateAdminToken()
  const response = NextResponse.json({ ok: true })
  response.cookies.set(createAdminSessionCookie(token))
  return response
}
