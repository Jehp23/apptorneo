import { NextResponse } from "next/server"
import { hasAdminSession, unauthorizedAdminResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export interface Scorer { name: string; goals: number }

function parseScorers(details: string | null): Scorer[] {
  if (!details) return []
  try {
    const parsed = JSON.parse(details)
    if (parsed?.scorers && Array.isArray(parsed.scorers)) return parsed.scorers
  } catch {}
  return []
}

function serializeScorers(existing: string | null, scorers: Scorer[]): string {
  try {
    const parsed = existing ? JSON.parse(existing) : {}
    return JSON.stringify({ ...parsed, scorers })
  } catch {
    return JSON.stringify({ scorers })
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const discipline = await prisma.discipline.findUnique({ where: { slug }, select: { details: true } })
  if (!discipline) return NextResponse.json({ error: "No encontrada" }, { status: 404 })
  return NextResponse.json({ scorers: parseScorers(discipline.details) })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await hasAdminSession())) return unauthorizedAdminResponse()
  const { slug } = await params
  const body = await request.json()
  const scorers: Scorer[] = Array.isArray(body.scorers) ? body.scorers : []

  const discipline = await prisma.discipline.findUnique({ where: { slug }, select: { details: true } })
  if (!discipline) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  await prisma.discipline.update({
    where: { slug },
    data: { details: serializeScorers(discipline.details, scorers) },
  })
  return NextResponse.json({ ok: true, scorers })
}
