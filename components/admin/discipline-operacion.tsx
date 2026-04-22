"use client"

import { useState } from "react"
import { Check, Minus, Plus, Swords, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Player { id: string; name: string }
interface Team { id: string; name: string; players: Player[] }
interface Match {
  id: string
  score1: number | null
  score2: number | null
  played: boolean
  stage: string | null
  team1: { id: string; name: string } | null
  team2: { id: string; name: string } | null
}

interface Props {
  disciplineSlug: string
  teamsCount: number | null
  initialTeams: Team[]
  initialMatches: Match[]
}

export function DisciplineOperacion({ disciplineSlug, teamsCount, initialTeams, initialMatches }: Props) {
  const [teams, setTeams] = useState(initialTeams)
  const [matches, setMatches] = useState(initialMatches)

  const [addParticipantOpen, setAddParticipantOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [savingParticipant, setSavingParticipant] = useState(false)

  const [addMatchOpen, setAddMatchOpen] = useState(false)
  const [matchForm, setMatchForm] = useState({ team1Id: "", team2Id: "", stage: "" })
  const [savingMatch, setSavingMatch] = useState(false)

  const [scoreMatchId, setScoreMatchId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isFull = teamsCount !== null && teams.length >= teamsCount

  function showError(msg: string) {
    setError(msg)
    setTimeout(() => setError(null), 4000)
  }

  async function handleAddParticipant() {
    if (!newName.trim()) return
    setSavingParticipant(true)
    try {
      const res = await fetch(`/api/admin/disciplines/${disciplineSlug}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), type: "SINGLE" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTeams((t) => [...t, data])
      setNewName("")
      setAddParticipantOpen(false)
    } catch {
      showError("No se pudo inscribir.")
    } finally {
      setSavingParticipant(false)
    }
  }

  async function handleRemove(teamId: string, teamName: string) {
    if (!confirm(`¿Eliminar a ${teamName}?`)) return
    try {
      const res = await fetch(`/api/admin/disciplines/${disciplineSlug}/teams/${teamId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setTeams((t) => t.filter((x) => x.id !== teamId))
    } catch {
      showError("No se pudo eliminar.")
    }
  }

  async function handleAddMatch() {
    if (!matchForm.team1Id || !matchForm.team2Id || matchForm.team1Id === matchForm.team2Id) {
      showError("Elegí dos equipos distintos.")
      return
    }
    setSavingMatch(true)
    try {
      const res = await fetch(`/api/disciplines/${disciplineSlug}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team1Id: matchForm.team1Id,
          team2Id: matchForm.team2Id,
          stage: matchForm.stage || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const t1 = teams.find((t) => t.id === matchForm.team1Id)
      const t2 = teams.find((t) => t.id === matchForm.team2Id)
      setMatches((m) => [
        ...m,
        {
          id: data.id,
          score1: null,
          score2: null,
          played: false,
          stage: data.stage ?? null,
          team1: t1 ? { id: t1.id, name: t1.name } : null,
          team2: t2 ? { id: t2.id, name: t2.name } : null,
        },
      ])
      setMatchForm({ team1Id: "", team2Id: "", stage: "" })
      setAddMatchOpen(false)
    } catch {
      showError("No se pudo crear el partido.")
    } finally {
      setSavingMatch(false)
    }
  }

  function updateMatch(matchId: string, updates: Partial<Match>) {
    setMatches((m) => m.map((x) => x.id === matchId ? { ...x, ...updates } : x))
  }

  const scoringMatch = matches.find((m) => m.id === scoreMatchId) ?? null

  return (
    <div className="space-y-6 pb-10">
      {error ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-base text-destructive">
          {error}
        </p>
      ) : null}

      {/* Roster */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {teams.map((team) => (
            <div
              key={team.id}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5"
            >
              <span className="text-sm font-medium text-foreground">{team.name}</span>
              <button
                type="button"
                className="text-muted-foreground transition-colors hover:text-destructive"
                onClick={() => handleRemove(team.id, team.name)}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {!isFull ? (
            <button
              type="button"
              onClick={() => setAddParticipantOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-dashed border-primary/50 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:border-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar
            </button>
          ) : (
            <span className="shrink-0 rounded-full bg-emerald-500/15 px-3 py-1.5 text-sm font-medium text-emerald-600">
              Completo
            </span>
          )}
        </div>

        {teamsCount ? (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, (teams.length / teamsCount) * 100)}%` }}
            />
          </div>
        ) : null}
      </div>

      {/* Matches */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Partidos
          </p>
          {teams.length >= 2 ? (
            <button
              type="button"
              onClick={() => setAddMatchOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Swords className="h-3.5 w-3.5" />
              Nuevo partido
            </button>
          ) : null}
        </div>

        {matches.length === 0 ? (
          <p className="py-4 text-center text-base text-muted-foreground">Sin partidos todavía.</p>
        ) : (
          <div className="space-y-3">
            {matches.map((match) =>
              match.played ? (
                <ClosedMatchCard key={match.id} match={match} />
              ) : (
                <LiveMatchCard key={match.id} match={match} onClick={() => setScoreMatchId(match.id)} />
              )
            )}
          </div>
        )}
      </div>

      {/* Dialog: agregar participante */}
      <Dialog
        open={addParticipantOpen}
        onOpenChange={(o) => { setAddParticipantOpen(o); if (!o) setNewName("") }}
      >
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Agregar participante</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <input
              autoFocus
              className="w-full rounded-2xl border-2 border-primary bg-background px-4 py-4 text-xl outline-none placeholder:text-muted-foreground"
              placeholder="Nombre..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddParticipant() }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAddParticipantOpen(false)}
                className="flex-1 rounded-2xl border border-border py-3 text-base font-medium text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={savingParticipant || !newName.trim()}
                onClick={handleAddParticipant}
                className="flex-1 rounded-2xl bg-primary py-3 text-base font-bold text-primary-foreground disabled:opacity-40"
              >
                {savingParticipant ? "..." : "Guardar"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: nuevo partido */}
      <Dialog
        open={addMatchOpen}
        onOpenChange={(o) => { setAddMatchOpen(o); if (!o) setMatchForm({ team1Id: "", team2Id: "", stage: "" }) }}
      >
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Nuevo partido</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <select
              className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-lg text-foreground outline-none focus:border-primary"
              value={matchForm.team1Id}
              onChange={(e) => setMatchForm((f) => ({ ...f, team1Id: e.target.value }))}
            >
              <option value="">Equipo 1...</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select
              className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-lg text-foreground outline-none focus:border-primary"
              value={matchForm.team2Id}
              onChange={(e) => setMatchForm((f) => ({ ...f, team2Id: e.target.value }))}
            >
              <option value="">Equipo 2...</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input
              className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
              placeholder="Fase (opcional)"
              value={matchForm.stage}
              onChange={(e) => setMatchForm((f) => ({ ...f, stage: e.target.value }))}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAddMatchOpen(false)}
                className="flex-1 rounded-2xl border border-border py-3 text-base font-medium text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={savingMatch || !matchForm.team1Id || !matchForm.team2Id}
                onClick={handleAddMatch}
                className="flex-1 rounded-2xl bg-primary py-3 text-base font-bold text-primary-foreground disabled:opacity-40"
              >
                {savingMatch ? "..." : "Crear"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: resultado */}
      {scoringMatch ? (
        <MatchScoreDialog
          match={scoringMatch}
          onClose={() => setScoreMatchId(null)}
          onUpdate={(updates) => {
            updateMatch(scoringMatch.id, updates)
            if (updates.played) setScoreMatchId(null)
          }}
          onError={showError}
        />
      ) : null}
    </div>
  )
}

function LiveMatchCard({ match, onClick }: { match: Match; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-full overflow-hidden rounded-3xl border border-border bg-card text-left transition-all active:scale-[0.99] hover:border-amber-400/50"
    >
      <div className="absolute left-0 top-0 h-full w-1.5 bg-amber-400" />
      <div className="px-6 py-5">
        {match.stage ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {match.stage}
          </p>
        ) : null}

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <p className="truncate text-right text-base font-bold text-foreground">
            {match.team1?.name || "—"}
          </p>
          <div className="text-center">
            <p className="text-5xl font-black tabular-nums text-foreground">
              {match.score1 ?? 0}
              <span className="mx-2 text-3xl font-light text-muted-foreground">—</span>
              {match.score2 ?? 0}
            </p>
          </div>
          <p className="truncate text-left text-base font-bold text-foreground">
            {match.team2?.name || "—"}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
            En vivo
          </span>
        </div>
      </div>
    </button>
  )
}

function ClosedMatchCard({ match }: { match: Match }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-emerald-500/5">
      <div className="absolute left-0 top-0 h-full w-1.5 bg-emerald-500" />
      <div className="px-6 py-5">
        {match.stage ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {match.stage}
          </p>
        ) : null}

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <p className="truncate text-right text-base font-bold text-foreground">
            {match.team1?.name || "—"}
          </p>
          <div className="text-center">
            <p className="text-5xl font-black tabular-nums text-emerald-700">
              {match.score1 ?? 0}
              <span className="mx-2 text-3xl font-light text-emerald-400">—</span>
              {match.score2 ?? 0}
            </p>
          </div>
          <p className="truncate text-left text-base font-bold text-foreground">
            {match.team2?.name || "—"}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5">
          <Check className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Cerrado
          </span>
        </div>
      </div>
    </div>
  )
}

function MatchScoreDialog({
  match, onClose, onUpdate, onError,
}: {
  match: Match
  onClose: () => void
  onUpdate: (u: Partial<Match>) => void
  onError: (msg: string) => void
}) {
  const [score1, setScore1] = useState(match.score1 ?? 0)
  const [score2, setScore2] = useState(match.score2 ?? 0)
  const [saving, setSaving] = useState(false)

  async function save(played: boolean) {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/matches/${match.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score1, score2, played }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onUpdate({ score1: data.score1, score2: data.score2, played: data.played })
    } catch {
      onError("No se pudo guardar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-base font-semibold text-muted-foreground">
            {match.team1?.name || "—"} vs {match.team2?.name || "—"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 items-center gap-4 py-2">
          {/* Team 1 */}
          <div className="flex flex-col items-center gap-3">
            <p className="truncate text-center text-xs font-bold uppercase tracking-wide text-muted-foreground w-full">
              {match.team1?.name}
            </p>
            <button
              type="button"
              onClick={() => setScore1((s) => s + 1)}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary bg-primary/10 text-primary transition-transform active:scale-95"
            >
              <Plus className="h-7 w-7" />
            </button>
            <span className="text-6xl font-black tabular-nums text-foreground">{score1}</span>
            <button
              type="button"
              onClick={() => setScore1((s) => Math.max(0, s - 1))}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-border bg-background text-foreground transition-transform active:scale-95"
            >
              <Minus className="h-7 w-7" />
            </button>
          </div>

          <div className="text-center text-2xl font-black text-muted-foreground">—</div>

          {/* Team 2 */}
          <div className="flex flex-col items-center gap-3">
            <p className="truncate text-center text-xs font-bold uppercase tracking-wide text-muted-foreground w-full">
              {match.team2?.name}
            </p>
            <button
              type="button"
              onClick={() => setScore2((s) => s + 1)}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary bg-primary/10 text-primary transition-transform active:scale-95"
            >
              <Plus className="h-7 w-7" />
            </button>
            <span className="text-6xl font-black tabular-nums text-foreground">{score2}</span>
            <button
              type="button"
              onClick={() => setScore2((s) => Math.max(0, s - 1))}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-border bg-background text-foreground transition-transform active:scale-95"
            >
              <Minus className="h-7 w-7" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => save(false)}
            className="flex-1 rounded-2xl border border-border py-3.5 text-base font-semibold text-foreground disabled:opacity-40"
          >
            Guardar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save(true)}
            className="flex-1 rounded-2xl bg-emerald-600 py-3.5 text-base font-bold text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            <span className="flex items-center justify-center gap-2">
              <Check className="h-5 w-5" />
              Cerrar
            </span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
