import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string; teamId: string }> }
) {
  const { teamId } = await params
  try {
    await prisma.player.deleteMany({ where: { teamId } })
    await prisma.team.delete({ where: { id: teamId } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar el participante" }, { status: 400 })
  }
}
