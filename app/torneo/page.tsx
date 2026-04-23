import Image from "next/image"
import Link from "next/link"
import { unstable_noStore as noStore } from "next/cache"
import { Activity, ArrowRight, Calendar, Trophy, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminHeaderActions } from "@/components/public/admin-header-actions"
import { prisma } from "@/lib/prisma"

function getDisciplineStatus(matches: Array<{ played: boolean }>) {
  if (matches.length === 0) return { label: "Armando fixture", tone: "outline" as const }

  const played = matches.filter((match) => match.played).length
  if (played === 0) return { label: "Pendiente", tone: "secondary" as const }
  if (played === matches.length) return { label: "Finalizado", tone: "default" as const }
  return { label: "En curso", tone: "secondary" as const }
}

function formatDate(date: Date | null) {
  if (!date) return "Sin horario"

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export default async function TournamentHomePage({
  searchParams,
}: {
  searchParams?: Promise<{ tournament?: string }>
}) {
  noStore()

  const resolvedSearchParams = (await searchParams) ?? {}
  const selectedTournamentId = resolvedSearchParams.tournament

  const tournaments = await prisma.tournament.findMany({
    include: {
      disciplines: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [{ status: "asc" }, { year: "desc" }, { createdAt: "desc" }],
  })

  const activeTournament = tournaments.find((tournament) => tournament.id === selectedTournamentId)
    ?? tournaments.find((tournament) => tournament.status === "active")
    ?? tournaments[0]

  const disciplines = activeTournament
    ? await prisma.discipline.findMany({
        where: {
          tournamentId: activeTournament.id,
        },
        include: {
          tournament: {
            select: {
              id: true,
              name: true,
              year: true,
              location: true,
            },
          },
          teams: {
            include: {
              players: true,
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
        orderBy: {
          createdAt: "asc",
        },
      })
    : []

  const totalParticipants = disciplines.reduce(
    (acc, discipline) => acc + discipline.teams.reduce((teamAcc, team) => teamAcc + team.players.length, 0),
    0
  )
  const totalMatches = disciplines.reduce((acc, discipline) => acc + discipline.matches.length, 0)
  const playedMatches = disciplines.reduce(
    (acc, discipline) => acc + discipline.matches.filter((match) => match.played).length,
    0
  )

  const upcomingMatches = disciplines
    .flatMap((discipline) =>
      discipline.matches
        .filter((match) => !match.played)
        .map((match) => ({
          id: match.id,
          discipline: discipline.name,
          team1: match.team1?.name || "Por definir",
          team2: match.team2?.name || "Por definir",
          date: match.date,
        }))
    )
    .slice(0, 5)

  const recentResults = disciplines
    .flatMap((discipline) =>
      discipline.matches
        .filter((match) => match.played)
        .map((match) => ({
          id: match.id,
          discipline: discipline.name,
          team1: match.team1?.name || "Por definir",
          team2: match.team2?.name || "Por definir",
          score1: match.score1 ?? 0,
          score2: match.score2 ?? 0,
        }))
    )
    .slice(0, 5)

  return (
    <div className="space-y-8 p-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-muted">
            <Image src="/logotipo_sanatorio.png" alt="Sanatorio El Carmen" fill className="object-contain" />
          </div>
          <div>
            {activeTournament ? (
              <p className="text-xs font-medium text-muted-foreground">
                {activeTournament.name} · {activeTournament.year}
              </p>
            ) : null}
            <h1 className="font-serif text-2xl font-semibold text-foreground">Torneo</h1>
          </div>
        </div>

        <AdminHeaderActions />
      </header>


      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Disciplinas", value: disciplines.length },
          { label: "Participantes", value: totalParticipants },
          { label: "Partidos", value: totalMatches },
          { label: "Jugados", value: playedMatches },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{item.value}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Disciplinas</h2>
        {disciplines.length === 0 ? (
          <p className="text-muted-foreground">No hay disciplinas cargadas.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {disciplines.map((discipline) => {
              const status = getDisciplineStatus(discipline.matches)
              const players = discipline.teams.reduce((acc, team) => acc + team.players.length, 0)
              return (
                <Link
                  key={discipline.id}
                  href={`/torneo/${discipline.slug}`}
                  className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{discipline.name}</h3>
                      <p className="text-xs text-muted-foreground">{discipline.format || ""}</p>
                    </div>
                    <Badge variant={status.tone} className="text-xs">{status.label}</Badge>
                  </div>

                  <div className="mt-3 flex gap-4 text-sm">
                    <span className="text-muted-foreground">{discipline.teams.length} equipos</span>
                    <span className="text-muted-foreground">{players} jugadores</span>
                    <span className="text-muted-foreground">{discipline.matches.length} partidos</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Próximos partidos</h2>
          {upcomingMatches.length === 0 ? (
            <p className="text-muted-foreground">No hay próximos partidos.</p>
          ) : (
            <div className="space-y-3">
              {upcomingMatches.map((match) => (
                <div key={match.id} className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">{match.discipline}</p>
                  <p className="font-semibold text-foreground">{match.team1} vs {match.team2}</p>
                  <p className="text-sm text-primary">{formatDate(match.date)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Resultados recientes</h2>
          {recentResults.length === 0 ? (
            <p className="text-muted-foreground">No hay resultados aún.</p>
          ) : (
            <div className="space-y-3">
              {recentResults.map((result) => (
                <div key={result.id} className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">{result.discipline}</p>
                  <p className="font-semibold text-foreground">
                    {result.team1} <span className="text-primary">{result.score1} - {result.score2}</span> {result.team2}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
