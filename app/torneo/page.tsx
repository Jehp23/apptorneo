import Image from "next/image"
import Link from "next/link"
import { unstable_noStore as noStore } from "next/cache"
import { Activity, Calendar, Trophy, Users } from "lucide-react"

import { AdminHeaderActions } from "@/components/public/admin-header-actions"
import { LiveIndicator } from "@/components/live-indicator"
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
    timeZone: "America/Argentina/Buenos_Aires",
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
            <div className="relative h-24 w-24 shrink-0">
              <Image src="/logo.png" alt="Sanatorio El Carmen" fill className="object-contain" />
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
          <div className="flex items-center gap-3">
            <LiveIndicator />
            <AdminHeaderActions />
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

      {/* Disciplinas — acceso rápido */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">Deportes</h2>
          <span className="text-xs text-muted-foreground">{disciplines.length} disciplinas</span>
        </div>

        {disciplines.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No hay disciplinas cargadas todavía.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {disciplines.map((discipline) => {
              const status = getDisciplineStatus(discipline.matches)
              const played = discipline.matches.filter((m) => m.played).length
              const total = discipline.matches.length
              const progress = total > 0 ? Math.round((played / total) * 100) : 0
              const initials = discipline.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()

              return (
                <Link
                  key={discipline.id}
                  href={`/torneo/${discipline.slug}`}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md active:scale-[0.98]"
                >
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />

                  {/* Icono + status */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                      <span className="text-base font-black text-primary tracking-tight">{initials}</span>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      status.label === "En curso"
                        ? "bg-emerald-500/10 text-emerald-700"
                        : status.label === "Finalizado"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Nombre */}
                  <h2 className="mb-0.5 text-base font-bold leading-tight text-foreground">{discipline.name}</h2>
                  <p className="mb-4 text-xs text-muted-foreground leading-snug">{discipline.format || "Sin formato definido"}</p>

                  {/* Progress */}
                  {total > 0 ? (
                    <div className="space-y-1.5">
                      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {played}/{total} partidos jugados
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">Sin partidos cargados</p>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Próximos + Recientes */}
      {(upcomingMatches.length > 0 || recentResults.length > 0) && (
        <section className="grid gap-4 sm:grid-cols-2">
          {upcomingMatches.length > 0 && (
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="border-b border-border px-4 py-3.5">
                <h3 className="text-sm font-semibold text-foreground">Próximos partidos</h3>
              </div>
              <div className="divide-y divide-border/50">
                {upcomingMatches.map((match) => (
                  <div key={match.id} className="px-4 py-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-primary mb-0.5">{match.discipline}</p>
                    <p className="text-sm font-semibold text-foreground">{match.team1} <span className="font-normal text-muted-foreground">vs</span> {match.team2}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(match.date)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recentResults.length > 0 && (
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="border-b border-border px-4 py-3.5">
                <h3 className="text-sm font-semibold text-foreground">Resultados recientes</h3>
              </div>
              <div className="divide-y divide-border/50">
                {recentResults.map((result) => {
                  const w1 = result.score1 > result.score2
                  const w2 = result.score2 > result.score1
                  return (
                    <div key={result.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-3">
                      <span className={`text-sm text-right truncate ${w1 ? "font-bold text-foreground" : "text-muted-foreground"}`}>{result.team1}</span>
                      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 px-2 py-1">
                        <span className={`w-4 text-center font-mono font-bold text-sm ${w1 ? "text-primary" : "text-foreground"}`}>{result.score1}</span>
                        <span className="text-muted-foreground/40 text-[10px]">–</span>
                        <span className={`w-4 text-center font-mono font-bold text-sm ${w2 ? "text-primary" : "text-foreground"}`}>{result.score2}</span>
                      </div>
                      <span className={`text-sm text-left truncate ${w2 ? "font-bold text-foreground" : "text-muted-foreground"}`}>{result.team2}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
