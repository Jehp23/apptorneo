import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Obtener todas las disciplinas para el panel de admin
export async function GET() {
  const disciplines = await prisma.discipline.findMany({
    include: {
      tournament: true,
      _count: {
        select: {
          teams: true,
          matches: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return NextResponse.json(disciplines)
}
