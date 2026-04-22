import Link from "next/link"
import { cookies } from "next/headers"
import { Activity, Calendar, LogOut, ShieldCheck, Trophy, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { isValidAdminToken } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

async function logout() {
  "use server"

  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
}

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_session")?.value
  const isAdmin = isValidAdminToken(token)

  const disciplines = await prisma.discipline.findMany({
    include: {
      tournament: {
        select: {
          id: true,
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
        select: {
          played: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  const totals = disciplines.reduce(
    (acc, discipline) => {
      acc.disciplines += 1
      acc.teams += discipline._count.teams
      acc.matches += discipline._count.matches
      acc.playedMatches += discipline.matches.filter((match) => match.played).length
      return acc
    },
    { disciplines: 0, teams: 0, matches: 0, playedMatches: 0 }
  )

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <ShieldCheck className="h-4 w-4" />
              Panel administrativo
            </div>
            <div>
              <h1 className="font-serif text-3xl font-semibold text-foreground">Gestión del torneo</h1>
              <p className="text-muted-foreground">
                Acá ves el estado general del torneo y las disciplinas cargadas en la base. SIMPLE, claro y mantenible.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/">Ver vista participante</Link>
            </Button>
            {isAdmin ? (
              <form action={logout}>
                <Button type="submit" variant="outline" className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </Button>
              </form>
            ) : null}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Disciplinas", value: totals.disciplines, icon: Trophy },
            { label: "Equipos/Parejas", value: totals.teams, icon: Users },
            { label: "Partidos", value: totals.matches, icon: Calendar },
            { label: "Jugados", value: totals.playedMatches, icon: Activity },
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

        <Card>
          <CardHeader>
            <CardTitle>Disciplinas registradas</CardTitle>
            <CardDescription>
              Esto sale de Prisma, no humo visual. Si no hay registros, primero hay que poblar la base.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {disciplines.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
                No hay disciplinas cargadas todavía.
              </div>
            ) : (
              <div className="space-y-4">
                {disciplines.map((discipline) => {
                  const playedMatches = discipline.matches.filter((match) => match.played).length
                  return (
                    <div
                      key={discipline.id}
                      className="flex flex-col gap-4 rounded-2xl border border-border p-5 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold text-foreground">{discipline.name}</h2>
                          <Badge variant="secondary">{discipline.slug}</Badge>
                          <Badge variant="outline">{discipline.tournament.name}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {discipline.format || "Formato sin definir"} · {discipline.tournament.year}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground md:grid-cols-4">
                        <div>
                          <p className="font-medium text-foreground">{discipline._count.teams}</p>
                          <p>Equipos</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{discipline.playersCount ?? "—"}</p>
                          <p>Jugadores</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{discipline._count.matches}</p>
                          <p>Partidos</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{playedMatches}</p>
                          <p>Jugados</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
