"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Minus, Plus, Trash2, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Player { id: string; name: string; seniority?: number | null }
interface Team   { id: string; name: string; type: string; players: Player[] }
interface Match  {
  id: string
  team1?: { id: string; name: string } | null
  team2?: { id: string; name: string } | null
  score1?: number | null
  score2?: number | null
  played: boolean
  stage?: string | null
  date?:  string | null
}

interface Discipline {
  id: string; name: string; slug: string
  format?: string | null; details?: string | null
  teamsCount?: number | null; playersCount?: number | null
  teams: Team[]; matches: Match[]
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminDisciplineView({ discipline: initial }: { discipline: Discipline }) {
  const [teams,   setTeams]   = useState(initial.teams)
  const [matches, setMatches] = useState(initial.matches)
  const [tab,     setTab]     = useState<"participantes" | "partidos">("participantes")
  const [toast,   setToast]   = useState<{ ok: boolean; msg: string } | null>(null)

  // dialogs
  const [addOpen,   setAddOpen]   = useState(false)
  const [matchOpen, setMatchOpen] = useState(false)
  const [scoring,   setScoring]   = useState<Match | null>(null)

  function notify(ok: boolean, msg: string) {
    setToast({ ok, msg })
    setTimeout(() => setToast(null), 3000)
  }

  // ── handlers ──

  async function handleAddTeam(name: string, players: string[]) {
    try {
      const res  = await fetch(`/api/admin/disciplines/${initial.slug}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type: players.length > 0 ? "TEAM" : "SINGLE",
          players: players.map((p) => ({ name: p.trim() })).filter((p) => p.name),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTeams((prev) => [...prev, { ...data, players: data.players ?? [] }])
      notify(true, `${name} inscripto.`)
    } catch { notify(false, "No se pudo inscribir.") }
  }

  async function handleRemoveTeam(teamId: string, teamName: string) {
    if (!confirm(`¿Eliminar "${teamName}"?`)) return
    try {
      const res = await fetch(`/api/admin/disciplines/${initial.slug}/teams/${teamId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setTeams((prev) => prev.filter((t) => t.id !== teamId))
      notify(true, "Eliminado.")
    } catch { notify(false, "No se pudo eliminar.") }
  }

  async function handleCreateMatch(team1Id: string, team2Id: string, stage: string) {
    try {
      const res  = await fetch(`/api/disciplines/${initial.slug}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team1Id, team2Id, stage: stage || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const t1 = teams.find((t) => t.id === team1Id)
      const t2 = teams.find((t) => t.id === team2Id)
      setMatches((prev) => [...prev, {
        id: data.id, score1: null, score2: null, played: false,
        stage: data.stage ?? null, date: null,
        team1: t1 ? { id: t1.id, name: t1.name } : null,
        team2: t2 ? { id: t2.id, name: t2.name } : null,
      }])
      notify(true, "Partido creado.")
    } catch { notify(false, "No se pudo crear el partido.") }
  }

  function handleScoreUpdated(updated: Match) {
    setMatches((prev) => prev.map((m) => m.id === updated.id ? updated : m))
    setScoring(null)
    notify(true, updated.played ? "Partido cerrado." : "Score guardado.")
  }

  const pending = matches.filter((m) => !m.played)
  const played  = matches.filter((m) =>  m.played)

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <Link href="/admin" className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-lg font-bold text-foreground">{initial.name}</h1>
          {initial.format ? <p className="truncate text-xs text-muted-foreground">{initial.format}</p> : null}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{teams.length} equip{teams.length === 1 ? "o" : "os"}</span>
          <span>·</span>
          <span>{matches.length} partido{matches.length === 1 ? "" : "s"}</span>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast ? (
        <div className={`mx-4 mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${toast.ok ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
          {toast.msg}
        </div>
      ) : null}

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-border bg-card px-4">
        {(["participantes", "partidos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "participantes" ? `Participantes (${teams.length})` : `Partidos (${matches.length})`}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">

        {/* ── Participantes ── */}
        {tab === "participantes" && (
          <>
            <button
              onClick={() => setAddOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 py-4 text-base font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/10"
            >
              <Plus className="h-5 w-5" /> Agregar participante / equipo
            </button>

            {teams.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">Todavía no hay participantes.</p>
            ) : (
              <div className="space-y-2">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{team.name}</p>
                      {team.players.length > 0 && (
                        <p className="text-xs text-muted-foreground truncate">
                          {team.players.map((p) => p.name).join(", ")}
                        </p>
                      )}
                    </div>
                    {team.players.length > 0 && (
                      <span className="shrink-0 rounded-lg bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {team.players.length}
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoveTeam(team.id, team.name)}
                      className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Partidos ── */}
        {tab === "partidos" && (
          <>
            <button
              onClick={() => setMatchOpen(true)}
              disabled={teams.length < 2}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 py-4 text-base font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="h-5 w-5" /> Crear partido
            </button>

            {teams.length < 2 && (
              <p className="text-center text-sm text-muted-foreground">Necesitás al menos 2 participantes para crear partidos.</p>
            )}

            {pending.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Pendientes</p>
                <div className="space-y-2">
                  {pending.map((match) => (
                    <MatchRow key={match.id} match={match} onTap={() => setScoring(match)} />
                  ))}
                </div>
              </div>
            )}

            {played.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Jugados</p>
                <div className="space-y-2">
                  {played.map((match) => (
                    <MatchRow key={match.id} match={match} onTap={() => setScoring(match)} />
                  ))}
                </div>
              </div>
            )}

            {matches.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">Todavía no hay partidos.</p>
            )}
          </>
        )}
      </div>

      {/* ── Dialogs ── */}

      <AddTeamDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAddTeam}
      />

      <CreateMatchDialog
        open={matchOpen}
        teams={teams}
        onClose={() => setMatchOpen(false)}
        onCreate={handleCreateMatch}
      />

      {scoring ? (
        <ScoreDialog
          match={scoring}
          onClose={() => setScoring(null)}
          onUpdate={handleScoreUpdated}
        />
      ) : null}
    </div>
  )
}

// ─── Match row ────────────────────────────────────────────────────────────────

function MatchRow({ match, onTap }: { match: Match; onTap: () => void }) {
  return (
    <button
      onClick={onTap}
      className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      {match.stage ? (
        <Badge variant="outline" className="shrink-0 text-xs">{match.stage}</Badge>
      ) : null}
      <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
        <span className="truncate text-sm font-semibold text-foreground">
          {match.team1?.name ?? "?"}
        </span>
        {match.played ? (
          <span className="shrink-0 rounded-lg bg-muted px-3 py-1 font-mono text-sm font-bold">
            {match.score1 ?? 0} – {match.score2 ?? 0}
          </span>
        ) : (
          <span className="shrink-0 rounded-lg bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600">
            Cargar
          </span>
        )}
        <span className="truncate text-sm font-semibold text-foreground text-right">
          {match.team2?.name ?? "?"}
        </span>
      </div>
    </button>
  )
}

// ─── Add team dialog ──────────────────────────────────────────────────────────

function AddTeamDialog({
  open, onClose, onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (name: string, players: string[]) => Promise<void>
}) {
  const [name,    setName]    = useState("")
  const [players, setPlayers] = useState("")
  const [saving,  setSaving]  = useState(false)

  function reset() { setName(""); setPlayers(""); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const playerList = players.split("\n").map((p) => p.trim()).filter(Boolean)
    await onAdd(name.trim(), playerList)
    reset()
    onClose()
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose() } }}>
      <DialogContent className="sm:max-w-xs" onOpenAutoFocus={reset}>
        <DialogHeader><DialogTitle>Agregar participante</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <input
            autoFocus required
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-4 text-xl outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Nombre del equipo / jugador"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground min-h-24 font-mono"
            placeholder={"Jugadores (opcional)\nuno por línea"}
            value={players}
            onChange={(e) => setPlayers(e.target.value)}
          />
          <p className="text-xs text-muted-foreground px-1">Si es individual, dejá los jugadores vacío.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => { reset(); onClose() }} className="flex-1 rounded-2xl border border-border py-3.5 text-base font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={saving || !name.trim()} className="flex-1 rounded-2xl bg-primary py-3.5 text-base font-bold text-primary-foreground disabled:opacity-40">
              {saving ? "..." : "Agregar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Create match dialog ──────────────────────────────────────────────────────

function CreateMatchDialog({
  open, teams, onClose, onCreate,
}: {
  open: boolean
  teams: Team[]
  onClose: () => void
  onCreate: (team1Id: string, team2Id: string, stage: string) => Promise<void>
}) {
  const [team1Id, setTeam1Id] = useState("")
  const [team2Id, setTeam2Id] = useState("")
  const [stage,   setStage]   = useState("")
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState("")

  function reset() { setTeam1Id(""); setTeam2Id(""); setStage(""); setError("") }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!team1Id || !team2Id || team1Id === team2Id) {
      setError("Elegí dos equipos distintos."); return
    }
    setSaving(true)
    await onCreate(team1Id, team2Id, stage)
    reset()
    onClose()
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose() } }}>
      <DialogContent className="sm:max-w-xs" onOpenAutoFocus={reset}>
        <DialogHeader><DialogTitle>Nuevo partido</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <select required
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-lg outline-none focus:border-primary"
            value={team1Id} onChange={(e) => { setTeam1Id(e.target.value); setError("") }}>
            <option value="">Equipo 1 / Local</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select required
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-lg outline-none focus:border-primary"
            value={team2Id} onChange={(e) => { setTeam2Id(e.target.value); setError("") }}>
            <option value="">Equipo 2 / Visitante</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Fase (ej: Grupo A, Semifinal...)"
            value={stage} onChange={(e) => setStage(e.target.value)}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex gap-2">
            <button type="button" onClick={() => { reset(); onClose() }} className="flex-1 rounded-2xl border border-border py-3.5 text-base font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex-1 rounded-2xl bg-primary py-3.5 text-base font-bold text-primary-foreground disabled:opacity-40">
              {saving ? "..." : "Crear"}
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
  match: Match
  onClose: () => void
  onUpdate: (updated: Match) => void
}) {
  const [score1, setScore1] = useState(match.score1 ?? 0)
  const [score2, setScore2] = useState(match.score2 ?? 0)
  const [saving, setSaving] = useState(false)

  async function save(played: boolean) {
    setSaving(true)
    try {
      const res  = await fetch(`/api/admin/matches/${match.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score1, score2, played }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error()
      onUpdate({ ...match, score1: data.score1, score2: data.score2, played: data.played })
    } finally { setSaving(false) }
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-sm font-semibold text-muted-foreground">
            {match.stage ? <span className="block text-xs text-primary mb-1">{match.stage}</span> : null}
            {match.team1?.name ?? "—"} vs {match.team2?.name ?? "—"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 items-center gap-2 py-4">
          {[
            { score: score1, set: setScore1, name: match.team1?.name ?? "?" },
            null,
            { score: score2, set: setScore2, name: match.team2?.name ?? "?" },
          ].map((side, i) =>
            !side ? (
              <div key={i} className="text-center text-3xl font-black text-muted-foreground">vs</div>
            ) : (
              <div key={i} className="flex flex-col items-center gap-3">
                <p className="w-full truncate text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {side.name}
                </p>
                <button
                  type="button"
                  onClick={() => side.set((s) => s + 1)}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-primary bg-primary/10 text-primary active:scale-95 transition-transform"
                >
                  <Plus className="h-8 w-8" />
                </button>
                <span className="text-7xl font-black tabular-nums leading-none">{side.score}</span>
                <button
                  type="button"
                  onClick={() => side.set((s) => Math.max(0, s - 1))}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-border bg-background text-foreground active:scale-95 transition-transform"
                >
                  <Minus className="h-8 w-8" />
                </button>
              </div>
            )
          )}
        </div>

        <div className="flex gap-2">
          <button type="button" disabled={saving} onClick={() => save(false)}
            className="flex-1 rounded-2xl border-2 border-border py-4 text-base font-semibold disabled:opacity-40">
            Guardar
          </button>
          <button type="button" disabled={saving} onClick={() => save(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-base font-bold text-white hover:bg-emerald-700 disabled:opacity-40">
            <Check className="h-5 w-5" /> Cerrar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
