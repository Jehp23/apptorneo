import Link from "next/link"
import { cookies } from "next/headers"
import { Activity, Calendar, LogOut, MonitorPlay, ShieldCheck, Trophy, Users } from "lucide-react"

import { AdminWorkbench } from "@/components/admin/admin-workbench"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
    orderBy: {
      createdAt: "desc",
    },
  })

  const disciplines = await prisma.discipline.findMany({
    include: {
      tournament: {
        select: {
          id: true,
          name: true,
          year: true,
        },
      },
      teams: {
        include: {
          players: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      matches: {
        include: {
          team1: {
            select: {
              id: true,
              name: true,
            },
          },
          team2: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const totals = disciplines.reduce(
    (acc, discipline) => {
      acc.disciplines += 1
      acc.teams += discipline.teams.length
      acc.matches += discipline.matches.length
      acc.playedMatches += discipline.matches.filter((match) => match.played).length
      return acc
    },
    { disciplines: 0, teams: 0, matches: 0, playedMatches: 0 }
  )

  const normalizedDisciplines = disciplines.map((discipline) => ({
    id: discipline.id,
    name: discipline.name,
    slug: discipline.slug,
    format: discipline.format,
    details: discipline.details,
    playersCount: discipline.playersCount,
    teamsCount: discipline.teamsCount,
    tournamentId: discipline.tournament.id,
    tournamentName: discipline.tournament.name,
    tournamentYear: discipline.tournament.year,
    teams: discipline.teams,
    matches: discipline.matches.map((match) => ({
      id: match.id,
      score1: match.score1,
      score2: match.score2,
      played: match.played,
      stage: match.stage,
      date: match.date ? match.date.toISOString() : null,
      team1: match.team1,
      team2: match.team2,
    })),
  }))

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <ShieldCheck className="h-4 w-4" />
              Panel administrativo
            </div>
            <div>
              <h1 className="font-serif text-3xl font-semibold text-foreground">Centro de operación</h1>
              <p className="text-muted-foreground">
                Acá administración inscribe participantes, arma disciplinas, programa partidos y carga resultados mientras el público mira otra experiencia.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/torneo">Vista participante</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pantalla">Modo pantalla</Link>
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
            { label: "Inscripciones", value: totals.teams, icon: Users },
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

        <section className="grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "Configuración",
              description: "Crear torneos y disciplinas para soportar simultaneidad real.",
            },
            {
              title: "Inscripciones",
              description: "Registrar equipos, parejas o participantes por disciplina.",
            },
            {
              title: "Operación",
              description: "Programar cruces y actualizar resultados en caliente.",
            },
          ].map((area) => (
            <div key={area.title} className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">{area.title}</h2>
                <Badge variant="secondary">Fase 2</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{area.description}</p>
            </div>
          ))}
        </section>

        <AdminWorkbench initialTournaments={tournaments} initialDisciplines={normalizedDisciplines} />

        <div className="flex justify-end">
          <Button asChild className="gap-2">
            <Link href="/pantalla">
              <MonitorPlay className="h-4 w-4" />
              Abrir pantalla grande
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
