import { NextResponse } from "next/server"
import { hasAdminSession, unauthorizedAdminResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await hasAdminSession())) return unauthorizedAdminResponse()

  const { slug } = await params

  const discipline = await prisma.discipline.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!discipline) {
    return NextResponse.json({ error: "Disciplina no encontrada" }, { status: 404 })
  }

  await prisma.match.updateMany({
    where: { disciplineId: discipline.id },
    data: { score1: null, score2: null, played: false },
  })

  return NextResponse.json({ ok: true })
}
