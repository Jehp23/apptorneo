import Link from "next/link"
import { Activity, Calendar, Eye, MonitorPlay, Trophy, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

export default async function DisplayPage() {
  const disciplines = await prisma.discipline.findMany({
    include: {
      tournament: {
        select: {
          name: true,
          year: true,
        },
      },
      _count: {
        select: {
          teams: true,
          matches: true,
        },
      },
      matches: {
        where: {
          played: false,
        },
        include: {
          team1: {
            select: { name: true },
          },
          team2: {
            select: { name: true },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 2,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 4,
  })

  const totalTeams = disciplines.reduce((acc, discipline) => acc + discipline._count.teams, 0)
  const totalMatches = disciplines.reduce((acc, discipline) => acc + discipline._count.matches, 0)

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-border bg-card p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <MonitorPlay className="h-4 w-4" />
                Modo pantalla
              </div>
              <div>
                <h1 className="font-serif text-4xl font-semibold text-foreground md:text-5xl">Estado del torneo</h1>
                <p className="max-w-3xl text-lg text-muted-foreground">
                  Vista pensada para monitor o TV grande. Muestra el estado global del torneo de forma clara mientras administración va operando en simultáneo.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/torneo" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                <Eye className="h-4 w-4" />
                Vista participante
              </Link>
              <Link href="/admin" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                <Activity className="h-4 w-4" />
                Ir a operar
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">Disciplinas activas</p>
                <p className="text-4xl font-semibold text-foreground">{disciplines.length}</p>
              </div>
              <Trophy className="h-8 w-8 text-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">Equipos / parejas</p>
                <p className="text-4xl font-semibold text-foreground">{totalTeams}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">Partidos cargados</p>
                <p className="text-4xl font-semibold text-foreground">{totalMatches}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          {disciplines.length === 0 ? (
            <Card className="xl:col-span-2">
              <CardContent className="p-10 text-center text-muted-foreground">
                Todavía no hay disciplinas cargadas. Primero administración tiene que preparar el torneo.
              </CardContent>
            </Card>
          ) : (
            disciplines.map((discipline) => (
              <Card key={discipline.id} className="overflow-hidden">
                <CardHeader className="border-b border-border bg-card/60">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-2xl">{discipline.name}</CardTitle>
                      <CardDescription>
                        {discipline.tournament.name} · {discipline.tournament.year}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{discipline.format || "Formato a definir"}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="rounded-2xl bg-muted/40 p-4">
                      <p className="text-3xl font-semibold text-foreground">{discipline._count.teams}</p>
                      <p className="text-sm text-muted-foreground">Equipos</p>
                    </div>
                    <div className="rounded-2xl bg-muted/40 p-4">
                      <p className="text-3xl font-semibold text-foreground">{discipline.playersCount ?? "—"}</p>
                      <p className="text-sm text-muted-foreground">Jugadores</p>
                    </div>
                    <div className="rounded-2xl bg-muted/40 p-4">
                      <p className="text-3xl font-semibold text-foreground">{discipline._count.matches}</p>
                      <p className="text-sm text-muted-foreground">Partidos</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">Próximos cruces</h2>
                    {discipline.matches.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-border p-4 text-muted-foreground">
                        No hay próximos partidos cargados todavía.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {discipline.matches.map((match) => (
                          <div key={match.id} className="flex items-center justify-between rounded-2xl border border-border p-4">
                            <span className="text-lg font-medium text-foreground">{match.team1?.name || "Por definir"}</span>
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">vs</span>
                            <span className="text-lg font-medium text-foreground">{match.team2?.name || "Por definir"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </section>
      </div>
    </div>
  )
}
