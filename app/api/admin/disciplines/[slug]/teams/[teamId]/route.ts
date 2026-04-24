import { NextResponse } from "next/server"
import { hasAdminSession, unauthorizedAdminResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string; teamId: string }> }
) {
  if (!(await hasAdminSession())) {
    return unauthorizedAdminResponse()
  }

  const { teamId } = await params
  const body = await request.json()

  try {
    if (body.name !== undefined || body.group !== undefined || body.seed !== undefined) {
      await prisma.team.update({
        where: { id: teamId },
        data: {
          name: body.name ?? undefined,
          group: body.group === null ? null : body.group ?? undefined,
          seed: body.seed !== undefined ? body.seed : undefined,
        },
      })
    }

    if (Array.isArray(body.players)) {
      await prisma.player.deleteMany({ where: { teamId } })
      if (body.players.length > 0) {
        await prisma.player.createMany({
          data: body.players.map((name: string) => ({ name: name.trim(), teamId })),
        })
      }
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { players: true },
    })
    return NextResponse.json(team)
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el participante" }, { status: 400 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string; teamId: string }> }
) {
  if (!(await hasAdminSession())) {
    return unauthorizedAdminResponse()
  }

  const { teamId } = await params
  try {
    await prisma.player.deleteMany({ where: { teamId } })
    await prisma.team.delete({ where: { id: teamId } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar el participante" }, { status: 400 })
  }
}
