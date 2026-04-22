import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function normalizeSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
}

export async function GET() {
  const disciplines = await prisma.discipline.findMany({
    include: {
      tournament: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return NextResponse.json(disciplines)
}

export async function POST(request: Request) {
  const body = await request.json()
  const slug = body.slug || normalizeSlug(body.name || "disciplina")

  try {
    const discipline = await prisma.discipline.create({
      data: {
        name: body.name,
        slug,
        format: body.format,
        teamsCount: body.teamsCount,
        playersCount: body.playersCount,
        details: body.details,
        tournament: {
          connect: {
            id: body.tournamentId,
          },
        },
      },
    })

    return NextResponse.json(discipline, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        error: "No se pudo crear la disciplina. Revisa los datos enviados.",
      },
      {
        status: 400,
      }
    )
  }
}
