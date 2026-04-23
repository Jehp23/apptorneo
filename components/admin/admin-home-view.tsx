"use client"

import { useState } from "react"
import Link from "next/link"
import { Activity, ArrowRight, Calendar, LogOut, Pencil, Plus, Trophy, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Team      { id: string; players: { id: string }[] }
interface Match     { id: string; played: boolean }
interface Discipline {
  id: string; name: string; slug: string
  format?: string | null
  teams: Team[]; matches: Match[]
  tournamentId: string
}
interface Tournament {
  id: string; name: string; location: string; year: number; status: string
}

export interface AdminHomeViewProps {
  tournament: Tournament | null
  initialDisciplines: Discipline[]
}

function getStatus(matches: Match[]) {
  if (matches.length === 0) return { label: "Sin fixture", tone: "outline" as const }
  const played = matches.filter((m) => m.played).length
  if (played === 0)              return { label: "Pendiente",  tone: "secondary" as const }
  if (played === matches.length) return { label: "Finalizado", tone: "default"   as const }
  return { label: "En curso", tone: "secondary" as const }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function AdminHomeView({ tournament, initialDisciplines }: AdminHomeViewProps) {
  const [disciplines,       setDisciplines]       = useState(initialDisciplines)
  const [newDisciplineOpen, setNewDisciplineOpen] = useState(false)
  const [editTournament,    setEditTournament]    = useState(false)

  const totalParticipants = disciplines.reduce((acc, d) => acc + d.teams.reduce((a, t) => a + t.players.length, 0), 0)
  const totalMatches      = disciplines.reduce((acc, d) => acc + d.matches.length, 0)
  const playedMatches     = disciplines.reduce((acc, d) => acc + d.matches.filter((m) => m.played).length, 0)

  function onDisciplineCreated(d: Discipline) {
    setDisciplines((prev) => [d, ...prev])
  }

  function onTournamentUpdated(t: Tournament) {
    // page will re-render on next navigation — no local state needed for tournament
    void t
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ── */}
      <div className="border-b border-border bg-card px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Panel admin</p>
            <h1 className="mt-0.5 text-2xl font-bold text-foreground">
              {tournament?.name ?? "Torneo"}
            </h1>
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

      <div className="p-4 space-y-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Deportes",      value: disciplines.length, icon: Trophy   },
            { label: "Participantes", value: totalParticipants,  icon: Users    },
            { label: "Partidos",      value: totalMatches,       icon: Calendar },
            { label: "Jugados",       value: playedMatches,      icon: Activity },
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

        {/* ── Deportes ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Deportes</h2>
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
              className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 py-10 text-base font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/10"
            >
              <Plus className="h-5 w-5" /> Crear el primer deporte
            </button>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {disciplines.map((discipline) => {
                const status      = getStatus(discipline.matches)
                const players     = discipline.teams.reduce((acc, t) => acc + t.players.length, 0)
                const pendingCount = discipline.matches.filter((m) => !m.played).length

                return (
                  <Link
                    key={discipline.id}
                    href={`/admin/${discipline.slug}`}
                    className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{discipline.name}</h3>
                        {discipline.format ? (
                          <p className="text-sm text-muted-foreground">{discipline.format}</p>
                        ) : null}
                      </div>
                      <Badge variant={status.tone}>{status.label}</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-muted/40 px-2 py-2">
                        <p className="text-xl font-bold text-foreground">{discipline.teams.length}</p>
                        <p className="text-xs text-muted-foreground">equipos</p>
                      </div>
                      <div className="rounded-xl bg-muted/40 px-2 py-2">
                        <p className="text-xl font-bold text-foreground">{players}</p>
                        <p className="text-xs text-muted-foreground">jugadores</p>
                      </div>
                      <div className="rounded-xl bg-muted/40 px-2 py-2">
                        <p className={`text-xl font-bold ${pendingCount > 0 ? "text-amber-500" : "text-foreground"}`}>
                          {pendingCount}
                        </p>
                        <p className="text-xs text-muted-foreground">pendientes</p>
                      </div>
                    </div>

                    <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Gestionar
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Dialogs ── */}

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
    </div>
  )
}

// ─── Edit tournament dialog ───────────────────────────────────────────────────

function EditTournamentDialog({
  tournament, open, onClose, onSaved,
}: {
  tournament: Tournament
  open: boolean
  onClose: () => void
  onSaved: (t: Tournament) => void
}) {
  const [form,   setForm]   = useState({ name: tournament.name, location: tournament.location, year: tournament.year.toString(), status: tournament.status })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError("")
    try {
      const res  = await fetch(`/api/tournaments/${tournament.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, year: Number(form.year) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onSaved(data)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader><DialogTitle>Editar torneo</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <input required
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Nombre" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input required
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Ubicación" value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <input required type="number"
              className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
              value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} />
            <select
              className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary"
              value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="active">Activo</option>
              <option value="draft">Borrador</option>
              <option value="completed">Finalizado</option>
            </select>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2">
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

// ─── New discipline dialog ────────────────────────────────────────────────────

function NewDisciplineDialog({
  open, tournamentId, onClose, onCreated,
}: {
  open: boolean
  tournamentId: string
  onClose: () => void
  onCreated: (d: Discipline) => void
}) {
  const [form,   setForm]   = useState({ name: "", slug: "", format: "" })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState("")

  function reset() { setForm({ name: "", slug: "", format: "" }); setError("") }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError("")
    try {
      const res  = await fetch("/api/disciplines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId,
          name:   form.name,
          slug:   form.slug || undefined,
          format: form.format || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onCreated({ id: data.id, name: data.name, slug: data.slug, format: data.format, tournamentId, teams: [], matches: [] })
      reset()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear")
    } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose() } }}>
      <DialogContent className="sm:max-w-xs" onOpenAutoFocus={reset}>
        <DialogHeader><DialogTitle>Nuevo deporte</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <input required autoFocus
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-4 text-xl outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Nombre (ej: Fútbol 5)"
            value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Formato (ej: Grupos + eliminatoria)"
            value={form.format} onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))} />
          <input
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Slug (ej: futbol-5) — opcional"
            value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2">
            <button type="button" onClick={() => { reset(); onClose() }} className="flex-1 rounded-2xl border border-border py-3 text-base font-medium">Cancelar</button>
            <button type="submit" disabled={saving || !form.name.trim()} className="flex-1 rounded-2xl bg-primary py-3 text-base font-bold text-primary-foreground disabled:opacity-40">
              {saving ? "..." : "Crear"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
