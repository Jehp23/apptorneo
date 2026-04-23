import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { isValidAdminToken } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { AdminHomeView } from "@/components/admin/admin-home-view"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_session")?.value
  if (!isValidAdminToken(token)) redirect("/admin/login")

  const tournaments = await prisma.tournament.findMany({
    include: {
      disciplines: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const disciplines = await prisma.discipline.findMany({
    include: {
      tournament: { select: { id: true, name: true, year: true } },
      teams: { include: { players: true }, orderBy: { createdAt: "asc" } },
      matches: {
        include: {
          team1: { select: { id: true, name: true } },
          team2: { select: { id: true, name: true } },
        },
        orderBy: [{ played: "asc" }, { date: "asc" }],
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const normalizedDisciplines = disciplines.map((d) => ({
    id:             d.id,
    name:           d.name,
    slug:           d.slug,
    format:         d.format,
    details:        d.details,
    playersCount:   d.playersCount,
    teamsCount:     d.teamsCount,
    tournamentId:   d.tournament.id,
    tournamentName: d.tournament.name,
    tournamentYear: d.tournament.year,
    teams:          d.teams,
    matches:        d.matches.map((m) => ({
      id:     m.id,
      score1: m.score1,
      score2: m.score2,
      played: m.played,
      stage:  m.stage,
      date:   m.date ? m.date.toISOString() : null,
      team1:  m.team1,
      team2:  m.team2,
    })),
  }))

  return (
    <AdminHomeView
      initialTournaments={tournaments}
      initialDisciplines={normalizedDisciplines}
    />
  )
}
