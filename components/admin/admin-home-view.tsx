"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Activity, ArrowRight, Calendar, Check, LogOut, Minus,
  Pencil, Plus, Trophy, Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminPlayer { id: string; name: string; seniority?: number | null }
interface AdminTeam   { id: string; name: string; type: string; group?: string | null; players: AdminPlayer[] }
interface AdminMatch  {
  id: string; score1?: number | null; score2?: number | null
  played: boolean; stage?: string | null; date?: string | null
  team1?: { id: string; name: string } | null
  team2?: { id: string; name: string } | null
}
interface AdminDiscipline {
  id: string; name: string; slug: string
  format?: string | null; details?: string | null
  playersCount?: number | null; teamsCount?: number | null
  tournamentId: string; tournamentName: string; tournamentYear: number
  teams: AdminTeam[]; matches: AdminMatch[]
}
interface AdminTournament {
  id: string; name: string; location: string; year: number; status: string
  disciplines: Array<{ id: string; name: string; slug: string }>
}

export interface AdminHomeViewProps {
  initialTournaments: AdminTournament[]
  initialDisciplines: AdminDiscipline[]
}

function getDisciplineStatus(matches: AdminMatch[]) {
  if (matches.length === 0) return { label: "Armando fixture", tone: "outline" as const }
  const played = matches.filter((m) => m.played).length
  if (played === 0) return { label: "Pendiente", tone: "secondary" as const }
  if (played === matches.length) return { label: "Finalizado", tone: "default" as const }
  return { label: "En curso", tone: "secondary" as const }
}

function formatDate(date: string | null | undefined) {
  if (!date) return "Sin horario"
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(date))
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminHomeView({ initialTournaments, initialDisciplines }: AdminHomeViewProps) {
  const [tournaments,   setTournaments]   = useState(initialTournaments)
  const [disciplines,   setDisciplines]   = useState(initialDisciplines)
  const [activeTournamentId, setActiveTournamentId] = useState(
    () => initialTournaments.find((t) => t.status === "active")?.id ?? initialTournaments[0]?.id ?? ""
  )

  // dialogs
  const [editingTournament,   setEditingTournament]   = useState<AdminTournament | null>(null)
  const [newTournamentOpen,   setNewTournamentOpen]   = useState(false)
  const [editingDiscipline,   setEditingDiscipline]   = useState<AdminDiscipline | null>(null)
  const [newDisciplineOpen,   setNewDisciplineOpen]   = useState(false)
  const [scheduleMatchOpen,   setScheduleMatchOpen]   = useState(false)
  const [scoringMatch,        setScoringMatch]        = useState<AdminMatch & { disciplineSlug: string } | null>(null)

  // derived
  const activeTournament = useMemo(
    () => tournaments.find((t) => t.id === activeTournamentId) ?? tournaments[0] ?? null,
    [tournaments, activeTournamentId]
  )

  const activeDisciplines = useMemo(
    () => disciplines.filter((d) => d.tournamentId === activeTournament?.id),
    [disciplines, activeTournament]
  )

  const totalParticipants = activeDisciplines.reduce(
    (acc, d) => acc + d.teams.reduce((a, t) => a + t.players.length, 0), 0
  )
  const totalMatches  = activeDisciplines.reduce((acc, d) => acc + d.matches.length, 0)
  const playedMatches = activeDisciplines.reduce((acc, d) => acc + d.matches.filter((m) => m.played).length, 0)

  const upcomingMatches = useMemo(
    () => activeDisciplines.flatMap((d) =>
      d.matches.filter((m) => !m.played).map((m) => ({ ...m, disciplineName: d.name, disciplineSlug: d.slug }))
    ).slice(0, 5),
    [activeDisciplines]
  )

  const recentResults = useMemo(
    () => activeDisciplines.flatMap((d) =>
      d.matches.filter((m) => m.played).map((m) => ({ ...m, disciplineName: d.name, disciplineSlug: d.slug }))
    ).slice(0, 5),
    [activeDisciplines]
  )

  // handlers
  function onTournamentUpdated(updated: AdminTournament) {
    setTournaments((prev) => prev.map((t) => t.id === updated.id ? { ...t, ...updated } : t))
  }

  function onTournamentCreated(created: AdminTournament) {
    setTournaments((prev) => [{ ...created, disciplines: [] }, ...prev])
    setActiveTournamentId(created.id)
  }

  function onDisciplineUpdated(updated: AdminDiscipline) {
    setDisciplines((prev) => prev.map((d) => d.id === updated.id ? { ...d, ...updated } : d))
  }

  function onDisciplineCreated(created: AdminDiscipline) {
    setDisciplines((prev) => [created, ...prev])
    setTournaments((prev) => prev.map((t) =>
      t.id === created.tournamentId
        ? { ...t, disciplines: [...t.disciplines, { id: created.id, name: created.name, slug: created.slug }] }
        : t
    ))
  }

  function onMatchScheduled(disciplineSlug: string, match: AdminMatch) {
    setDisciplines((prev) => prev.map((d) =>
      d.slug === disciplineSlug ? { ...d, matches: [...d.matches, match] } : d
    ))
  }

  function onMatchUpdated(disciplineSlug: string, updated: AdminMatch) {
    setDisciplines((prev) => prev.map((d) =>
      d.slug === disciplineSlug
        ? { ...d, matches: d.matches.map((m) => m.id === updated.id ? { ...m, ...updated } : m) }
        : d
    ))
  }

  return (
    <div className="space-y-8 p-8">
      {/* ── Header ── */}
      <header className="rounded-3xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            {activeTournament ? (
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                {activeTournament.name} · {activeTournament.location} · {activeTournament.year}
              </p>
            ) : null}
            <h1 className="font-serif text-3xl font-semibold text-foreground">Panel admin</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeTournament ? (
              <button
                onClick={() => setEditingTournament(activeTournament)}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Pencil className="h-4 w-4" /> Editar torneo
              </button>
            ) : null}
            <button
              onClick={() => setNewTournamentOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <Plus className="h-4 w-4" /> Nuevo torneo
            </button>
            <Link
              href="/torneo"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Vista pública
            </Link>
            <Link
              href="/api/admin/auth/logout"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Salir
            </Link>
          </div>
        </div>
      </header>

      {/* ── Selector de torneo ── */}
      {tournaments.length > 0 ? (
        <section className="flex flex-wrap gap-3">
          {tournaments.map((t) => {
            const isActive = t.id === activeTournamentId
            return (
              <button
                key={t.id}
                onClick={() => setActiveTournamentId(t.id)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                  isActive ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                <div className="font-semibold">{t.name}</div>
                <div className={`text-xs ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {t.location} · {t.year}
                </div>
              </button>
            )
          })}
        </section>
      ) : null}

      {/* ── Stats ── */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: "Disciplinas",   value: activeDisciplines.length, icon: Trophy },
          { label: "Participantes", value: totalParticipants,        icon: Users },
          { label: "Partidos",      value: totalMatches,             icon: Calendar },
          { label: "Jugados",       value: playedMatches,            icon: Activity },
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

      {/* ── Disciplinas + partidos ── */}
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Disciplinas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Disciplinas</h2>
              <p className="text-sm text-muted-foreground">Hacé clic en una disciplina para gestionar participantes y partidos.</p>
            </div>
            <button
              onClick={() => setNewDisciplineOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <Plus className="h-4 w-4" /> Nueva
            </button>
          </div>

          {activeDisciplines.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
              No hay disciplinas cargadas para este torneo todavía.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeDisciplines.map((discipline) => {
                const status  = getDisciplineStatus(discipline.matches)
                const players = discipline.teams.reduce((acc, t) => acc + t.players.length, 0)
                return (
                  <div key={discipline.id} className="relative group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm">
                    {/* edit button */}
                    <button
                      onClick={() => setEditingDiscipline(discipline)}
                      className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground opacity-0 transition-all group-hover:border-border group-hover:opacity-100 hover:border-primary hover:text-primary"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    <Link href={`/torneo/${discipline.slug}`} className="block">
                      <div className="flex items-start justify-between gap-3 pr-8">
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
                        Gestionar
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Próximos + Resultados */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between p-6 pb-0">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Próximos partidos</h2>
                <p className="text-sm text-muted-foreground">Pendientes del torneo activo.</p>
              </div>
              <button
                onClick={() => setScheduleMatchOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              >
                <Plus className="h-4 w-4" /> Programar
              </button>
            </div>
            <CardContent className="pt-4">
              {upcomingMatches.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No hay próximos partidos cargados.
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingMatches.map((match) => (
                    <button
                      key={match.id}
                      onClick={() => setScoringMatch({ ...match, disciplineSlug: match.disciplineSlug })}
                      className="w-full rounded-2xl border border-border p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <p className="text-xs text-muted-foreground">{match.disciplineName}</p>
                      <p className="text-base font-semibold text-foreground">
                        {match.team1?.name ?? "Por definir"} vs {match.team2?.name ?? "Por definir"}
                      </p>
                      <p className="text-sm text-primary">{formatDate(match.date)}</p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <div className="p-6 pb-0">
              <h2 className="text-lg font-semibold text-foreground">Resultados recientes</h2>
              <p className="text-sm text-muted-foreground">Últimos cierres cargados.</p>
            </div>
            <CardContent className="pt-4">
              {recentResults.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  Todavía no hay resultados cerrados.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => setScoringMatch({ ...result, disciplineSlug: result.disciplineSlug })}
                      className="w-full rounded-2xl border border-border p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <p className="text-xs text-muted-foreground">{result.disciplineName}</p>
                      <p className="text-base font-semibold text-foreground">
                        {result.team1?.name ?? "Por definir"}{" "}
                        <span className="text-primary">{result.score1 ?? 0} - {result.score2 ?? 0}</span>{" "}
                        {result.team2?.name ?? "Por definir"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Dialogs ── */}

      <TournamentDialog
        tournament={editingTournament}
        open={!!editingTournament}
        onClose={() => setEditingTournament(null)}
        onSaved={onTournamentUpdated}
      />

      <TournamentDialog
        tournament={null}
        open={newTournamentOpen}
        onClose={() => setNewTournamentOpen(false)}
        onSaved={onTournamentCreated}
      />

      <DisciplineDialog
        discipline={editingDiscipline}
        open={!!editingDiscipline}
        tournaments={tournaments}
        defaultTournamentId={activeTournamentId}
        onClose={() => setEditingDiscipline(null)}
        onSaved={onDisciplineUpdated}
      />

      <DisciplineDialog
        discipline={null}
        open={newDisciplineOpen}
        tournaments={tournaments}
        defaultTournamentId={activeTournamentId}
        onClose={() => setNewDisciplineOpen(false)}
        onSaved={onDisciplineCreated}
      />

      <ScheduleMatchDialog
        open={scheduleMatchOpen}
        disciplines={activeDisciplines}
        onClose={() => setScheduleMatchOpen(false)}
        onSaved={onMatchScheduled}
      />

      {scoringMatch ? (
        <ScoreDialog
          match={scoringMatch}
          onClose={() => setScoringMatch(null)}
          onUpdate={(updated) => {
            onMatchUpdated(scoringMatch.disciplineSlug, updated)
            setScoringMatch(null)
          }}
        />
      ) : null}
    </div>
  )
}

// ─── Tournament dialog (create / edit) ────────────────────────────────────────

function TournamentDialog({
  tournament, open, onClose, onSaved,
}: {
  tournament: AdminTournament | null
  open: boolean
  onClose: () => void
  onSaved: (t: AdminTournament) => void
}) {
  const [form, setForm]     = useState({ name: "", location: "", year: new Date().getFullYear().toString(), status: "active" })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState("")

  function init() {
    setForm(tournament
      ? { name: tournament.name, location: tournament.location, year: tournament.year.toString(), status: tournament.status }
      : { name: "", location: "", year: new Date().getFullYear().toString(), status: "active" }
    )
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const isEdit = !!tournament
      const res = await fetch(
        isEdit ? `/api/tournaments/${tournament!.id}` : "/api/tournaments",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, year: Number(form.year) }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al guardar")
      onSaved({ ...data, disciplines: tournament?.disciplines ?? [] })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }} >
      <DialogContent className="sm:max-w-sm" onOpenAutoFocus={init}>
        <DialogHeader>
          <DialogTitle>{tournament ? "Editar torneo" : "Nuevo torneo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <input required className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Nombre del torneo" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input required className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Ubicación" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <input required type="number" className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
              placeholder="Año" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} />
            <select className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
              value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="active">Activo</option>
              <option value="draft">Borrador</option>
              <option value="completed">Finalizado</option>
            </select>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-border py-3 text-base font-medium">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-2xl bg-primary py-3 text-base font-bold text-primary-foreground disabled:opacity-40">
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Discipline dialog (create / edit) ────────────────────────────────────────

function DisciplineDialog({
  discipline, open, tournaments, defaultTournamentId, onClose, onSaved,
}: {
  discipline: AdminDiscipline | null
  open: boolean
  tournaments: AdminTournament[]
  defaultTournamentId: string
  onClose: () => void
  onSaved: (d: AdminDiscipline) => void
}) {
  const [form, setForm]     = useState({ tournamentId: defaultTournamentId, name: "", slug: "", format: "", details: "", teamsCount: "", playersCount: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState("")

  function init() {
    setForm(discipline
      ? {
          tournamentId: discipline.tournamentId,
          name:         discipline.name,
          slug:         discipline.slug,
          format:       discipline.format ?? "",
          details:      discipline.details ?? "",
          teamsCount:   discipline.teamsCount?.toString() ?? "",
          playersCount: discipline.playersCount?.toString() ?? "",
        }
      : { tournamentId: defaultTournamentId, name: "", slug: "", format: "", details: "", teamsCount: "", playersCount: "" }
    )
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const isEdit = !!discipline
      const res = await fetch(
        isEdit ? `/api/disciplines/${discipline!.slug}/admin` : "/api/disciplines",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tournamentId: form.tournamentId,
            name:         form.name,
            slug:         form.slug || undefined,
            format:       form.format || undefined,
            details:      form.details || undefined,
            teamsCount:   form.teamsCount ? Number(form.teamsCount) : null,
            playersCount: form.playersCount ? Number(form.playersCount) : null,
          }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al guardar")

      const tournament = tournaments.find((t) => t.id === (isEdit ? discipline!.tournamentId : form.tournamentId))
      onSaved({
        id:              data.id,
        name:            data.name,
        slug:            data.slug,
        format:          data.format,
        details:         data.details,
        teamsCount:      data.teamsCount,
        playersCount:    data.playersCount,
        tournamentId:    isEdit ? discipline!.tournamentId : form.tournamentId,
        tournamentName:  tournament?.name ?? "",
        tournamentYear:  tournament?.year ?? new Date().getFullYear(),
        teams:           discipline?.teams ?? [],
        matches:         discipline?.matches ?? [],
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-sm" onOpenAutoFocus={init}>
        <DialogHeader>
          <DialogTitle>{discipline ? "Editar disciplina" : "Nueva disciplina"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          {!discipline ? (
            <select required className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
              value={form.tournamentId} onChange={(e) => setForm((f) => ({ ...f, tournamentId: e.target.value }))}>
              <option value="">Seleccioná torneo</option>
              {tournaments.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.year}</option>)}
            </select>
          ) : null}
          <input required className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Nombre (ej: Fútbol 5)" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          {!discipline ? (
            <input className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
              placeholder="Slug (ej: futbol-5)" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
          ) : null}
          <input className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Formato (ej: Grupos + eliminatorias)" value={form.format} onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))} />
          <textarea className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground min-h-20"
            placeholder="Detalles / reglas (opcional)" value={form.details} onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
              placeholder="Cupo equipos" value={form.teamsCount} onChange={(e) => setForm((f) => ({ ...f, teamsCount: e.target.value }))} />
            <input type="number" className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
              placeholder="Jugadores" value={form.playersCount} onChange={(e) => setForm((f) => ({ ...f, playersCount: e.target.value }))} />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-border py-3 text-base font-medium">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-2xl bg-primary py-3 text-base font-bold text-primary-foreground disabled:opacity-40">
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Schedule match dialog ────────────────────────────────────────────────────

function ScheduleMatchDialog({
  open, disciplines, onClose, onSaved,
}: {
  open: boolean
  disciplines: AdminDiscipline[]
  onClose: () => void
  onSaved: (disciplineSlug: string, match: AdminMatch) => void
}) {
  const [form, setForm]     = useState({ disciplineSlug: "", team1Id: "", team2Id: "", stage: "", date: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState("")

  const selectedDiscipline = disciplines.find((d) => d.slug === form.disciplineSlug)

  function reset() { setForm({ disciplineSlug: disciplines[0]?.slug ?? "", team1Id: "", team2Id: "", stage: "", date: "" }); setError("") }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.team1Id || !form.team2Id || form.team1Id === form.team2Id) {
      setError("Elegí dos equipos distintos."); return
    }
    setSaving(true); setError("")
    try {
      const res = await fetch(`/api/disciplines/${form.disciplineSlug}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team1Id: form.team1Id, team2Id: form.team2Id, stage: form.stage || undefined, date: form.date || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al guardar")
      const t1 = selectedDiscipline?.teams.find((t) => t.id === form.team1Id)
      const t2 = selectedDiscipline?.teams.find((t) => t.id === form.team2Id)
      onSaved(form.disciplineSlug, {
        id: data.id, score1: null, score2: null, played: false,
        stage: data.stage ?? null, date: data.date ?? null,
        team1: t1 ? { id: t1.id, name: t1.name } : null,
        team2: t2 ? { id: t2.id, name: t2.name } : null,
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-sm" onOpenAutoFocus={reset}>
        <DialogHeader><DialogTitle>Programar partido</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <select required className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
            value={form.disciplineSlug}
            onChange={(e) => setForm({ disciplineSlug: e.target.value, team1Id: "", team2Id: "", stage: "", date: "" })}>
            <option value="">Seleccioná disciplina</option>
            {disciplines.map((d) => <option key={d.id} value={d.slug}>{d.name}</option>)}
          </select>
          <select required className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
            value={form.team1Id} onChange={(e) => setForm((f) => ({ ...f, team1Id: e.target.value }))}>
            <option value="">Equipo 1...</option>
            {selectedDiscipline?.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select required className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
            value={form.team2Id} onChange={(e) => setForm((f) => ({ ...f, team2Id: e.target.value }))}>
            <option value="">Equipo 2...</option>
            {selectedDiscipline?.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Fase (ej: Grupo A / Semifinal)" value={form.stage} onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))} />
          <input type="datetime-local" className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
            value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-border py-3 text-base font-medium">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-2xl bg-primary py-3 text-base font-bold text-primary-foreground disabled:opacity-40">
              {saving ? "Guardando..." : "Crear partido"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Score dialog ─────────────────────────────────────────────────────────────

function ScoreDialog({
  match, onClose, onUpdate,
}: {
  match: AdminMatch
  onClose: () => void
  onUpdate: (updated: AdminMatch) => void
}) {
  const [score1, setScore1] = useState(match.score1 ?? 0)
  const [score2, setScore2] = useState(match.score2 ?? 0)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState("")

  async function save(played: boolean) {
    setSaving(true); setError("")
    try {
      const res  = await fetch(`/api/admin/matches/${match.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score1, score2, played }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onUpdate({ ...match, score1: data.score1, score2: data.score2, played: data.played })
    } catch { setError("No se pudo guardar.") }
    finally  { setSaving(false) }
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-base font-semibold text-muted-foreground">
            {match.team1?.name ?? "—"} vs {match.team2?.name ?? "—"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 items-center gap-4 py-2">
          {[
            { score: score1, set: setScore1, name: match.team1?.name },
            null,
            { score: score2, set: setScore2, name: match.team2?.name },
          ].map((side, i) =>
            !side ? (
              <div key={i} className="text-center text-2xl font-black text-muted-foreground">—</div>
            ) : (
              <div key={i} className="flex flex-col items-center gap-3">
                <p className="w-full truncate text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {side.name}
                </p>
                <button type="button" onClick={() => side.set((s) => s + 1)}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary bg-primary/10 text-primary active:scale-95 transition-transform">
                  <Plus className="h-7 w-7" />
                </button>
                <span className="text-6xl font-black tabular-nums">{side.score}</span>
                <button type="button" onClick={() => side.set((s) => Math.max(0, s - 1))}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-border bg-background text-foreground active:scale-95 transition-transform">
                  <Minus className="h-7 w-7" />
                </button>
              </div>
            )
          )}
        </div>
        {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}
        <div className="flex gap-2 pt-2">
          <button type="button" disabled={saving} onClick={() => save(false)}
            className="flex-1 rounded-2xl border border-border py-3.5 text-base font-semibold disabled:opacity-40">
            Guardar
          </button>
          <button type="button" disabled={saving} onClick={() => save(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-base font-bold text-white hover:bg-emerald-700 disabled:opacity-40">
            <Check className="h-5 w-5" /> Cerrar partido
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
