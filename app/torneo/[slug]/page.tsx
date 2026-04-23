import { notFound } from "next/navigation"
import { unstable_noStore as noStore } from "next/cache"
import { cookies } from "next/headers"

import { PublicDisciplineView } from "@/components/public/public-discipline-view"
import { isValidAdminToken } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export default async function PublicDisciplinePage({ params }: { params: Promise<{ slug: string }> }) {
  noStore()

  const { slug } = await params
  const cookieStore = await cookies()
  const isAdmin = await isValidAdminToken(cookieStore.get("admin_session")?.value)

  const discipline = await prisma.discipline.findUnique({
    where: { slug },
    include: {
      teams: {
        include: {
          players: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      matches: {
        include: {
          team1: {
            select: { id: true, name: true },
          },
          team2: {
            select: { id: true, name: true },
          },
        },
        orderBy: [{ played: "asc" }, { date: "asc" }, { updatedAt: "desc" }],
      },
    },
  })

  if (!discipline) {
    notFound()
  }

  return (
    <PublicDisciplineView
      isAdmin={isAdmin}
      discipline={{
        id: discipline.id,
        name: discipline.name,
        slug: discipline.slug,
        format: discipline.format,
        playersCount: discipline.playersCount,
        teamsCount: discipline.teamsCount,
        details: discipline.details,
        teams: discipline.teams,
        matches: discipline.matches.map((match) => ({
          id: match.id,
          team1: match.team1,
          team2: match.team2,
          score1: match.score1,
          score2: match.score2,
          played: match.played,
          stage: match.stage,
          date: match.date ? match.date.toISOString() : null,
        })),
      }}
    />
  )
}
