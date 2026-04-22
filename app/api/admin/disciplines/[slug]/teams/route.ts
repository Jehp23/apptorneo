import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Obtener equipos de una disciplina
export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const discipline = await prisma.discipline.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  })

  if (!discipline) {
    return NextResponse.json({ error: "Disciplina no encontrada" }, { status: 404 })
  }

  const teams = await prisma.team.findMany({
    where: { disciplineId: discipline.id },
    include: {
      players: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  return NextResponse.json(teams)
}

// POST: Crear un equipo en una disciplina
export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const discipline = await prisma.discipline.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  })

  if (!discipline) {
    return NextResponse.json({ error: "Disciplina no encontrada" }, { status: 404 })
  }

  const body = await request.json()

  try {
    const team = await prisma.team.create({
      data: {
        disciplineId: discipline.id,
        name: body.name,
        type: body.type || "TEAM",
        group: body.group,
        seed: body.seed,
        players: body.players
          ? {
              create: body.players.map((player: any) => ({
                name: player.name,
                seniority: player.seniority,
              })),
            }
          : undefined,
      },
      include: {
        players: true,
      },
    })

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "No se pudo crear el equipo" },
      { status: 400 }
    )
  }
}
