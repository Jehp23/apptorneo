import Link from "next/link"
import { unstable_noStore as noStore } from "next/cache"
import { cookies } from "next/headers"
import { Activity, ArrowRight, Calendar, LogIn, LogOut, Trophy, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { isValidAdminToken } from "@/lib/admin-auth"
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

  const cookieStore = await cookies()
  const isAdmin = await isValidAdminToken(cookieStore.get("admin_session")?.value)

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
    <div className="space-y-8 p-8">
      <header className="rounded-3xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            {activeTournament ? (
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                {activeTournament.name} · {activeTournament.location} · {activeTournament.year}
              </p>
            ) : null}
            <h1 className="font-serif text-3xl font-semibold text-foreground">
              {isAdmin ? "Operación del torneo" : "Torneo en vivo"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin ? (
              <Link
                href="/api/admin/auth/logout"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <LogIn className="h-4 w-4" />
                Ingresar como admin
              </Link>
            )}
          </div>
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

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: "Disciplinas", value: disciplines.length, icon: Trophy },
          { label: "Participantes", value: totalParticipants, icon: Users },
          { label: "Partidos", value: totalMatches, icon: Calendar },
          { label: "Jugados", value: playedMatches, icon: Activity },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-3xl font-semibold text-foreground">{item.value}</p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
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
              <div className="grid gap-4 md:grid-cols-2">
                {disciplines.map((discipline) => {
                  const status = getDisciplineStatus(discipline.matches)
                  const players = discipline.teams.reduce((acc, team) => acc + team.players.length, 0)
                  return (
                    <Link
                      key={discipline.id}
                      href={`/torneo/${discipline.slug}`}
                      className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">{discipline.name}</h2>
                          <p className="text-sm text-muted-foreground">{discipline.format || "Formato sin definir"}</p>
                        </div>
                        <Badge variant={status.tone}>{status.label}</Badge>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-xl bg-muted/30 p-3">
                          <p className="text-2xl font-semibold text-foreground">{discipline.teams.length}</p>
                          <p className="text-xs text-muted-foreground">Inscripciones</p>
                        </div>
                        <div className="rounded-xl bg-muted/30 p-3">
                          <p className="text-2xl font-semibold text-foreground">{players}</p>
                          <p className="text-xs text-muted-foreground">Jugadores</p>
                        </div>
                        <div className="rounded-xl bg-muted/30 p-3">
                          <p className="text-2xl font-semibold text-foreground">{discipline.matches.length}</p>
                          <p className="text-xs text-muted-foreground">Partidos</p>
                        </div>
                      </div>

                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                        Ver detalle
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
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
                <p className="rounded-2xl border border-dashed border-border p-6 text-muted-foreground">
                  Todavía no hay resultados cerrados.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentResults.map((result) => (
                    <div key={result.id} className="rounded-2xl border border-border p-4">
                      <p className="text-sm text-muted-foreground">{result.discipline}</p>
                      <p className="text-lg font-semibold text-foreground">
                        {result.team1} <span className="text-primary">{result.score1} - {result.score2}</span> {result.team2}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
