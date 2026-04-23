import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const discipline = await prisma.discipline.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!discipline) {
    return NextResponse.json({ error: "Disciplina no encontrada" }, { status: 404 })
  }

  const matches = await prisma.match.findMany({
    where: { disciplineId: discipline.id },
    include: {
      team1: { select: { id: true, name: true } },
      team2: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(matches)
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const discipline = await prisma.discipline.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!discipline) {
    return NextResponse.json({ error: "Disciplina no encontrada" }, { status: 404 })
  }

  const body = await request.json()

  const match = await prisma.match.create({
    data: {
      disciplineId: discipline.id,
      team1Id:      body.team1Id,
      team2Id:      body.team2Id,
      score1:       body.score1,
      score2:       body.score2,
      played:       body.played ?? false,
      stage:        body.stage,
      date:         body.date ? new Date(body.date) : undefined,
    },
  })

  return NextResponse.json(match, { status: 201 })
}
