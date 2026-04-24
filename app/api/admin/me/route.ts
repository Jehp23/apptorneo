import { NextRequest, NextResponse } from "next/server"
import { hasAdminSession, unauthorizedAdminResponse } from "@/lib/admin-auth"

export async function GET(_request: NextRequest) {
  if (!(await hasAdminSession())) {
    return unauthorizedAdminResponse()
  }
  return NextResponse.json({ ok: true })
}
