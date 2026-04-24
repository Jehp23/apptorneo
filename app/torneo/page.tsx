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
    <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6 lg:p-8">
      <header className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Accent bar */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
        <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
              <Image src="/logosanatorio.avif" alt="Sanatorio El Carmen" fill className="object-contain p-2" />
            </div>
            <div>
              {activeTournament ? (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {activeTournament.name} · {activeTournament.year}
                </p>
              ) : null}
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Torneo en vivo</h1>
              {activeTournament?.location ? (
                <p className="text-sm text-muted-foreground">{activeTournament.location}</p>
              ) : null}
            </div>
          </div>
          <AdminHeaderActions />
        </div>
      </header>

      {tournaments.length > 0 ? (
        <section className="space-y-3">
          <div className="flex flex-wrap gap-3">
            {tournaments.map((tournament) => {
              const isActive = tournament.id === activeTournament?.id
              return (
                <Link
                  key={tournament.id}
                  href={`/torneo?tournament=${tournament.id}`}
                  className={`rounded-2xl border px-4 py-3 text-sm transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="font-semibold">{tournament.name}</div>
                  <div className={`text-xs ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {tournament.location} · {tournament.year}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Disciplinas", value: disciplines.length, icon: Trophy },
          { label: "Participantes", value: totalParticipants, icon: Users },
          { label: "Partidos", value: totalMatches, icon: Calendar },
          { label: "Jugados", value: playedMatches, icon: Activity },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <item.icon className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
            </div>
            <p className="text-2xl font-bold tracking-tight text-foreground">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Disciplinas activas</CardTitle>
            <CardDescription>
              Entrá a cada disciplina para ver participantes, fixture, posiciones y estado general.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {disciplines.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
                No hay disciplinas cargadas para este torneo todavía.
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {disciplines.map((discipline) => {
                  const status = getDisciplineStatus(discipline.matches)
                  const players = discipline.teams.reduce((acc, team) => acc + team.players.length, 0)
                  return (
                    <Link
                      key={discipline.id}
                      href={`/torneo/${discipline.slug}`}
                      className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
                    >
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0">
                          <h2 className="font-bold text-base text-foreground truncate">{discipline.name}</h2>
                          <p className="text-xs text-muted-foreground truncate">{discipline.format || "Sin formato"}</p>
                        </div>
                        <Badge variant={status.tone} className="shrink-0 text-xs">{status.label}</Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-muted/40 py-2">
                          <p className="text-lg font-bold text-foreground">{discipline.teams.length}</p>
                          <p className="text-[10px] text-muted-foreground">equipos</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 py-2">
                          <p className="text-lg font-bold text-foreground">{players}</p>
                          <p className="text-[10px] text-muted-foreground">jugadores</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 py-2">
                          <p className="text-lg font-bold text-foreground">{discipline.matches.length}</p>
                          <p className="text-[10px] text-muted-foreground">partidos</p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary">
                        Ver detalle
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Próximos partidos</CardTitle>
              <CardDescription>Lo que se viene en el torneo activo.</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingMatches.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border p-6 text-muted-foreground">
                  No hay próximos partidos cargados.
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingMatches.map((match) => (
                    <div key={match.id} className="rounded-2xl border border-border p-4">
                      <p className="text-sm text-muted-foreground">{match.discipline}</p>
                      <p className="text-lg font-semibold text-foreground">{match.team1} vs {match.team2}</p>
                      <p className="text-sm text-primary">{formatDate(match.date)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resultados recientes</CardTitle>
              <CardDescription>Últimos cierres ya cargados por administración.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentResults.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border p-6 text-sm text-center text-muted-foreground">
                  Todavía no hay resultados cerrados.
                </p>
              ) : (
                <div className="divide-y divide-border/50 -mx-6">
                  {recentResults.map((result) => {
                    const w1 = result.score1 > result.score2
                    const w2 = result.score2 > result.score1
                    return (
                      <div key={result.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-6 py-3">
                        <span className={`text-sm text-right truncate ${w1 ? "font-bold text-foreground" : "text-muted-foreground"}`}>{result.team1}</span>
                        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 px-2.5 py-1">
                          <span className={`w-4 text-center font-mono font-bold text-sm ${w1 ? "text-primary" : "text-foreground"}`}>{result.score1}</span>
                          <span className="text-muted-foreground/40 text-xs">–</span>
                          <span className={`w-4 text-center font-mono font-bold text-sm ${w2 ? "text-primary" : "text-foreground"}`}>{result.score2}</span>
                        </div>
                        <span className={`text-sm text-left truncate ${w2 ? "font-bold text-foreground" : "text-muted-foreground"}`}>{result.team2}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
