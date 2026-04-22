"use client"

import { useState } from "react"
import { Check, Minus, Plus, Swords, Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
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
        body: JSON.stringify({ team1Id: matchForm.team1Id, team2Id: matchForm.team2Id, stage: matchForm.stage || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const t1 = teams.find((t) => t.id === matchForm.team1Id)
      const t2 = teams.find((t) => t.id === matchForm.team2Id)
      setMatches((m) => [...m, {
        id: data.id, score1: null, score2: null, played: false, stage: data.stage ?? null,
        team1: t1 ? { id: t1.id, name: t1.name } : null,
        team2: t2 ? { id: t2.id, name: t2.name } : null,
      }])
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
    <div className="space-y-5">
      {error ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-base text-destructive">
          {error}
        </p>
      ) : null}

      {/* Participants */}
      <section className="rounded-3xl border-2 border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground">{teams.length}</span>
            {teamsCount ? (
              <span className="text-base text-muted-foreground">/ {teamsCount}</span>
            ) : null}
          </div>
          {!isFull ? (
            <Button size="default" className="h-11 gap-2 px-5" onClick={() => setAddParticipantOpen(true)}>
              <UserPlus className="h-5 w-5" />
              Agregar
            </Button>
          ) : (
            <span className="text-sm font-medium text-emerald-600">Completo</span>
          )}
        </div>

        {teamsCount ? (
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, (teams.length / teamsCount) * 100)}%` }}
            />
          </div>
        ) : null}

        {teams.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center gap-1.5 rounded-2xl border border-border bg-muted/40 px-3 py-1.5">
                <span className="text-base text-foreground">{team.name}</span>
                <button
                  type="button"
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  onClick={() => handleRemove(team.id, team.name)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* Matches */}
      <section className="rounded-3xl border-2 border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-foreground">{matches.length} partidos</span>
          {teams.length >= 2 ? (
            <Button size="default" variant="outline" className="h-11 gap-2 px-5" onClick={() => setAddMatchOpen(true)}>
              <Swords className="h-5 w-5" />
              Nuevo
            </Button>
          ) : null}
        </div>

        {matches.length > 0 ? (
          <div className="space-y-2">
            {matches.map((match) => (
              <div
                key={match.id}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                  match.played ? "bg-emerald-500/8 border border-emerald-500/20" : "border border-border"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-base font-medium text-foreground">
                    {match.team1?.name || "—"} vs {match.team2?.name || "—"}
                  </p>
                  {match.played ? (
                    <p className="text-lg font-bold tabular-nums text-foreground">
                      {match.score1 ?? 0} — {match.score2 ?? 0}
                    </p>
                  ) : null}
                </div>
                {!match.played ? (
                  <Button size="sm" className="ml-3 shrink-0" onClick={() => setScoreMatchId(match.id)}>
                    Resultado
                  </Button>
                ) : (
                  <span className="ml-3 shrink-0 text-sm font-medium text-emerald-600">✓</span>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* Dialog: agregar participante */}
      <Dialog open={addParticipantOpen} onOpenChange={(o) => { setAddParticipantOpen(o); if (!o) setNewName("") }}>
        <DialogContent className="sm:max-w-sm">
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
              <Button variant="outline" className="flex-1 h-12" onClick={() => setAddParticipantOpen(false)}>
                Cancelar
              </Button>
              <Button className="flex-1 h-12" disabled={savingParticipant || !newName.trim()} onClick={handleAddParticipant}>
                {savingParticipant ? "..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: nuevo partido */}
      <Dialog open={addMatchOpen} onOpenChange={(o) => { setAddMatchOpen(o); if (!o) setMatchForm({ team1Id: "", team2Id: "", stage: "" }) }}>
        <DialogContent className="sm:max-w-sm">
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
              <Button variant="outline" className="flex-1 h-12" onClick={() => setAddMatchOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="flex-1 h-12"
                disabled={savingMatch || !matchForm.team1Id || !matchForm.team2Id}
                onClick={handleAddMatch}
              >
                {savingMatch ? "..." : "Crear"}
              </Button>
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
          <DialogTitle className="text-lg">
            {match.team1?.name || "—"} vs {match.team2?.name || "—"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 items-center gap-2 py-4">
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-medium text-muted-foreground text-center truncate w-full">{match.team1?.name}</p>
            <button type="button" onClick={() => setScore1((s) => s + 1)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-primary bg-primary/10 text-primary active:scale-95 transition-transform">
              <Plus className="h-6 w-6" />
            </button>
            <span className="text-5xl font-bold tabular-nums">{score1}</span>
            <button type="button" onClick={() => setScore1((s) => Math.max(0, s - 1))}
              className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-border bg-background text-foreground active:scale-95 transition-transform">
              <Minus className="h-6 w-6" />
            </button>
          </div>

          <div className="text-center text-xl font-bold text-muted-foreground">vs</div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-medium text-muted-foreground text-center truncate w-full">{match.team2?.name}</p>
            <button type="button" onClick={() => setScore2((s) => s + 1)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-primary bg-primary/10 text-primary active:scale-95 transition-transform">
              <Plus className="h-6 w-6" />
            </button>
            <span className="text-5xl font-bold tabular-nums">{score2}</span>
            <button type="button" onClick={() => setScore2((s) => Math.max(0, s - 1))}
              className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-border bg-background text-foreground active:scale-95 transition-transform">
              <Minus className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 h-12" disabled={saving} onClick={() => save(false)}>
            Guardar
          </Button>
          <Button className="flex-1 h-12 bg-emerald-600 text-white hover:bg-emerald-700" disabled={saving} onClick={() => save(true)}>
            <Check className="mr-2 h-5 w-5" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
