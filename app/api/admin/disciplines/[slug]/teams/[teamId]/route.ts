import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  _request: Request,
  { params }: { params: { slug: string; teamId: string } }
) {
  try {
    await prisma.player.deleteMany({ where: { teamId: params.teamId } })
    await prisma.team.delete({ where: { id: params.teamId } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar el participante" }, { status: 400 })
  }
}
