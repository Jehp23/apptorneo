"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Activity, Calendar, LogOut, Pencil, Plus, Settings2, Trophy, Users } from "lucide-react"
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
  stage?: string | null
  score1?: number | null
  score2?: number | null
  team1?: { id: string; name: string } | null
  team2?: { id: string; name: string } | null
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
  if (matches.length === 0) return { label: "Sin fixture", className: "bg-muted text-muted-foreground border-border" }
  const played = matches.filter((m) => m.played).length
  if (played === 0) return { label: "Pendiente", className: "bg-amber-500/10 text-amber-700 border-amber-500/20" }
  if (played === matches.length) return { label: "Finalizado", className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" }
  return { label: "En curso", className: "bg-blue-500/10 text-blue-700 border-blue-500/20" }
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
  const [loggingOut, setLoggingOut] = useState(false)

  const totalParticipants = useMemo(
    () => disciplines.reduce((acc, d) => acc + d.teams.reduce((a, t) => a + t.players.length, 0), 0),
    [disciplines],
  )
  const totalMatches = useMemo(() => disciplines.reduce((acc, d) => acc + d.matches.length, 0), [disciplines])
  const playedMatches = useMemo(
    () => disciplines.reduce((acc, d) => acc + d.matches.filter((m) => m.played).length, 0),
    [disciplines],
  )

  const incompleteRegistrations = useMemo(
    () => disciplines.filter((d) => d.teamsCount && d.teams.length < d.teamsCount),
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

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } finally {
      window.location.assign("/admin/login")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl">
      <header className="flex flex-col gap-3 border-b border-border bg-card px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-semibold text-foreground">{tournament?.name ?? "Torneo"}</h1>
            {tournament ? (
              <p className="text-xs text-muted-foreground">{tournament.year}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {tournament ? (
            <button
              onClick={() => setEditTournament(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              <Pencil className="h-4 w-4" /> Editar
            </button>
          ) : null}
          <Link
            href="/torneo"
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Ver público
          </Link>
        </div>
      </header>

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Deportes", value: disciplines.length },
            { label: "Participantes", value: totalParticipants },
            { label: "Partidos", value: totalMatches },
            { label: "Jugados", value: playedMatches },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        {incompleteRegistrations.length > 0 && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <h3 className="mb-2 text-sm font-semibold text-amber-700">Qué falta</h3>
            <div className="space-y-1 text-sm text-amber-700">
              <p>{incompleteRegistrations.length} deporte{incompleteRegistrations.length === 1 ? "" : "s"} incompleto{incompleteRegistrations.length === 1 ? "" : "s"}</p>
            </div>
          </div>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Deportes</h2>
            <button
              onClick={() => setNewDisciplineOpen(true)}
              className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <Plus className="inline h-4 w-4 mr-1" /> Nuevo
            </button>
          </div>

          {disciplines.length === 0 ? (
            <button
              onClick={() => setNewDisciplineOpen(true)}
              className="w-full rounded-xl border-2 border-dashed border-border p-8 text-muted-foreground hover:border-primary/30"
            >
              Crear el primer deporte
            </button>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {disciplines.map((discipline) => {
                const matchStatus = getMatchStatus(discipline.matches)
                const registration = getRegistrationStatus(discipline)
                const players = discipline.teams.reduce((acc, team) => acc + team.players.length, 0)
                const pendingCount = discipline.matches.filter((match) => !match.played).length

                  return (
                    <a
                      key={discipline.id}
                      href={`/admin/${discipline.slug}`}
                      className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 active:scale-[0.98] transition-transform"
                    >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{discipline.name}</h3>
                        {discipline.format ? (
                          <p className="text-xs text-muted-foreground">{discipline.format}</p>
                        ) : null}
                      </div>
                      <div className="flex gap-1">
                        <Badge variant={registration.tone} className="text-xs">{registration.label}</Badge>
                        <Badge className={`text-xs ${matchStatus.className}`}>{matchStatus.label}</Badge>
                      </div>
                    </div>

                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>{registration.occupied}/{discipline.teamsCount || "∞"}</span>
                      <span>{players} jugadores</span>
                      <span>{pendingCount} pendientes</span>
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </section>
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
  const router = useRouter()
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
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, year: Number(form.year) }),
      })
      if (response.status === 401) {
        const next = encodeURIComponent(window.location.pathname)
        router.push(`/admin/login?next=${next}`)
        return
      }
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
      <DialogContent className="sm:max-w-xs max-h-[90vh] overflow-y-auto">
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
  const router = useRouter()
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
        credentials: "include",
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
      if (response.status === 401) {
        const next = encodeURIComponent(window.location.pathname)
        router.push(`/admin/login?next=${next}`)
        return
      }
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
  const router = useRouter()
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
        credentials: "include",
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
      if (response.status === 401) {
        const next = encodeURIComponent(window.location.pathname)
        router.push(`/admin/login?next=${next}`)
        return
      }
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
      <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto">
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
  const router = useRouter()
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
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamsCount: teamsCount ? Number(teamsCount) : null,
          playersCount: playersCount ? Number(playersCount) : null,
        }),
      })
      if (response.status === 401) {
        const next = encodeURIComponent(window.location.pathname)
        router.push(`/admin/login?next=${next}`)
        return
      }
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
      <DialogContent className="sm:max-w-xs max-h-[90vh] overflow-y-auto">
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
