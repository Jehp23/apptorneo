import Link from "next/link"
import { unstable_noStore as noStore } from "next/cache"
import { Activity, Calendar, Eye, MonitorPlay, RefreshCcw, TimerReset, Trophy, Users } from "lucide-react"

import { DisplayAutorefresh } from "@/components/display/display-autorefresh"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import {
  buildGroupedStandings,
  detectStandingsVariant,
  type AdminDisciplineMatch as Match,
  type AdminDisciplineTeam as Team,
  type RankedSimpleStandingRow,
  type RankedStandingRow,
} from "@/lib/admin-discipline-workflows"

function formatDate(date: Date | null) {
  if (!date) return "Sin horario"

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export default async function DisplayPage({
  searchParams,
}: {
  searchParams?: Promise<{ tournament?: string; mode?: string }>
}) {
  noStore()

  const resolvedSearchParams = (await searchParams) ?? {}
  const selectedTournamentId = resolvedSearchParams.tournament
  const mode = resolvedSearchParams.mode === "manual" ? "manual" : "auto"

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

  const fallbackTournament = tournaments.find((tournament) => tournament.status === "active") ?? tournaments[0]
  const effectiveTournamentId = selectedTournamentId || fallbackTournament?.id

  const disciplines = effectiveTournamentId
    ? await prisma.discipline.findMany({
        where: {
          tournamentId: effectiveTournamentId,
        },
        include: {
          tournament: {
            select: {
              id: true,
              name: true,
              year: true,
              location: true,
              status: true,
            },
          },
          _count: {
            select: {
              teams: true,
              matches: true,
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

  const activeTournament = tournaments.find((tournament) => tournament.id === effectiveTournamentId)

  const totalTeams = disciplines.reduce((acc, discipline) => acc + discipline._count.teams, 0)
  const totalPlayers = disciplines.reduce(
    (acc, discipline) => acc + discipline.teams.reduce((teamAcc, team) => teamAcc + team.players.length, 0),
    0
  )
  const totalMatches = disciplines.reduce((acc, discipline) => acc + discipline._count.matches, 0)
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
          stage: match.stage,
          team1: match.team1?.name || "Por definir",
          team2: match.team2?.name || "Por definir",
          date: match.date,
        }))
    )
    .sort((a, b) => {
      if (!a.date && !b.date) return 0
      if (!a.date) return 1
      if (!b.date) return -1
      return a.date.getTime() - b.date.getTime()
    })
    .slice(0, 6)

  const recentResults = disciplines
    .flatMap((discipline) =>
      discipline.matches
        .filter((match) => match.played)
        .map((match) => ({
          id: match.id,
          discipline: discipline.name,
          stage: match.stage,
          team1: match.team1?.name || "Por definir",
          team2: match.team2?.name || "Por definir",
          score1: match.score1 ?? 0,
          score2: match.score2 ?? 0,
          updatedAt: match.updatedAt,
        }))
    )
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 6)

  const spotlightDisciplines = disciplines.map((discipline) => {
    const pending = discipline.matches.filter((match) => !match.played).length
    const completed = discipline.matches.filter((match) => match.played).length
    const standingsVariant = detectStandingsVariant(discipline.slug, discipline.format)
    const groupedStandings = buildGroupedStandings(
      discipline.teams as Team[],
      discipline.matches as Match[],
      standingsVariant
    )
    return {
      id: discipline.id,
      name: discipline.name,
      slug: discipline.slug,
      format: discipline.format,
      teams: discipline._count.teams,
      matches: discipline._count.matches,
      pending,
      completed,
      standingsVariant,
      groupedStandings,
    }
  })

  return (
    <div className="min-h-screen bg-background px-6 py-8 md:px-10">
      <div className="mx-auto max-w-[1600px] space-y-8">
        <header className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="gap-2 rounded-full px-4 py-1 text-sm">
                  <MonitorPlay className="h-4 w-4" />
                  Pantalla grande
                </Badge>
                <DisplayAutorefresh enabled={mode === "auto"} intervalSeconds={20} />
                {activeTournament ? <Badge variant="outline">{activeTournament.status}</Badge> : null}
              </div>

              <div>
                <h1 className="font-serif text-4xl font-semibold text-foreground md:text-6xl">Estado general del torneo</h1>
                <p className="mt-3 max-w-4xl text-lg text-muted-foreground md:text-xl">
                  Pantalla pensada para TV o monitor institucional. Muestra el torneo activo, próximos cruces y resultados recientes mientras el admin actualiza todo en simultáneo.
                </p>
              </div>

              {activeTournament ? (
                <div className="flex flex-wrap items-center gap-3 text-base text-muted-foreground md:text-lg">
                  <span className="font-semibold text-primary">{activeTournament.name}</span>
                  <span>· {activeTournament.location}</span>
                  <span>· {activeTournament.year}</span>
                  <span>· {activeTournament.disciplines.length} disciplinas</span>
                </div>
              ) : (
                <p className="text-lg text-muted-foreground">No hay torneos cargados todavía.</p>
              )}
            </div>

            <div className="flex flex-col gap-3 xl:min-w-[360px]">
              <div className="flex flex-wrap gap-3">
                <Link href={`/pantalla${activeTournament ? `?tournament=${activeTournament.id}&mode=auto` : ""}`} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  <RefreshCcw className="h-4 w-4" />
                  Auto refresh
                </Link>
                <Link href={`/pantalla${activeTournament ? `?tournament=${activeTournament.id}&mode=manual` : ""}`} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                  <TimerReset className="h-4 w-4" />
                  Manual
                </Link>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/torneo" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                  <Eye className="h-4 w-4" />
                  Vista participante
                </Link>
                <Link href="/admin" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                  <Activity className="h-4 w-4" />
                  Operar torneo
                </Link>
              </div>
            </div>
          </div>
        </header>

        {tournaments.length > 0 ? (
          <section className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {tournaments.map((tournament) => {
                const isActive = tournament.id === effectiveTournamentId
                return (
                  <Link
                    key={tournament.id}
                    href={`/pantalla?tournament=${tournament.id}&mode=${mode}`}
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

        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {[
            { label: "Disciplinas", value: disciplines.length, icon: Trophy },
            { label: "Participantes", value: totalPlayers, icon: Users },
            { label: "Inscripciones", value: totalTeams, icon: Activity },
            { label: "Partidos jugados", value: `${playedMatches}/${totalMatches}`, icon: Calendar },
          ].map((item) => (
            <Card key={item.label} className="rounded-[1.75rem]">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-4xl font-semibold text-foreground md:text-5xl">{item.value}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 p-4">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardTitle className="text-3xl">Próximos partidos</CardTitle>
              <CardDescription className="text-base">Lo que se viene en el torneo activo. Ideal para que la gente se ubique rápido.</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingMatches.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border p-10 text-center text-lg text-muted-foreground">
                  No hay próximos partidos cargados todavía.
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingMatches.map((match, index) => (
                    <div key={match.id} className="flex flex-col gap-4 rounded-3xl border border-border p-5 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground md:text-2xl">
                            {match.team1} <span className="text-primary">vs</span> {match.team2}
                          </p>
                          <p className="text-sm text-muted-foreground md:text-base">
                            {match.discipline} · {match.stage || "Fase por definir"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="w-fit px-4 py-2 text-sm">
                        {formatDate(match.date)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardTitle className="text-3xl">Resultados recientes</CardTitle>
              <CardDescription className="text-base">Últimos cierres cargados por administración.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentResults.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border p-10 text-center text-lg text-muted-foreground">
                  Todavía no hay resultados cerrados.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentResults.map((result) => (
                    <div key={result.id} className="rounded-3xl border border-border p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-muted-foreground">{result.discipline} · {result.stage || "Fase sin definir"}</p>
                          <p className="mt-1 text-xl font-semibold text-foreground md:text-2xl">
                            {result.team1} <span className="text-primary">{result.score1} - {result.score2}</span> {result.team2}
                          </p>
                        </div>
                        <Badge variant="secondary" className="px-4 py-2 text-sm">
                          {formatDate(result.updatedAt)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardTitle className="text-3xl">Radar por disciplina</CardTitle>
              <CardDescription className="text-base">Resumen rápido para rotar la mirada sin perderte.</CardDescription>
            </CardHeader>
            <CardContent>
              {spotlightDisciplines.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-border p-10 text-center text-lg text-muted-foreground">
                  No hay disciplinas para mostrar.
                </p>
              ) : (
                <div className="space-y-4">
                  {spotlightDisciplines.map((discipline) => (
                    <div key={discipline.id} className="rounded-3xl border border-border p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h2 className="text-2xl font-semibold text-foreground">{discipline.name}</h2>
                          <p className="text-sm text-muted-foreground">{discipline.format || "Formato sin definir"}</p>
                        </div>
                        <Badge variant="outline">{discipline.teams} inscripciones</Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-2xl bg-muted/40 p-4">
                          <p className="text-3xl font-semibold text-foreground">{discipline.matches}</p>
                          <p className="text-sm text-muted-foreground">Partidos</p>
                        </div>
                        <div className="rounded-2xl bg-muted/40 p-4">
                          <p className="text-3xl font-semibold text-foreground">{discipline.completed}</p>
                          <p className="text-sm text-muted-foreground">Cerrados</p>
                        </div>
                        <div className="rounded-2xl bg-muted/40 p-4">
                          <p className="text-3xl font-semibold text-foreground">{discipline.pending}</p>
                          <p className="text-sm text-muted-foreground">Pendientes</p>
                        </div>
                      </div>
                      {discipline.groupedStandings.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {discipline.groupedStandings.map((group) => (
                            <div key={group.groupName} className="rounded-2xl bg-muted/20 p-4">
                              <h3 className="text-sm font-semibold text-foreground mb-2">{group.groupName}</h3>
                              <div className="space-y-1">
                                {(group.standings as RankedSimpleStandingRow[]).slice(0, 5).map((standing, idx) => (
                                  <div key={standing.teamId} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="w-6 text-center font-medium text-muted-foreground">{idx + 1}</span>
                                      <span className="font-medium text-foreground">{standing.teamName}</span>
                                    </div>
                                    <div className="flex gap-3 text-muted-foreground">
                                      <span>{standing.pg}G</span>
                                      <span>{standing.pp}P</span>
                                      <span className="font-semibold text-foreground">{standing.pts}pts</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardTitle className="text-3xl">Posiciones en vivo</CardTitle>
              <CardDescription className="text-base">Tablas actualizadas por disciplina, en tiempo real.</CardDescription>
            </CardHeader>
            <CardContent>
              {spotlightDisciplines.filter(d => d.groupedStandings.length > 0).length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border p-10 text-center text-lg text-muted-foreground">
                  Todavía no hay posiciones calculadas.
                </div>
              ) : (
                <div className="space-y-6">
                  {spotlightDisciplines
                    .filter(d => d.groupedStandings.length > 0 && d.standingsVariant !== "loba")
                    .map((discipline) => (
                      <div key={discipline.id}>
                        <h3 className="mb-3 text-xl font-semibold text-foreground">{discipline.name}</h3>
                        <div className={`grid gap-4 ${discipline.groupedStandings.length > 1 ? "md:grid-cols-2" : ""}`}>
                          {discipline.groupedStandings.map((group) => (
                            <div key={group.groupName} className="rounded-2xl border border-border overflow-hidden">
                              <div className="bg-muted/30 px-4 py-2 border-b border-border">
                                <p className="text-sm font-semibold text-foreground">{group.groupName}</p>
                              </div>
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-border">
                                    <th className="px-3 py-2 text-left text-xs text-muted-foreground font-medium">#</th>
                                    <th className="px-3 py-2 text-left text-xs text-muted-foreground font-medium">Equipo</th>
                                    <th className="px-3 py-2 text-center text-xs text-muted-foreground font-medium">PJ</th>
                                    <th className="px-3 py-2 text-center text-xs text-muted-foreground font-medium">G</th>
                                    <th className="px-3 py-2 text-center text-xs text-muted-foreground font-medium">P</th>
                                    <th className="px-3 py-2 text-center text-xs font-semibold text-foreground">Pts</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(group.standings as RankedSimpleStandingRow[]).map((row, idx) => (
                                    <tr key={row.teamId} className={`border-b border-border last:border-0 ${idx % 2 === 1 ? "bg-muted/20" : ""}`}>
                                      <td className="px-3 py-2 text-center">
                                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${row.position <= 2 ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                                          {row.position}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 font-medium text-foreground">{row.teamName}</td>
                                      <td className="px-3 py-2 text-center text-muted-foreground">{row.pj}</td>
                                      <td className="px-3 py-2 text-center text-muted-foreground">{row.pg}</td>
                                      <td className="px-3 py-2 text-center text-muted-foreground">{row.pp}</td>
                                      <td className="px-3 py-2 text-center font-semibold text-foreground">{row.pts}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
