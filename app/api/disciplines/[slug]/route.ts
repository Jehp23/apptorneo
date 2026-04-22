import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const discipline = await prisma.discipline.findUnique({
    where: { slug: params.slug },
    include: {
      tournament: true,
      teams: {
        include: {
          players: true,
        },
      },
      matches: {
        include: {
          team1: {
            select: {
              id: true,
              name: true,
            },
          },
          team2: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  })

  if (!discipline) {
    return NextResponse.json({ error: "Disciplina no encontrada" }, { status: 404 })
  }

  return NextResponse.json(discipline)
}

export async function PATCH(request: Request, { params }: { params: { slug: string } }) {
  const body = await request.json()

  try {
    const discipline = await prisma.discipline.update({
      where: {
        slug: params.slug,
      },
      data: {
        name: body.name,
        format: body.format,
        teamsCount: body.teamsCount,
        playersCount: body.playersCount,
        details: body.details,
      },
    })

    return NextResponse.json(discipline)
  } catch (error) {
    return NextResponse.json(
      { error: "No se pudo actualizar la disciplina" },
      { status: 400 }
    )
  }
}
