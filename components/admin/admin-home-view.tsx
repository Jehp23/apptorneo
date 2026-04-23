"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Activity, ArrowRight, Calendar, LogOut, Pencil, Plus, Settings2, Trophy, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Team {
  id: string
  players: { id: string }[]
}

interface Match {
  id: string
  played: boolean
}

interface Discipline {
  id: string
  name: string
  slug: string
  format?: string | null
  teamsCount?: number | null
  playersCount?: number | null
  teams: Team[]
  matches: Match[]
  tournamentId: string
}

interface Tournament {
  id: string
  name: string
  location: string
  year: number
  status: string
}

export interface AdminHomeViewProps {
  tournament: Tournament | null
  initialDisciplines: Discipline[]
}

function getMatchStatus(matches: Match[]) {
  if (matches.length === 0) return { label: "Sin fixture", tone: "outline" as const }
  const played = matches.filter((m) => m.played).length
  if (played === 0) return { label: "Pendiente", tone: "secondary" as const }
  if (played === matches.length) return { label: "Finalizado", tone: "default" as const }
  return { label: "En curso", tone: "secondary" as const }
}

function getRegistrationStatus(discipline: Discipline) {
  const occupied = discipline.teams.length
  const cap = discipline.teamsCount ?? null

  if (cap == null || cap <= 0) {
    return {
      label: "Abierto",
      tone: "outline" as const,
      helper: "Sin cupo definido",
      occupied,
      remaining: null as number | null,
      isFull: false,
    }
  }

  const remaining = Math.max(cap - occupied, 0)

  if (occupied >= cap) {
    return {
      label: "Completo",
      tone: "default" as const,
      helper: "No quedan lugares",
      occupied,
      remaining,
      isFull: true,
    }
  }

  return {
    label: "Abierto",
    tone: "secondary" as const,
    helper: `${remaining} lugar${remaining === 1 ? "" : "es"} disponible${remaining === 1 ? "" : "s"}`,
    occupied,
    remaining,
    isFull: false,
  }
}

export function AdminHomeView({ tournament, initialDisciplines }: AdminHomeViewProps) {
  const [disciplines, setDisciplines] = useState(initialDisciplines)
  const [newDisciplineOpen, setNewDisciplineOpen] = useState(false)
  const [editTournament, setEditTournament] = useState(false)
  const [quickAddDiscipline, setQuickAddDiscipline] = useState<Discipline | null>(null)
  const [capacityDiscipline, setCapacityDiscipline] = useState<Discipline | null>(null)

  const totalParticipants = useMemo(
    () => disciplines.reduce((acc, d) => acc + d.teams.reduce((a, t) => a + t.players.length, 0), 0),
    [disciplines],
  )
  const totalMatches = useMemo(() => disciplines.reduce((acc, d) => acc + d.matches.length, 0), [disciplines])
  const playedMatches = useMemo(
    () => disciplines.reduce((acc, d) => acc + d.matches.filter((m) => m.played).length, 0),
    [disciplines],
  )

  function onDisciplineCreated(discipline: Discipline) {
    setDisciplines((prev) => [discipline, ...prev])
  }

  function onDisciplinePatched(updated: Discipline) {
    setDisciplines((prev) => prev.map((discipline) => (discipline.id === updated.id ? updated : discipline)))
  }

  function onTeamAdded(disciplineId: string, team: Team) {
    setDisciplines((prev) =>
      prev.map((discipline) =>
        discipline.id === disciplineId
          ? { ...discipline, teams: [...discipline.teams, team] }
          : discipline,
      ),
    )
  }

  function onTournamentUpdated(_: Tournament) {
    // la página refresca estado del torneo en la próxima navegación
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Panel admin</p>
            <h1 className="mt-0.5 text-2xl font-bold text-foreground">{tournament?.name ?? "Torneo"}</h1>
            {tournament ? (
              <p className="text-sm text-muted-foreground">
                {tournament.location} · {tournament.year}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {tournament ? (
              <button
                onClick={() => setEditTournament(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
              </button>
            ) : null}
            <Link
              href="/torneo"
              className="rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Ver público
            </Link>
            <Link
              href="/api/admin/auth/logout"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Deportes", value: disciplines.length, icon: Trophy },
            { label: "Participantes", value: totalParticipants, icon: Users },
            { label: "Partidos", value: totalMatches, icon: Calendar },
            { label: "Jugados", value: playedMatches, icon: Activity },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold text-foreground">{item.value}</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-2">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Deportes</h2>
              <p className="text-sm text-muted-foreground">Cargá participantes sin entrar a menús raros. Ese es el punto.</p>
            </div>
            <button
              onClick={() => setNewDisciplineOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <Plus className="h-4 w-4" /> Nuevo deporte
            </button>
          </div>

          {disciplines.length === 0 ? (
            <button
              onClick={() => setNewDisciplineOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 py-10 text-base font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/10"
            >
              <Plus className="h-5 w-5" /> Crear el primer deporte
            </button>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {disciplines.map((discipline) => {
                const matchStatus = getMatchStatus(discipline.matches)
                const registration = getRegistrationStatus(discipline)
                const players = discipline.teams.reduce((acc, team) => acc + team.players.length, 0)
                const pendingCount = discipline.matches.filter((match) => !match.played).length

                return (
                  <article
                    key={discipline.id}
                    className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{discipline.name}</h3>
                        {discipline.format ? (
                          <p className="text-sm text-muted-foreground">{discipline.format}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Badge variant={registration.tone}>{registration.label}</Badge>
                        <Badge variant={matchStatus.tone}>{matchStatus.label}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                      <StatChip label="Cupo" value={discipline.teamsCount ?? "Libre"} />
                      <StatChip label="Inscriptos" value={registration.occupied} />
                      <StatChip label="Faltan" value={registration.remaining ?? "—"} tone={registration.isFull ? "success" : "default"} />
                      <StatChip label="Pendientes" value={pendingCount} tone={pendingCount > 0 ? "warning" : "default"} />
                    </div>

                    <div className="rounded-2xl bg-muted/40 p-3 text-sm">
                      <div className="flex items-center justify-between gap-2 text-foreground">
                        <span className="font-semibold">Carga rápida</span>
                        <span className="text-xs text-muted-foreground">
                          {players} jugador{players === 1 ? "" : "es"} en total
                        </span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{registration.helper}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setQuickAddDiscipline(discipline)}
                        disabled={registration.isFull}
                        className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Agregar inscripción
                      </button>
                      <button
                        onClick={() => setCapacityDiscipline(discipline)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <Settings2 className="h-4 w-4" /> Ajustar cupo
                      </button>
                      <Link
                        href={`/admin/${discipline.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        Gestionar
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {tournament ? (
        <EditTournamentDialog
          tournament={tournament}
          open={editTournament}
          onClose={() => setEditTournament(false)}
          onSaved={onTournamentUpdated}
        />
      ) : null}

      <NewDisciplineDialog
        open={newDisciplineOpen}
        tournamentId={tournament?.id ?? ""}
        onClose={() => setNewDisciplineOpen(false)}
        onCreated={onDisciplineCreated}
      />

      {quickAddDiscipline ? (
        <QuickRegistrationDialog
          discipline={quickAddDiscipline}
          onClose={() => setQuickAddDiscipline(null)}
          onCreated={(team) => onTeamAdded(quickAddDiscipline.id, team)}
        />
      ) : null}

      {capacityDiscipline ? (
        <CapacityDialog
          discipline={capacityDiscipline}
          onClose={() => setCapacityDiscipline(null)}
          onSaved={onDisciplinePatched}
        />
      ) : null}
    </div>
  )
}

function StatChip({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string | number
  tone?: "default" | "warning" | "success"
}) {
  const toneClass =
    tone === "warning"
      ? "text-amber-600"
      : tone === "success"
        ? "text-emerald-600"
        : "text-foreground"

  return (
    <div className="rounded-xl bg-muted/40 px-3 py-2 text-center">
      <p className={`text-xl font-bold ${toneClass}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function EditTournamentDialog({
  tournament,
  open,
  onClose,
  onSaved,
}: {
  tournament: Tournament
  open: boolean
  onClose: () => void
  onSaved: (t: Tournament) => void
}) {
  const [form, setForm] = useState({
    name: tournament.name,
    location: tournament.location,
    year: tournament.year.toString(),
    status: tournament.status,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError("")
    try {
      const response = await fetch(`/api/tournaments/${tournament.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, year: Number(form.year) }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      onSaved(data)
      onClose()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader><DialogTitle>Editar torneo</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <input
            required
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Nombre"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <input
            required
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Ubicación"
            value={form.location}
            onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="number"
              className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
              value={form.year}
              onChange={(event) => setForm((current) => ({ ...current, year: event.target.value }))}
            />
            <select
              className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="active">Activo</option>
              <option value="draft">Borrador</option>
              <option value="completed">Finalizado</option>
            </select>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-border py-3 text-base font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 rounded-2xl bg-primary py-3 text-base font-bold text-primary-foreground disabled:opacity-40">
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function NewDisciplineDialog({
  open,
  tournamentId,
  onClose,
  onCreated,
}: {
  open: boolean
  tournamentId: string
  onClose: () => void
  onCreated: (discipline: Discipline) => void
}) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    format: "",
    teamsCount: "",
    playersCount: "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function reset() {
    setForm({ name: "", slug: "", format: "", teamsCount: "", playersCount: "" })
    setError("")
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError("")
    try {
      const response = await fetch("/api/disciplines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId,
          name: form.name,
          slug: form.slug || undefined,
          format: form.format || undefined,
          teamsCount: form.teamsCount ? Number(form.teamsCount) : undefined,
          playersCount: form.playersCount ? Number(form.playersCount) : undefined,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      onCreated({
        id: data.id,
        name: data.name,
        slug: data.slug,
        format: data.format,
        teamsCount: data.teamsCount,
        playersCount: data.playersCount,
        tournamentId,
        teams: [],
        matches: [],
      })
      reset()
      onClose()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al crear")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) { reset(); onClose() } }}>
      <DialogContent className="sm:max-w-xs" onOpenAutoFocus={reset}>
        <DialogHeader><DialogTitle>Nuevo deporte</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <input
            required
            autoFocus
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-4 text-xl outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Nombre (ej: Fútbol 5)"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <input
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Formato (ej: Grupos + eliminatoria)"
            value={form.format}
            onChange={(event) => setForm((current) => ({ ...current, format: event.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min="1"
              className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
              placeholder="Cupo"
              value={form.teamsCount}
              onChange={(event) => setForm((current) => ({ ...current, teamsCount: event.target.value }))}
            />
            <input
              type="number"
              min="1"
              className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
              placeholder="Jug./equipo"
              value={form.playersCount}
              onChange={(event) => setForm((current) => ({ ...current, playersCount: event.target.value }))}
            />
          </div>
          <input
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Slug (ej: futbol-5) — opcional"
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2">
            <button type="button" onClick={() => { reset(); onClose() }} className="flex-1 rounded-2xl border border-border py-3 text-base font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={saving || !form.name.trim()} className="flex-1 rounded-2xl bg-primary py-3 text-base font-bold text-primary-foreground disabled:opacity-40">
              {saving ? "..." : "Crear"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function QuickRegistrationDialog({
  discipline,
  onClose,
  onCreated,
}: {
  discipline: Discipline
  onClose: () => void
  onCreated: (team: Team) => void
}) {
  const [name, setName] = useState("")
  const [players, setPlayers] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/disciplines/${discipline.slug}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type: players.trim() ? "TEAM" : "SINGLE",
          players: players
            .split("\n")
            .map((player) => ({ name: player.trim() }))
            .filter((player) => player.name),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      onCreated({ id: data.id, players: data.players ?? [] })
      onClose()
      setName("")
      setPlayers("")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "No se pudo inscribir")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Carga rápida · {discipline.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <input
            required
            autoFocus
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-4 text-lg outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Nombre del equipo / pareja / participante"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <textarea
            className="min-h-28 w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base font-mono outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder={"Jugadores (opcional)\nuno por línea"}
            value={players}
            onChange={(event) => setPlayers(event.target.value)}
          />
          <p className="px-1 text-xs text-muted-foreground">
            Ideal para cargar durante el día sin entrar a la gestión completa.
          </p>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-border py-3 text-base font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={saving || !name.trim()} className="flex-1 rounded-2xl bg-primary py-3 text-base font-bold text-primary-foreground disabled:opacity-40">
              {saving ? "Guardando..." : "Agregar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CapacityDialog({
  discipline,
  onClose,
  onSaved,
}: {
  discipline: Discipline
  onClose: () => void
  onSaved: (discipline: Discipline) => void
}) {
  const [teamsCount, setTeamsCount] = useState(discipline.teamsCount?.toString() ?? "")
  const [playersCount, setPlayersCount] = useState(discipline.playersCount?.toString() ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/disciplines/${discipline.slug}/admin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamsCount: teamsCount ? Number(teamsCount) : null,
          playersCount: playersCount ? Number(playersCount) : null,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      onSaved({
        ...discipline,
        teamsCount: data.teamsCount,
        playersCount: data.playersCount,
      })
      onClose()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "No se pudo guardar el cupo")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Ajustar cupo · {discipline.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <input
            type="number"
            min="1"
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
            placeholder="Cupo de equipos / parejas"
            value={teamsCount}
            onChange={(event) => setTeamsCount(event.target.value)}
          />
          <input
            type="number"
            min="1"
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
            placeholder="Jugadores por equipo (opcional)"
            value={playersCount}
            onChange={(event) => setPlayersCount(event.target.value)}
          />
          <p className="px-1 text-xs text-muted-foreground">
            Si dejás el cupo vacío, la disciplina queda abierta sin límite duro.
          </p>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-border py-3 text-base font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 rounded-2xl bg-primary py-3 text-base font-bold text-primary-foreground disabled:opacity-40">
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
