import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const tournaments = await prisma.tournament.findMany({
    include: {
      disciplines: {
        select: {
          id: true,
          name: true,
          slug: true,
          format: true,
          teamsCount: true,
          playersCount: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return NextResponse.json(tournaments)
}

export async function POST(request: Request) {
  const body = await request.json()

  const tournament = await prisma.tournament.create({
    data: {
      name: body.name,
      location: body.location,
      year: body.year || new Date().getFullYear(),
      status: body.status || "active",
      disciplines: body.disciplines
        ? {
            create: body.disciplines.map((discipline: any) => ({
              name: discipline.name,
              slug: discipline.slug,
              format: discipline.format,
              teamsCount: discipline.teamsCount,
              playersCount: discipline.playersCount,
              details: discipline.details,
            })),
          }
        : undefined,
    },
  })

  return NextResponse.json(tournament, { status: 201 })
}
