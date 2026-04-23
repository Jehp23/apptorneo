import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminDisciplineView } from "@/components/admin/admin-discipline-view"

export default async function AdminDisciplinePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const discipline = await prisma.discipline.findUnique({
    where: { slug },
    include: {
      teams: {
        include: { players: true },
        orderBy: { createdAt: "asc" },
      },
      matches: {
        include: {
          team1: { select: { id: true, name: true } },
          team2: { select: { id: true, name: true } },
        },
        orderBy: [{ played: "asc" }, { date: "asc" }, { createdAt: "asc" }],
      },
    },
  })

  if (!discipline) notFound()

  return (
    <AdminDisciplineView
      discipline={{
        id:           discipline.id,
        name:         discipline.name,
        slug:         discipline.slug,
        format:       discipline.format,
        details:      discipline.details,
        teamsCount:   discipline.teamsCount,
        playersCount: discipline.playersCount,
        teams:        discipline.teams,
        matches:      discipline.matches.map((m) => ({
          id:     m.id,
          score1: m.score1,
          score2: m.score2,
          played: m.played,
          stage:  m.stage,
          date:   m.date?.toISOString() ?? null,
          team1:  m.team1,
          team2:  m.team2,
        })),
      }}
    />
  )
}
