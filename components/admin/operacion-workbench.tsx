"use client"

import { useState } from "react"
import { Check, Minus, Plus, Trash2, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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

interface Discipline {
  id: string
  name: string
  slug: string
  teamsCount: number | null
  format: string | null
  teams: Team[]
  matches: Match[]
}

interface Props {
  disciplines: Discipline[]
}

export function OperacionWorkbench({ disciplines: initialDisciplines }: Props) {
  const [disciplines, setDisciplines] = useState(initialDisciplines)
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ slug: string; message: string; type: "ok" | "error" } | null>(null)

  function showFeedback(slug: string, message: string, type: "ok" | "error") {
    setFeedback({ slug, message, type })
    setTimeout(() => setFeedback(null), 3000)
  }

  async function handleAddParticipant(slug: string) {
    if (!newName.trim()) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/disciplines/${slug}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), type: "SINGLE" }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setDisciplines((current) =>
        current.map((d) => (d.slug === slug ? { ...d, teams: [...d.teams, data] } : d))
      )
      const added = newName.trim()
      setNewName("")
      setAddingTo(null)
      showFeedback(slug, `${added} inscripto correctamente`, "ok")
    } catch {
      showFeedback(slug, "No se pudo inscribir. Intentá de nuevo.", "error")
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveParticipant(slug: string, teamId: string, teamName: string) {
    if (!confirm(`¿Eliminar a ${teamName}?`)) return
    try {
      const response = await fetch(`/api/admin/disciplines/${slug}/teams/${teamId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error()
      setDisciplines((current) =>
        current.map((d) =>
          d.slug === slug ? { ...d, teams: d.teams.filter((t) => t.id !== teamId) } : d
        )
      )
    } catch {
      showFeedback(slug, "No se pudo eliminar. Intentá de nuevo.", "error")
    }
  }

  function updateMatchInState(matchId: string, updates: Partial<Match>) {
    setDisciplines((current) =>
      current.map((d) => ({
        ...d,
        matches: d.matches.map((m) => (m.id === matchId ? { ...m, ...updates } : m)),
      }))
    )
  }

  return (
    <div className="space-y-6">
      {disciplines.map((discipline) => {
        const pending = discipline.matches.filter((m) => !m.played).length
        const done = discipline.matches.filter((m) => m.played).length
        const isFull = discipline.teamsCount !== null && discipline.teams.length >= discipline.teamsCount

        return (
          <div key={discipline.id} className="rounded-3xl border-2 border-border bg-card p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{discipline.name}</h2>
                {discipline.format && (
                  <p className="text-base text-muted-foreground mt-1">{discipline.format}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-3xl font-bold text-foreground">
                  {discipline.teams.length}
                  {discipline.teamsCount ? `/${discipline.teamsCount}` : ""}
                </p>
                <p className="text-sm text-muted-foreground">inscritos</p>
              </div>
            </div>

            {discipline.teamsCount ? (
              <div className="space-y-1">
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (discipline.teams.length / discipline.teamsCount) * 100)}%`,
                    }}
                  />
                </div>
                {isFull ? (
                  <p className="text-sm font-semibold text-emerald-600">Cupo completo</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {discipline.teamsCount - discipline.teams.length} lugares disponibles
                  </p>
                )}
              </div>
            ) : null}

            {feedback?.slug === discipline.slug ? (
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Participantes</h3>
                {!isFull ? (
                  addingTo === discipline.slug ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAddingTo(null)
                        setNewName("")
                      }}
                    >
                      Cancelar
                    </Button>
                  ) : (
                    <Button
                      size="default"
                      className="h-12 gap-2 px-5 text-base"
                      onClick={() => setAddingTo(discipline.slug)}
                    >
                      <UserPlus className="h-5 w-5" />
                      Agregar
                    </Button>
                  )
                ) : null}
              </div>

              {addingTo === discipline.slug ? (
                <div className="flex gap-3">
                  <input
                    autoFocus
                    className="flex-1 rounded-2xl border-2 border-primary bg-background px-4 py-3 text-lg outline-none placeholder:text-muted-foreground"
                    placeholder="Nombre del participante..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddParticipant(discipline.slug)
                      if (e.key === "Escape") {
                        setAddingTo(null)
                        setNewName("")
                      }
                    }}
                  />
                  <Button
                    size="lg"
                    className="h-14 px-6 text-base"
                    disabled={saving || !newName.trim()}
                    onClick={() => handleAddParticipant(discipline.slug)}
                  >
                    {saving ? "..." : "Guardar"}
                  </Button>
                </div>
              ) : null}

              {discipline.teams.length === 0 ? (
                <p className="py-2 text-base text-muted-foreground">Sin inscritos todavía.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {discipline.teams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 py-2"
                    >
                      <span className="text-base text-foreground">{team.name}</span>
                      <button
                        type="button"
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        onClick={() => handleRemoveParticipant(discipline.slug, team.id, team.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {discipline.matches.length > 0 ? (
              <div className="space-y-4 border-t border-border pt-5">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-foreground">Partidos</h3>
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
                <div className="space-y-4">
                  {discipline.matches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onUpdate={updateMatchInState}
                      onFeedback={(msg, type) => showFeedback(discipline.slug, msg, type)}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

function MatchCard({
  match,
  onUpdate,
  onFeedback,
}: {
  match: Match
  onUpdate: (id: string, updates: Partial<Match>) => void
  onFeedback: (msg: string, type: "ok" | "error") => void
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
      onUpdate(match.id, { score1: data.score1, score2: data.score2, played: data.played })
      onFeedback(played ? "Partido cerrado" : "Resultado guardado", "ok")
    } catch {
      onFeedback("No se pudo guardar. Intentá de nuevo.", "error")
    } finally {
      setSaving(false)
    }
  }

  if (match.played) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="flex-1 text-right text-base font-semibold text-foreground">
            {match.team1?.name || "—"}
          </p>
          <div className="text-center">
            <p className="text-3xl font-bold tabular-nums text-foreground">
              {match.score1 ?? 0} — {match.score2 ?? 0}
            </p>
            <Badge className="mt-1 border-0 bg-emerald-500/20 text-emerald-700">Cerrado</Badge>
          </div>
          <p className="flex-1 text-left text-base font-semibold text-foreground">
            {match.team2?.name || "—"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-2xl border-2 border-border p-5">
      {match.stage && (
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {match.stage}
        </p>
      )}

      <div className="grid grid-cols-3 items-center gap-4">
        <div className="space-y-3 text-right">
          <p className="text-base font-semibold leading-tight text-foreground">
            {match.team1?.name || "Por definir"}
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-border bg-background text-foreground transition-transform active:scale-95"
              onClick={() => setScore1((s) => Math.max(0, s - 1))}
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="w-10 text-center text-3xl font-bold tabular-nums">{score1}</span>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-primary bg-primary/10 text-primary transition-transform active:scale-95"
              onClick={() => setScore1((s) => s + 1)}
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="text-center">
          <span className="text-xl font-bold text-muted-foreground">vs</span>
        </div>

        <div className="space-y-3 text-left">
          <p className="text-base font-semibold leading-tight text-foreground">
            {match.team2?.name || "Por definir"}
          </p>
          <div className="flex items-center justify-start gap-2">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-border bg-background text-foreground transition-transform active:scale-95"
              onClick={() => setScore2((s) => Math.max(0, s - 1))}
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="w-10 text-center text-3xl font-bold tabular-nums">{score2}</span>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-primary bg-primary/10 text-primary transition-transform active:scale-95"
              onClick={() => setScore2((s) => s + 1)}
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <Button
          variant="outline"
          className="h-12 flex-1 text-base"
          disabled={saving}
          onClick={() => save(false)}
        >
          Guardar resultado
        </Button>
        <Button
          className="h-12 flex-1 bg-emerald-600 text-base text-white hover:bg-emerald-700"
          disabled={saving}
          onClick={() => save(true)}
        >
          <Check className="mr-2 h-5 w-5" />
          Cerrar partido
        </Button>
      </div>
    </div>
  )
}
