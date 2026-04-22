"use client"

import { useState } from "react"
import { Check, Minus, Plus, Swords, Trash2, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Player {
  id: string
  name: string
}

interface Team {
  id: string
  name: string
  players: Player[]
}

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

export function DisciplineOperacion({
  disciplineSlug,
  teamsCount,
  initialTeams,
  initialMatches,
}: Props) {
  const [teams, setTeams] = useState(initialTeams)
  const [matches, setMatches] = useState(initialMatches)

  const [addParticipantOpen, setAddParticipantOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [savingParticipant, setSavingParticipant] = useState(false)

  const [addMatchOpen, setAddMatchOpen] = useState(false)
  const [matchForm, setMatchForm] = useState({ team1Id: "", team2Id: "", stage: "" })
  const [savingMatch, setSavingMatch] = useState(false)

  const [scoreMatchId, setScoreMatchId] = useState<string | null>(null)

  const [feedback, setFeedback] = useState<{ message: string; type: "ok" | "error" } | null>(null)

  const isFull = teamsCount !== null && teams.length >= teamsCount

  function showFeedback(message: string, type: "ok" | "error") {
    setFeedback({ message, type })
    setTimeout(() => setFeedback(null), 3000)
  }

  async function handleAddParticipant() {
    if (!newName.trim()) return
    setSavingParticipant(true)
    try {
      const response = await fetch(`/api/admin/disciplines/${disciplineSlug}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), type: "SINGLE" }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setTeams((current) => [...current, data])
      setNewName("")
      setAddParticipantOpen(false)
      showFeedback(`${data.name} inscripto correctamente`, "ok")
    } catch {
      showFeedback("No se pudo inscribir. Intentá de nuevo.", "error")
    } finally {
      setSavingParticipant(false)
    }
  }

  async function handleRemoveParticipant(teamId: string, teamName: string) {
    if (!confirm(`¿Eliminar a ${teamName}?`)) return
    try {
      const response = await fetch(
        `/api/admin/disciplines/${disciplineSlug}/teams/${teamId}`,
        { method: "DELETE" }
      )
      if (!response.ok) throw new Error()
      setTeams((current) => current.filter((t) => t.id !== teamId))
    } catch {
      showFeedback("No se pudo eliminar. Intentá de nuevo.", "error")
    }
  }

  async function handleAddMatch() {
    if (!matchForm.team1Id || !matchForm.team2Id) return
    if (matchForm.team1Id === matchForm.team2Id) {
      showFeedback("Elegí dos equipos distintos.", "error")
      return
    }
    setSavingMatch(true)
    try {
      const response = await fetch(`/api/disciplines/${disciplineSlug}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team1Id: matchForm.team1Id,
          team2Id: matchForm.team2Id,
          stage: matchForm.stage || undefined,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      const team1 = teams.find((t) => t.id === matchForm.team1Id)
      const team2 = teams.find((t) => t.id === matchForm.team2Id)

      setMatches((current) => [
        ...current,
        {
          id: data.id,
          score1: null,
          score2: null,
          played: false,
          stage: data.stage ?? null,
          team1: team1 ? { id: team1.id, name: team1.name } : null,
          team2: team2 ? { id: team2.id, name: team2.name } : null,
        },
      ])
      setMatchForm({ team1Id: "", team2Id: "", stage: "" })
      setAddMatchOpen(false)
      showFeedback("Partido creado", "ok")
    } catch {
      showFeedback("No se pudo crear el partido. Intentá de nuevo.", "error")
    } finally {
      setSavingMatch(false)
    }
  }

  function updateMatch(matchId: string, updates: Partial<Match>) {
    setMatches((current) =>
      current.map((m) => (m.id === matchId ? { ...m, ...updates } : m))
    )
  }

  const pending = matches.filter((m) => !m.played).length
  const done = matches.filter((m) => m.played).length
  const scoringMatch = matches.find((m) => m.id === scoreMatchId) ?? null

  return (
    <div className="space-y-6">
      {feedback ? (
        <p
          className={`rounded-2xl px-4 py-3 text-base font-medium ${
            feedback.type === "ok"
              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
              : "border border-destructive/20 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      {/* Participants */}
      <section className="rounded-3xl border-2 border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Participantes</h2>
            <p className="text-base text-muted-foreground">
              {teams.length}
              {teamsCount ? ` / ${teamsCount}` : ""} inscritos
            </p>
          </div>
          {!isFull ? (
            <Button
              size="default"
              className="h-12 gap-2 px-5 text-base"
              onClick={() => setAddParticipantOpen(true)}
            >
              <UserPlus className="h-5 w-5" />
              Agregar
            </Button>
          ) : (
            <Badge className="border-0 bg-emerald-500/20 text-emerald-700 text-sm px-3 py-1">
              Cupo completo
            </Badge>
          )}
        </div>

        {teamsCount ? (
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, (teams.length / teamsCount) * 100)}%` }}
            />
          </div>
        ) : null}

        {teams.length === 0 ? (
          <p className="py-2 text-base text-muted-foreground">Sin inscritos todavía.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 py-2"
              >
                <span className="text-base text-foreground">{team.name}</span>
                <button
                  type="button"
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  onClick={() => handleRemoveParticipant(team.id, team.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Matches */}
      <section className="rounded-3xl border-2 border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Partidos</h2>
            <div className="flex items-center gap-2 mt-1">
              {pending > 0 && (
                <Badge variant="outline">
                  {pending} pendiente{pending !== 1 ? "s" : ""}
                </Badge>
              )}
              {done > 0 && (
                <Badge className="border-0 bg-emerald-500/20 text-emerald-700">
                  {done} cerrado{done !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>
          {teams.length >= 2 ? (
            <Button
              size="default"
              variant="outline"
              className="h-12 gap-2 px-5 text-base"
              onClick={() => setAddMatchOpen(true)}
            >
              <Swords className="h-5 w-5" />
              Nuevo partido
            </Button>
          ) : null}
        </div>

        {matches.length === 0 ? (
          <p className="py-2 text-base text-muted-foreground">No hay partidos todavía.</p>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <div
                key={match.id}
                className={`rounded-2xl border-2 p-5 ${
                  match.played
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-border bg-background"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {match.stage ? (
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                        {match.stage}
                      </p>
                    ) : null}
                    <p className="text-lg font-semibold text-foreground truncate">
                      {match.team1?.name || "—"} vs {match.team2?.name || "—"}
                    </p>
                    {match.played ? (
                      <p className="text-2xl font-bold tabular-nums text-foreground mt-1">
                        {match.score1 ?? 0} — {match.score2 ?? 0}
                      </p>
                    ) : null}
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {match.played ? (
                      <Badge className="border-0 bg-emerald-500/20 text-emerald-700">
                        Cerrado
                      </Badge>
                    ) : (
                      <Button
                        size="default"
                        className="h-11 px-5 text-base"
                        onClick={() => setScoreMatchId(match.id)}
                      >
                        Resultado
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Dialog: agregar participante */}
      <Dialog
        open={addParticipantOpen}
        onOpenChange={(open) => {
          setAddParticipantOpen(open)
          if (!open) setNewName("")
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Agregar participante</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <input
              autoFocus
              className="w-full rounded-2xl border-2 border-primary bg-background px-4 py-4 text-xl outline-none placeholder:text-muted-foreground"
              placeholder="Nombre..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddParticipant()
              }}
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-14 text-base"
                onClick={() => setAddParticipantOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 h-14 text-base"
                disabled={savingParticipant || !newName.trim()}
                onClick={handleAddParticipant}
              >
                {savingParticipant ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: agregar partido */}
      <Dialog
        open={addMatchOpen}
        onOpenChange={(open) => {
          setAddMatchOpen(open)
          if (!open) setMatchForm({ team1Id: "", team2Id: "", stage: "" })
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Nuevo partido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-base font-medium text-foreground">Equipo 1</label>
              <select
                className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-lg text-foreground outline-none focus:border-primary"
                value={matchForm.team1Id}
                onChange={(e) => setMatchForm((f) => ({ ...f, team1Id: e.target.value }))}
              >
                <option value="">Seleccioná...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-base font-medium text-foreground">Equipo 2</label>
              <select
                className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-lg text-foreground outline-none focus:border-primary"
                value={matchForm.team2Id}
                onChange={(e) => setMatchForm((f) => ({ ...f, team2Id: e.target.value }))}
              >
                <option value="">Seleccioná...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-base font-medium text-foreground">
                Fase{" "}
                <span className="font-normal text-muted-foreground">(opcional)</span>
              </label>
              <input
                className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-lg outline-none focus:border-primary placeholder:text-muted-foreground"
                placeholder="Grupo A, Semifinal..."
                value={matchForm.stage}
                onChange={(e) => setMatchForm((f) => ({ ...f, stage: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 h-14 text-base"
                onClick={() => setAddMatchOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 h-14 text-base"
                disabled={savingMatch || !matchForm.team1Id || !matchForm.team2Id}
                onClick={handleAddMatch}
              >
                {savingMatch ? "Creando..." : "Crear partido"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: cargar resultado */}
      {scoringMatch ? (
        <MatchScoreDialog
          match={scoringMatch}
          onClose={() => setScoreMatchId(null)}
          onUpdate={(updates) => {
            updateMatch(scoringMatch.id, updates)
            if (updates.played) {
              setScoreMatchId(null)
              showFeedback("Partido cerrado", "ok")
            } else {
              showFeedback("Resultado guardado", "ok")
            }
          }}
        />
      ) : null}
    </div>
  )
}

function MatchScoreDialog({
  match,
  onClose,
  onUpdate,
}: {
  match: Match
  onClose: () => void
  onUpdate: (updates: Partial<Match>) => void
}) {
  const [score1, setScore1] = useState(match.score1 ?? 0)
  const [score2, setScore2] = useState(match.score2 ?? 0)
  const [saving, setSaving] = useState(false)

  async function save(played: boolean) {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/matches/${match.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score1, score2, played }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      onUpdate({ score1: data.score1, score2: data.score2, played: data.played })
    } catch {
      // error handled by parent feedback
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {match.team1?.name || "—"} vs {match.team2?.name || "—"}
          </DialogTitle>
          {match.stage ? (
            <p className="text-sm text-muted-foreground">{match.stage}</p>
          ) : null}
        </DialogHeader>

        <div className="grid grid-cols-3 items-center gap-4 py-4">
          {/* Score 1 */}
          <div className="space-y-3 text-center">
            <p className="text-sm font-semibold text-muted-foreground truncate">
              {match.team1?.name || "—"}
            </p>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-primary bg-primary/10 text-primary transition-transform active:scale-95"
                onClick={() => setScore1((s) => s + 1)}
              >
                <Plus className="h-6 w-6" />
              </button>
              <span className="text-4xl font-bold tabular-nums text-foreground">{score1}</span>
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-border bg-background text-foreground transition-transform active:scale-95"
                onClick={() => setScore1((s) => Math.max(0, s - 1))}
              >
                <Minus className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="text-center">
            <span className="text-2xl font-bold text-muted-foreground">vs</span>
          </div>

          {/* Score 2 */}
          <div className="space-y-3 text-center">
            <p className="text-sm font-semibold text-muted-foreground truncate">
              {match.team2?.name || "—"}
            </p>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-primary bg-primary/10 text-primary transition-transform active:scale-95"
                onClick={() => setScore2((s) => s + 1)}
              >
                <Plus className="h-6 w-6" />
              </button>
              <span className="text-4xl font-bold tabular-nums text-foreground">{score2}</span>
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-border bg-background text-foreground transition-transform active:scale-95"
                onClick={() => setScore2((s) => Math.max(0, s - 1))}
              >
                <Minus className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 text-base"
            disabled={saving}
            onClick={() => save(false)}
          >
            Guardar
          </Button>
          <Button
            className="flex-1 h-12 bg-emerald-600 text-base text-white hover:bg-emerald-700"
            disabled={saving}
            onClick={() => save(true)}
          >
            <Check className="mr-2 h-5 w-5" />
            Cerrar partido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
