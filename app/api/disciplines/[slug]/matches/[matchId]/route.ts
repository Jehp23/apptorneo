import { NextResponse } from "next/server"
import { hasAdminSession, unauthorizedAdminResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string; matchId: string }> }) {
  if (!(await hasAdminSession())) {
    return unauthorizedAdminResponse()
  }

  const { slug, matchId } = await params

  const discipline = await prisma.discipline.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!discipline) {
    return NextResponse.json({ error: "Disciplina no encontrada" }, { status: 404 })
  }

  const existingMatch = await prisma.match.findFirst({
    where: { id: matchId, disciplineId: discipline.id },
  })

  if (!existingMatch) {
    return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 })
  }

  const body = await request.json()

  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: {
      score1: body.score1,
      score2: body.score2,
      played: body.played ?? existingMatch.played,
      stage: body.stage,
      date: body.date ? new Date(body.date) : body.date === null ? null : existingMatch.date,
    },
  })

  return NextResponse.json(updatedMatch)
}
