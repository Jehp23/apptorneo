import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PATCH: Actualizar un partido (scores, estado, etc)
export async function PATCH(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  const body = await request.json()

  try {
    const match = await prisma.match.update({
      where: { id: params.matchId },
      data: {
        score1: body.score1,
        score2: body.score2,
        played: body.played,
        date: body.date ? new Date(body.date) : undefined,
        stage: body.stage,
      },
      include: {
        team1: {
          select: { id: true, name: true },
        },
        team2: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(match)
  } catch (error) {
    return NextResponse.json(
      { error: "No se pudo actualizar el partido" },
      { status: 400 }
    )
  }
}
