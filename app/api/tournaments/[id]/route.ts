import { NextResponse } from "next/server"
import { hasAdminSession, unauthorizedAdminResponse } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasAdminSession())) {
    return unauthorizedAdminResponse()
  }

  const { id } = await params
  const body = await request.json()

  try {
    const tournament = await prisma.tournament.update({
      where: { id },
      data: {
        name: body.name,
        location: body.location,
        year: body.year ? Number(body.year) : undefined,
        status: body.status,
      },
    })
    return NextResponse.json(tournament)
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el torneo." }, { status: 400 })
  }
}
