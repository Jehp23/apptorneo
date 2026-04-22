import Link from "next/link"
import { unstable_noStore as noStore } from "next/cache"
import { Activity, ArrowRight, Calendar, Settings, Trophy, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

function getDisciplineStatus(matches: Array<{ played: boolean }>) {
  if (matches.length === 0) return { label: "Armando fixture", tone: "outline" as const }
  const played = matches.filter((m) => m.played).length
  if (played === 0)               return { label: "Pendiente",  tone: "secondary" as const }
  if (played === matches.length)  return { label: "Finalizado", tone: "default"   as const }
  return                                 { label: "En curso",   tone: "secondary" as const }
}

export default async function AdminOperacionPage() {
  noStore()

  const tournaments = await prisma.tournament.findMany({
    include: { disciplines: { select: { id: true, name: true, slug: true } } },
    orderBy: [{ status: "asc" }, { year: "desc" }, { createdAt: "desc" }],
  })

  const activeTournament =
    tournaments.find((t) => t.status === "active") ?? tournaments[0]

  const disciplines = activeTournament
    ? await prisma.discipline.findMany({
        where: { tournamentId: activeTournament.id },
        include: {
          teams:   { include: { players: true } },
          matches: {
            include: {
              team1: { select: { id: true, name: true } },
              team2: { select: { id: true, name: true } },
            },
            orderBy: [{ played: "asc" }, { date: "asc" }, { updatedAt: "desc" }],
          },
        },
        orderBy: { createdAt: "asc" },
      })
    : []

  const totalParticipants = disciplines.reduce(
    (acc, d) => acc + d.teams.reduce((a, t) => a + t.players.length, 0), 0
  )
  const totalMatches  = disciplines.reduce((acc, d) => acc + d.matches.length, 0)
  const playedMatches = disciplines.reduce((acc, d) => acc + d.matches.filter((m) => m.played).length, 0)

  const upcomingMatches = disciplines
    .flatMap((d) =>
      d.matches.filter((m) => !m.played).map((m) => ({
        id: m.id, discipline: d.name,
        team1: m.team1?.name ?? "Por definir",
        team2: m.team2?.name ?? "Por definir",
        date: m.date,
      }))
    )
    .slice(0, 5)

  const recentResults = disciplines
    .flatMap((d) =>
      d.matches.filter((m) => m.played).map((m) => ({
        id: m.id, discipline: d.name,
        team1: m.team1?.name ?? "Por definir",
        team2: m.team2?.name ?? "Por definir",
        score1: m.score1 ?? 0,
        score2: m.score2 ?? 0,
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
            <h1 className="font-serif text-3xl font-semibold text-foreground">Panel de operación</h1>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            Configuración
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: "Disciplinas",   value: disciplines.length, icon: Trophy },
          { label: "Participantes", value: totalParticipants,  icon: Users },
          { label: "Partidos",      value: totalMatches,        icon: Calendar },
          { label: "Jugados",       value: playedMatches,       icon: Activity },
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
            <CardTitle>Disciplinas</CardTitle>
            <CardDescription>Entrá a cada deporte para gestionar participantes, fixture y resultados.</CardDescription>
          </CardHeader>
          <CardContent>
            {disciplines.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
                No hay disciplinas cargadas todavía.{" "}
                <Link href="/admin" className="text-primary hover:underline">Configurar torneo →</Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {disciplines.map((discipline) => {
                  const status  = getDisciplineStatus(discipline.matches)
                  const players = discipline.teams.reduce((acc, t) => acc + t.players.length, 0)
                  return (
                    <Link
                      key={discipline.id}
                      href={`/admin/operacion/${discipline.slug}`}
                      className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">{discipline.name}</h2>
                          <p className="text-sm text-muted-foreground">{discipline.format ?? "Formato sin definir"}</p>
                        </div>
                        <Badge variant={status.tone}>{status.label}</Badge>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-xl bg-muted/30 p-3">
                          <p className="text-2xl font-semibold">{discipline.teams.length}</p>
                          <p className="text-xs text-muted-foreground">Inscripciones</p>
                        </div>
                        <div className="rounded-xl bg-muted/30 p-3">
                          <p className="text-2xl font-semibold">{players}</p>
                          <p className="text-xs text-muted-foreground">Jugadores</p>
                        </div>
                        <div className="rounded-xl bg-muted/30 p-3">
                          <p className="text-2xl font-semibold">{discipline.matches.length}</p>
                          <p className="text-xs text-muted-foreground">Partidos</p>
                        </div>
                      </div>

                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                        Administrar
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
            </CardHeader>
            <CardContent>
              {upcomingMatches.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No hay partidos pendientes.
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingMatches.map((match) => (
                    <Link
                      key={match.id}
                      href={`/admin/operacion/${disciplines.find((d) => d.matches.some((m) => m.id === match.id))?.slug ?? ""}`}
                      className="block rounded-2xl border border-border p-4 transition-colors hover:border-primary/30"
                    >
                      <p className="text-sm text-muted-foreground">{match.discipline}</p>
                      <p className="text-base font-semibold text-foreground">{match.team1} vs {match.team2}</p>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resultados recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentResults.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  Todavía no hay resultados cerrados.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentResults.map((result) => (
                    <div key={result.id} className="rounded-2xl border border-border p-4">
                      <p className="text-sm text-muted-foreground">{result.discipline}</p>
                      <p className="text-base font-semibold text-foreground">
                        {result.team1}{" "}
                        <span className="text-primary">{result.score1} - {result.score2}</span>{" "}
                        {result.team2}
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
