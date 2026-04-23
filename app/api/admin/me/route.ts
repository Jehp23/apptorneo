import { NextRequest, NextResponse } from "next/server"
import { isValidAdminToken } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value
  if (!(await isValidAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return NextResponse.json({ ok: true })
}
