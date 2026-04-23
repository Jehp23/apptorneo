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

  const teams = await prisma.team.findMany({
    where: { disciplineId: discipline.id },
    include: { players: true },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(teams)
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

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })
  }

  try {
    const team = await prisma.team.create({
      data: {
        disciplineId: discipline.id,
        name: body.name,
        type: body.type || "SINGLE",
        group: body.group || undefined,
        seed: body.seed,
        players: body.players?.length
          ? { create: body.players.map((p: { name: string; seniority?: number }) => ({ name: p.name, seniority: p.seniority })) }
          : undefined,
      },
      include: { players: true },
    })

    return NextResponse.json(team, { status: 201 })
  } catch {
    return NextResponse.json({ error: "No se pudo crear el equipo" }, { status: 400 })
  }
}
