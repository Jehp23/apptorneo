"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Minus, Pencil, Plus, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { StandingsTable, type StandingRow } from "@/components/standings-table"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Player { id: string; name: string; seniority?: number | null }
interface Team   { id: string; name: string; type: string; group?: string | null; players: Player[] }
interface RankedStandingRow extends StandingRow { teamId: string }
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
  const [tab,     setTab]     = useState<"participantes" | "partidos" | "posiciones">("participantes")
  const [toast,   setToast]   = useState<{ ok: boolean; msg: string } | null>(null)

  // dialogs
  const [addOpen,    setAddOpen]    = useState(false)
  const [matchOpen,  setMatchOpen]  = useState(false)
  const [scoring,    setScoring]    = useState<Match | null>(null)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)

  function notify(ok: boolean, msg: string) {
    setToast({ ok, msg })
    setTimeout(() => setToast(null), 3000)
  }

  // ── handlers ──

  async function handleAddTeam(name: string, players: string[], group?: string) {
    try {
      const res  = await fetch(`/api/admin/disciplines/${initial.slug}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type: players.length > 0 ? "TEAM" : "SINGLE",
          players: players.map((p) => ({ name: p.trim() })).filter((p) => p.name),
          group: group?.trim() || undefined,
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

  async function handleEditTeam(teamId: string, name: string, players: string[], group?: string) {
    try {
      const res = await fetch(`/api/admin/disciplines/${initial.slug}/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, players, group: group?.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTeams((prev) => prev.map((t) => t.id === teamId ? { ...data, players: data.players ?? [] } : t))
      notify(true, "Guardado.")
    } catch { notify(false, "No se pudo guardar.") }
  }

  async function handleDeleteMatch(matchId: string) {
    if (!confirm("¿Eliminar este partido?")) return
    try {
      const res = await fetch(`/api/admin/matches/${matchId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setMatches((prev) => prev.filter((m) => m.id !== matchId))
      notify(true, "Partido eliminado.")
    } catch { notify(false, "No se pudo eliminar el partido.") }
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

  async function handleGenerateSemifinals() {
    if (!semifinalPlan.ready || semifinalPlan.crosses.length === 0) return

    try {
      const createdMatches: Match[] = []

      for (const cross of semifinalPlan.crosses) {
        const res = await fetch(`/api/disciplines/${initial.slug}/matches`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            team1Id: cross.team1.id,
            team2Id: cross.team2.id,
            stage: cross.stage,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        createdMatches.push({
          id: data.id,
          score1: null,
          score2: null,
          played: false,
          stage: data.stage ?? cross.stage,
          date: null,
          team1: { id: cross.team1.id, name: cross.team1.name },
          team2: { id: cross.team2.id, name: cross.team2.name },
        })
      }

      setMatches((prev) => [...prev, ...createdMatches])
      notify(true, "Semifinales generadas.")
    } catch {
      notify(false, "No se pudieron generar las semifinales.")
    }
  }

  async function handleGenerateFinal() {
    const finalCross = finalPlan.cross
    if (!finalPlan.ready || !finalCross) return

    try {
      const res = await fetch(`/api/disciplines/${initial.slug}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team1Id: finalCross.team1.id,
          team2Id: finalCross.team2.id,
          stage: finalCross.stage,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMatches((prev) => [...prev, {
        id: data.id,
        score1: null,
        score2: null,
        played: false,
        stage: data.stage ?? finalCross.stage,
        date: null,
        team1: { id: finalCross.team1.id, name: finalCross.team1.name },
        team2: { id: finalCross.team2.id, name: finalCross.team2.name },
      }])
      notify(true, "Final generada.")
    } catch {
      notify(false, "No se pudo generar la final.")
    }
  }

  function handleScoreUpdated(updated: Match) {
    setMatches((prev) => prev.map((m) => m.id === updated.id ? updated : m))
    setScoring(null)
    notify(true, updated.played ? "Partido cerrado." : "Score guardado.")
  }

  const pending = matches.filter((m) => !m.played)
  const played  = matches.filter((m) =>  m.played)
  const teamCap = initial.teamsCount ?? null
  const remainingSpots = teamCap != null && teamCap > 0 ? Math.max(teamCap - teams.length, 0) : null
  const registrationLabel = teamCap == null || teamCap <= 0 ? "Abierto" : teams.length >= teamCap ? "Completo" : "Abierto"
  const registrationTone = teamCap != null && teamCap > 0 && teams.length >= teamCap ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20" : "bg-primary/10 text-primary border border-primary/20"
  const groupedStandings = buildGroupedStandings(teams, matches)
  const semifinalPlan = buildSemifinalPlan(groupedStandings, matches)
  const finalPlan = buildFinalPlan(matches)

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

      <div className="grid grid-cols-2 gap-3 border-b border-border bg-card px-4 py-4 sm:grid-cols-4">
        <SummaryChip label="Cupo" value={teamCap ?? "Libre"} />
        <SummaryChip label="Inscriptos" value={teams.length} />
        <SummaryChip label="Faltan" value={remainingSpots ?? "—"} highlight={remainingSpots === 0 && teamCap != null ? "success" : "default"} />
        <div className="rounded-2xl border border-border bg-background px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Estado</p>
          <div className="mt-2">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${registrationTone}`}>{registrationLabel}</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-border bg-card px-4">
        {(["participantes", "partidos", "posiciones"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "participantes" ? `Participantes (${teams.length})` : t === "partidos" ? `Partidos (${matches.length})` : `Posiciones (${groupedStandings.length})`}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">

        {/* ── Participantes ── */}
        {tab === "participantes" && (
          <>
            <button
              onClick={() => setAddOpen(true)}
              disabled={remainingSpots === 0 && teamCap != null}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 py-4 text-base font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-5 w-5" /> Agregar participante / equipo
            </button>

            {remainingSpots === 0 && teamCap != null ? (
              <p className="text-center text-sm text-muted-foreground">El cupo ya está completo. Si necesitás sumar más gente, ajustá el cupo desde la home admin.</p>
            ) : null}

            {teams.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">Todavía no hay participantes.</p>
            ) : (
              <div className="space-y-2">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{team.name}</p>
                      <div className="flex items-center gap-2">
                        {team.group ? (
                          <span className="shrink-0 rounded-lg bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                            Zona {team.group}
                          </span>
                        ) : null}
                        {team.players.length > 0 && (
                          <p className="text-xs text-muted-foreground truncate">
                            {team.players.map((p) => p.name).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    {team.players.length > 0 && (
                      <span className="shrink-0 rounded-lg bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {team.players.length}
                      </span>
                    )}
                    <button
                      onClick={() => setEditingTeam(team)}
                      className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
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
        {tab === "posiciones" && (
          <>
            <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
              <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Fase siguiente</p>
                    <p className="text-sm text-muted-foreground">Para Fútbol 5 / Pádel: genera semifinales cuando las dos zonas estén completas.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateSemifinals}
                    disabled={!semifinalPlan.ready}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Generar semifinales
                  </button>
                </div>
                {!semifinalPlan.ready ? (
                  <p className="mt-3 text-xs text-muted-foreground">{semifinalPlan.reason}</p>
                ) : (
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {semifinalPlan.crosses.map((cross) => (
                      <div key={cross.stage} className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-foreground">
                        <span className="font-semibold">{cross.stage}:</span> {cross.team1.name} vs {cross.team2.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Cierre de torneo</p>
                    <p className="text-sm text-muted-foreground">Genera la final cuando las dos semifinales ya tienen ganador.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateFinal}
                    disabled={!finalPlan.ready}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Generar final
                  </button>
                </div>
                {!finalPlan.ready ? (
                  <p className="mt-3 text-xs text-muted-foreground">{finalPlan.reason}</p>
                ) : finalPlan.cross ? (
                  <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-foreground">
                    <span className="font-semibold">{finalPlan.cross.stage}:</span> {finalPlan.cross.team1.name} vs {finalPlan.cross.team2.name}
                  </div>
                ) : null}
              </div>
            </div>

            {groupedStandings.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">Todavía no hay participantes para calcular posiciones.</p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {groupedStandings.map((group) => (
                  <StandingsTable key={group.groupName} title={group.groupName} standings={group.standings} highlightTop={2} />
                ))}
              </div>
            )}
          </>
        )}

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
                    <MatchRow
                      key={match.id}
                      match={match}
                      onTap={() => setScoring(match)}
                      onDelete={() => handleDeleteMatch(match.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {played.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Jugados</p>
                <div className="space-y-2">
                  {played.map((match) => (
                    <MatchRow
                      key={match.id}
                      match={match}
                      onTap={() => setScoring(match)}
                      onDelete={() => handleDeleteMatch(match.id)}
                    />
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

      {editingTeam ? (
        <EditTeamDialog
          team={editingTeam}
          onClose={() => setEditingTeam(null)}
          onSave={async (name, players, group) => {
            const currentTeamId = editingTeam.id
            await handleEditTeam(currentTeamId, name, players, group)
            setEditingTeam(null)
          }}
        />
      ) : null}

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

function MatchRow({
  match,
  onTap,
  onDelete,
}: {
  match: Match
  onTap: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5">
      <button
        onClick={onTap}
        className="flex w-full items-center gap-3 text-left"
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
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        aria-label="Eliminar partido"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

// ─── Add team dialog ──────────────────────────────────────────────────────────

function AddTeamDialog({
  open, onClose, onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (name: string, players: string[], group?: string) => Promise<void>
}) {
  const [name,    setName]    = useState("")
  const [players, setPlayers] = useState("")
  const [group,   setGroup]   = useState("")
  const [saving,  setSaving]  = useState(false)

  function reset() { setName(""); setPlayers(""); setGroup(""); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const playerList = players.split("\n").map((p) => p.trim()).filter(Boolean)
    await onAdd(name.trim(), playerList, group)
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
          <input
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Zona / grupo (opcional, ej: A)"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
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

function EditTeamDialog({
  team, onClose, onSave,
}: {
  team: Team
  onClose: () => void
  onSave: (name: string, players: string[], group?: string) => Promise<void>
}) {
  const [name, setName] = useState(team.name)
  const [group, setGroup] = useState(team.group ?? "")
  const [players, setPlayers] = useState(team.players.map((player) => player.name).join("\n"))
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await onSave(name.trim(), players.split("\n").map((player) => player.trim()).filter(Boolean), group)
    setSaving(false)
  }

  return (
    <Dialog open onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader><DialogTitle>Editar participante</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <input
            autoFocus
            required
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-4 text-xl outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Nombre del equipo / jugador"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <input
            className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
            placeholder="Zona / grupo (opcional, ej: A)"
            value={group}
            onChange={(event) => setGroup(event.target.value)}
          />
          <textarea
            className="min-h-24 w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground font-mono"
            placeholder={"Jugadores (opcional)\nuno por línea"}
            value={players}
            onChange={(event) => setPlayers(event.target.value)}
          />
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-border py-3.5 text-base font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={saving || !name.trim()} className="flex-1 rounded-2xl bg-primary py-3.5 text-base font-bold text-primary-foreground disabled:opacity-40">
              {saving ? "..." : "Guardar"}
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


function SummaryChip({
  label,
  value,
  highlight = "default",
}: {
  label: string
  value: string | number
  highlight?: "default" | "success"
}) {
  const valueClass = highlight === "success" ? "text-emerald-600" : "text-foreground"

  return (
    <div className="rounded-2xl border border-border bg-background px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  )
}


function buildGroupedStandings(teams: Team[], matches: Match[]) {
  const groups = teams.reduce<Record<string, Team[]>>((acc, team) => {
    const key = team.group?.trim() || "General"
    acc[key] = acc[key] ?? []
    acc[key].push(team)
    return acc
  }, {})

  return Object.entries(groups)
    .map(([groupName, groupTeams]) => ({
      groupName,
      teams: groupTeams,
      standings: calculateStandings(groupTeams, matches),
      playedMatches: countPlayedMatches(groupTeams, matches),
      expectedMatches: expectedRoundRobinMatches(groupTeams.length),
    }))
    .sort((a, b) => a.groupName.localeCompare(b.groupName))
}

function calculateStandings(teams: Team[], matches: Match[]): RankedStandingRow[] {
  const stats: Record<string, RankedStandingRow> = {}

  teams.forEach((team, index) => {
    stats[team.id] = {
      teamId: team.id,
      position: index + 1,
      teamName: team.name,
      pj: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      gf: 0,
      gc: 0,
      dg: 0,
      pts: 0,
    }
  })

  matches
    .filter((match) => match.played && match.team1 && match.team2 && stats[match.team1.id] && stats[match.team2.id])
    .forEach((match) => {
      const team1 = stats[match.team1!.id]
      const team2 = stats[match.team2!.id]
      const score1 = match.score1 ?? 0
      const score2 = match.score2 ?? 0

      team1.pj += 1
      team2.pj += 1
      team1.gf += score1
      team1.gc += score2
      team2.gf += score2
      team2.gc += score1

      if (score1 > score2) {
        team1.pg += 1
        team1.pts += 3
        team2.pp += 1
      } else if (score2 > score1) {
        team2.pg += 1
        team2.pts += 3
        team1.pp += 1
      } else {
        team1.pe += 1
        team2.pe += 1
        team1.pts += 1
        team2.pts += 1
      }

      team1.dg = team1.gf - team1.gc
      team2.dg = team2.gf - team2.gc
    })

  return Object.values(stats)
    .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf)
    .map((row, index) => ({ ...row, position: index + 1 }))
}

function countPlayedMatches(teams: Team[], matches: Match[]) {
  const teamIds = new Set(teams.map((team) => team.id))
  return matches.filter((match) => match.played && match.team1 && match.team2 && teamIds.has(match.team1.id) && teamIds.has(match.team2.id)).length
}

function expectedRoundRobinMatches(teamCount: number) {
  return teamCount >= 2 ? (teamCount * (teamCount - 1)) / 2 : 0
}

function buildSemifinalPlan(
  groupedStandings: Array<{ groupName: string; standings: RankedStandingRow[]; expectedMatches: number; playedMatches: number }>,
  matches: Match[],
) {
  const existingSemis = matches.some((match) => match.stage?.toLowerCase().includes("semi"))
  if (existingSemis) {
    return { ready: false, reason: "Las semifinales ya fueron generadas.", crosses: [] as Array<{ stage: string; team1: { id: string; name: string }; team2: { id: string; name: string } }> }
  }

  if (groupedStandings.length !== 2) {
    return { ready: false, reason: "Este generador necesita exactamente 2 zonas para armar semifinales.", crosses: [] as Array<{ stage: string; team1: { id: string; name: string }; team2: { id: string; name: string } }> }
  }

  const [groupA, groupB] = groupedStandings
  if (groupA.standings.length < 2 || groupB.standings.length < 2) {
    return { ready: false, reason: "Cada zona necesita al menos 2 clasificados para generar semifinales.", crosses: [] as Array<{ stage: string; team1: { id: string; name: string }; team2: { id: string; name: string } }> }
  }

  if (groupA.playedMatches < groupA.expectedMatches || groupB.playedMatches < groupB.expectedMatches) {
    return { ready: false, reason: "Todavía faltan partidos de zona para cerrar las posiciones.", crosses: [] as Array<{ stage: string; team1: { id: string; name: string }; team2: { id: string; name: string } }> }
  }

  return {
    ready: true,
    reason: "Listo para generar semifinales.",
    crosses: [
      {
        stage: "Semifinal 1",
        team1: { id: groupA.standings[0].teamId, name: groupA.standings[0].teamName },
        team2: { id: groupB.standings[1].teamId, name: groupB.standings[1].teamName },
      },
      {
        stage: "Semifinal 2",
        team1: { id: groupB.standings[0].teamId, name: groupB.standings[0].teamName },
        team2: { id: groupA.standings[1].teamId, name: groupA.standings[1].teamName },
      },
    ],
  }
}

function buildFinalPlan(matches: Match[]) {
  const existingFinal = matches.some((match) => match.stage?.toLowerCase() === "final")
  if (existingFinal) {
    return { ready: false, reason: "La final ya fue generada.", cross: null as null | { stage: string; team1: { id: string; name: string }; team2: { id: string; name: string } } }
  }

  const semifinals = matches.filter((match) => match.stage?.toLowerCase().includes("semifinal"))
  if (semifinals.length < 2) {
    return { ready: false, reason: "Primero tenés que generar las dos semifinales.", cross: null as null | { stage: string; team1: { id: string; name: string }; team2: { id: string; name: string } } }
  }

  const playedSemifinals = semifinals.filter((match) => match.played && match.team1 && match.team2)
  if (playedSemifinals.length < 2) {
    return { ready: false, reason: "Todavía faltan resultados en semifinales para definir la final.", cross: null as null | { stage: string; team1: { id: string; name: string }; team2: { id: string; name: string } } }
  }

  const winners = playedSemifinals.slice(0, 2).map((match) => {
    const score1 = match.score1 ?? 0
    const score2 = match.score2 ?? 0
    if (score1 === score2) return null
    return score1 > score2 ? match.team1 : match.team2
  })

  if (winners.some((winner) => !winner)) {
    return { ready: false, reason: "Las semifinales no pueden terminar empatadas para generar la final.", cross: null as null | { stage: string; team1: { id: string; name: string }; team2: { id: string; name: string } } }
  }

  if (!winners[0] || !winners[1]) {
    return { ready: false, reason: "No se pudieron determinar los finalistas.", cross: null as null | { stage: string; team1: { id: string; name: string }; team2: { id: string; name: string } } }
  }

  return {
    ready: true,
    reason: "Listo para generar la final.",
    cross: {
      stage: "Final",
      team1: { id: winners[0].id, name: winners[0].name },
      team2: { id: winners[1].id, name: winners[1].name },
    },
  }
}
