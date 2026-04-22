import { notFound } from "next/navigation"
import { unstable_noStore as noStore } from "next/cache"

import { AdminDisciplineView } from "@/components/admin/admin-discipline-view"
import { prisma } from "@/lib/prisma"

export default async function AdminDisciplinePage({ params }: { params: { slug: string } }) {
  noStore()

  const discipline = await prisma.discipline.findUnique({
    where: { slug: params.slug },
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
        orderBy: [{ played: "asc" }, { date: "asc" }, { updatedAt: "desc" }],
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
        playersCount: discipline.playersCount,
        teamsCount:   discipline.teamsCount,
        details:      discipline.details,
        teams:        discipline.teams.map((t) => ({
          id:      t.id,
          name:    t.name,
          group:   t.group,
          players: t.players.map((p) => ({ id: p.id, name: p.name, seniority: p.seniority })),
        })),
        matches: discipline.matches.map((m) => ({
          id:     m.id,
          team1:  m.team1,
          team2:  m.team2,
          score1: m.score1,
          score2: m.score2,
          played: m.played,
          stage:  m.stage,
          date:   m.date ? m.date.toISOString() : null,
        })),
      }}
    />
  )
}
