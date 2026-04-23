import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const body = await request.json()

  try {
    const discipline = await prisma.discipline.update({
      where: { slug },
      data: {
        name: body.name ?? undefined,
        format: body.format ?? undefined,
        details: body.details ?? undefined,
        teamsCount: body.teamsCount != null ? Number(body.teamsCount) : undefined,
        playersCount: body.playersCount != null ? Number(body.playersCount) : undefined,
      },
    })
    return NextResponse.json(discipline)
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar la disciplina." }, { status: 400 })
  }
}
