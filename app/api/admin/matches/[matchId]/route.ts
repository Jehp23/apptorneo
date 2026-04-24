import { NextResponse } from "next/server"
import { hasAdminSession, unauthorizedAdminResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

async function requireAdmin() {
  return hasAdminSession()
}


export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  if (!(await requireAdmin())) {
    return unauthorizedAdminResponse()
  }
  const { matchId } = await params
  try {
    await prisma.match.delete({ where: { id: matchId } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar el partido" }, { status: 400 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  if (!(await requireAdmin())) {
    return unauthorizedAdminResponse()
  }
  const { matchId } = await params
  const body = await request.json()

  try {
    const match = await prisma.match.update({
      where: { id: matchId },
      data: {
        score1: body.score1 ?? null,
        score2: body.score2 ?? null,
        played: body.played ?? false,
        ...(body.date !== undefined && { date: body.date ? new Date(body.date) : null }),
        ...(body.stage !== undefined && { stage: body.stage }),
      },
      include: {
        team1: { select: { id: true, name: true } },
        team2: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json(match)
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido"
    console.error("[PATCH match]", matchId, msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
