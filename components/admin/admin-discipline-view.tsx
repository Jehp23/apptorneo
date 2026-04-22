"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Minus, Plus, Swords, Trash2, Trophy, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DisciplineHeader } from "@/components/discipline-header"
import { InfoPanel } from "@/components/info-panel"
import { PremiumTabs } from "@/components/premium-tabs"
import { StandingsTable, type StandingRow } from "@/components/standings-table"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Player { id: string; name: string; seniority?: number | null }
interface Team   { id: string; name: string; group?: string | null; players: Player[] }
interface Match  {
  id: string
  team1: { id: string; name: string } | null
  team2: { id: string; name: string } | null
  score1: number | null
  score2: number | null
  played: boolean
  stage: string | null
  date: string | null
}

export interface AdminDisciplineData {
  id: string
  name: string
  slug: string
  format: string | null
  playersCount: number | null
  teamsCount: number | null
  details: string | null
  teams: Team[]
  matches: Match[]
}

// ─── Standings calculation (same as public view) ──────────────────────────────

function calculateStandings(teamIds: string[], matches: Match[], teams: Team[]): StandingRow[] {
  const stats: Record<string, StandingRow> = {}
  teamIds.forEach((id, i) => {
    const team = teams.find((t) => t.id === id)
    stats[id] = { position: i + 1, teamName: team?.name ?? id, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 }
  })
  matches
    .filter((m) => m.played && m.team1 && m.team2 && teamIds.includes(m.team1.id) && teamIds.includes(m.team2.id))
    .forEach((m) => {
      const t1 = stats[m.team1!.id]
      const t2 = stats[m.team2!.id]
      const s1 = m.score1 ?? 0, s2 = m.score2 ?? 0
      t1.pj++; t2.pj++; t1.gf += s1; t1.gc += s2; t2.gf += s2; t2.gc += s1
      if (s1 > s2)      { t1.pg++; t1.pts += 3; t2.pp++ }
      else if (s1 < s2) { t2.pg++; t2.pts += 3; t1.pp++ }
      else              { t1.pe++; t2.pe++; t1.pts++; t2.pts++ }
      t1.dg = t1.gf - t1.gc; t2.dg = t2.gf - t2.gc
    })
  return Object.values(stats)
    .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf)
    .map((row, i) => ({ ...row, position: i + 1 }))
}

function groupTeams(teams: Team[]) {
  const groups = teams.reduce<Record<string, string[]>>((acc, t) => {
    const key = t.group ?? "General"
    acc[key] = acc[key] ?? []
    acc[key].push(t.id)
    return acc
  }, {})
  return Object.entries(groups)
}

const tabs = [
  { id: "posiciones",   label: "Posiciones" },
  { id: "fixture",      label: "Fixture" },
  { id: "participantes",label: "Participantes" },
  { id: "info",         label: "Info" },
]

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminDisciplineView({ discipline }: { discipline: AdminDisciplineData }) {
  const [activeTab, setActiveTab]     = useState("posiciones")
  const [teams,     setTeams]         = useState(discipline.teams)
  const [matches,   setMatches]       = useState(discipline.matches)
  const [error,     setError]         = useState<string | null>(null)

  // add participant dialog
  const [addParticipantOpen, setAddParticipantOpen] = useState(false)
  const [newName,             setNewName]            = useState("")
  const [savingParticipant,   setSavingParticipant]  = useState(false)

  // add match dialog
  const [addMatchOpen, setAddMatchOpen] = useState(false)
  const [matchForm,    setMatchForm]    = useState({ team1Id: "", team2Id: "", stage: "" })
  const [savingMatch,  setSavingMatch]  = useState(false)

  // score match dialog
  const [scoreMatchId, setScoreMatchId] = useState<string | null>(null)

  function showError(msg: string) {
    setError(msg)
    setTimeout(() => setError(null), 4000)
  }

  // ── handlers ──

  async function handleAddParticipant() {
    if (!newName.trim()) return
    setSavingParticipant(true)
    try {
      const res  = await fetch(`/api/admin/disciplines/${discipline.slug}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), type: "SINGLE" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTeams((t) => [...t, { ...data, players: data.players ?? [] }])
      setNewName("")
      setAddParticipantOpen(false)
    } catch { showError("No se pudo inscribir.") }
    finally  { setSavingParticipant(false) }
  }

  async function handleRemove(teamId: string, teamName: string) {
    if (!confirm(`¿Eliminar a ${teamName}?`)) return
    try {
      const res = await fetch(`/api/admin/disciplines/${discipline.slug}/teams/${teamId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setTeams((t) => t.filter((x) => x.id !== teamId))
    } catch { showError("No se pudo eliminar.") }
  }

  async function handleAddMatch() {
    if (!matchForm.team1Id || !matchForm.team2Id || matchForm.team1Id === matchForm.team2Id) {
      showError("Elegí dos equipos distintos.")
      return
    }
    setSavingMatch(true)
    try {
      const res  = await fetch(`/api/disciplines/${discipline.slug}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team1Id: matchForm.team1Id, team2Id: matchForm.team2Id, stage: matchForm.stage || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const t1 = teams.find((t) => t.id === matchForm.team1Id)
      const t2 = teams.find((t) => t.id === matchForm.team2Id)
      setMatches((m) => [...m, {
        id: data.id, score1: null, score2: null, played: false, stage: data.stage ?? null, date: null,
        team1: t1 ? { id: t1.id, name: t1.name } : null,
        team2: t2 ? { id: t2.id, name: t2.name } : null,
      }])
      setMatchForm({ team1Id: "", team2Id: "", stage: "" })
      setAddMatchOpen(false)
    } catch { showError("No se pudo crear el partido.") }
    finally  { setSavingMatch(false) }
  }

  function updateMatch(matchId: string, updates: Partial<Match>) {
    setMatches((m) => m.map((x) => x.id === matchId ? { ...x, ...updates } : x))
  }

  // ── derived data ──

  const isFull          = discipline.teamsCount !== null && teams.length >= discipline.teamsCount
  const scoringMatch    = matches.find((m) => m.id === scoreMatchId) ?? null
  const upcomingMatches = useMemo(
    () => matches.filter((m) => !m.played).slice(0, 4).map((m) => ({
      team1: m.team1?.name ?? "Por definir",
      team2: m.team2?.name ?? "Por definir",
      date:  m.date ?? undefined,
    })),
    [matches]
  )

  const groupedStandings = useMemo(
    () => groupTeams(teams).map(([groupName, teamIds]) => ({
      groupName,
      standings: calculateStandings(teamIds, matches, teams),
    })),
    [teams, matches]
  )

  const fixtureGroups = useMemo(
    () => groupTeams(teams).map(([groupName, teamIds]) => ({
      groupName,
      matches: matches
        .filter((m) => m.team1 && m.team2 && teamIds.includes(m.team1.id) && teamIds.includes(m.team2.id))
        .map((m, i) => ({ ...m, matchNumber: i + 1 })),
    })),
    [teams, matches]
  )

  // ── render ──

  return (
    <div className="p-8">
      <Link
        href="/admin/operacion"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al torneo
      </Link>

      {error ? (
        <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <DisciplineHeader
        name={discipline.name}
        Icon={Trophy}
        description={discipline.format ?? "Administración de disciplina"}
      />

      <div className="flex gap-8">
        <div className="min-w-0 flex-1">
          <PremiumTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* ── Posiciones ── */}
          {activeTab === "posiciones" && (
            <div className="grid gap-6 lg:grid-cols-2">
              {groupedStandings.map((group) => (
                <StandingsTable
                  key={group.groupName}
                  title={group.groupName}
                  standings={group.standings}
                  highlightTop={2}
                />
              ))}
            </div>
          )}

          {/* ── Fixture ── */}
          {activeTab === "fixture" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                {teams.length >= 2 ? (
                  <button
                    onClick={() => setAddMatchOpen(true)}
                    className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Swords className="h-4 w-4" />
                    Nuevo partido
                  </button>
                ) : null}
              </div>

              {fixtureGroups.map((group) => (
                <div key={group.groupName} className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="border-b border-border px-5 py-4">
                    <h3 className="font-serif font-semibold text-foreground">{group.groupName}</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {group.matches.length === 0 ? (
                      <p className="px-5 py-6 text-sm text-muted-foreground">Sin partidos todavía.</p>
                    ) : (
                      group.matches.map((match, index) => (
                        <div
                          key={match.id}
                          className={`flex cursor-pointer items-center px-5 py-4 transition-colors hover:bg-muted/40 ${
                            index % 2 === 1 ? "bg-muted/20" : ""
                          } ${!match.played ? "hover:bg-primary/5" : ""}`}
                          onClick={() => !match.played && setScoreMatchId(match.id)}
                        >
                          <span className="w-8 font-mono text-xs text-muted-foreground">
                            {String(match.matchNumber).padStart(2, "0")}
                          </span>
                          <div className="flex flex-1 items-center justify-center gap-4">
                            <span className="flex-1 truncate text-right font-medium text-foreground">
                              {match.team1?.name ?? "Por definir"}
                            </span>
                            {match.played ? (
                              <div className="flex min-w-[80px] items-center justify-center gap-3 rounded-lg bg-muted/50 px-3 py-1.5">
                                <span className="font-mono font-semibold text-foreground">{match.score1 ?? 0}</span>
                                <span className="text-xs text-muted-foreground">-</span>
                                <span className="font-mono font-semibold text-foreground">{match.score2 ?? 0}</span>
                              </div>
                            ) : (
                              <span className="min-w-[80px] rounded-lg bg-amber-500/10 px-3 py-1.5 text-center text-xs font-medium text-amber-600">
                                Cargar
                              </span>
                            )}
                            <span className="flex-1 truncate text-left font-medium text-foreground">
                              {match.team2?.name ?? "Por definir"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Participantes ── */}
          {activeTab === "participantes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {teams.length}
                  {discipline.teamsCount ? ` / ${discipline.teamsCount}` : ""} inscriptos
                </p>
                {!isFull ? (
                  <button
                    onClick={() => setAddParticipantOpen(true)}
                    className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <UserPlus className="h-4 w-4" />
                    Agregar
                  </button>
                ) : (
                  <span className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-600">
                    Cupo completo
                  </span>
                )}
              </div>

              {teams.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
                  Sin participantes todavía.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {teams.map((team) => (
                    <div key={team.id} className="overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
                      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                        <span className="font-semibold text-foreground">{team.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemove(team.id, team.name)}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {team.players.length > 0 ? (
                        <ul className="divide-y divide-border">
                          {team.players.map((player, i) => (
                            <li
                              key={player.id}
                              className={`flex items-center justify-between px-4 py-2.5 text-sm ${i % 2 === 1 ? "bg-muted/20" : ""}`}
                            >
                              <span className="text-foreground">{player.name}</span>
                              {player.seniority != null ? (
                                <span className="font-mono text-xs text-muted-foreground">{player.seniority}a</span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Info ── */}
          {activeTab === "info" && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">Información general</h2>
              <p className="mt-3 whitespace-pre-line text-muted-foreground">
                {discipline.details ?? "Todavía no hay detalles cargados para esta disciplina."}
              </p>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="hidden w-80 flex-shrink-0 xl:block">
          <InfoPanel
            teams={teams.length}
            players={teams.reduce((acc, t) => acc + t.players.length, 0)}
            format={discipline.format ?? "Formato sin definir"}
            classification="Top según puntos y diferencia"
            upcomingMatches={upcomingMatches}
          />
        </div>
      </div>

      {/* ── Dialog: agregar participante ── */}
      <Dialog open={addParticipantOpen} onOpenChange={(o) => { setAddParticipantOpen(o); if (!o) setNewName("") }}>
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
              <button type="button" onClick={() => setAddParticipantOpen(false)}
                className="flex-1 rounded-2xl border border-border py-3 text-base font-medium">
                Cancelar
              </button>
              <button type="button" disabled={savingParticipant || !newName.trim()} onClick={handleAddParticipant}
                className="flex-1 rounded-2xl bg-primary py-3 text-base font-bold text-primary-foreground disabled:opacity-40">
                {savingParticipant ? "..." : "Guardar"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: nuevo partido ── */}
      <Dialog open={addMatchOpen} onOpenChange={(o) => { setAddMatchOpen(o); if (!o) setMatchForm({ team1Id: "", team2Id: "", stage: "" }) }}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Nuevo partido</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <select className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-lg outline-none focus:border-primary"
              value={matchForm.team1Id} onChange={(e) => setMatchForm((f) => ({ ...f, team1Id: e.target.value }))}>
              <option value="">Equipo 1...</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-lg outline-none focus:border-primary"
              value={matchForm.team2Id} onChange={(e) => setMatchForm((f) => ({ ...f, team2Id: e.target.value }))}>
              <option value="">Equipo 2...</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
              placeholder="Fase (opcional)" value={matchForm.stage}
              onChange={(e) => setMatchForm((f) => ({ ...f, stage: e.target.value }))} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setAddMatchOpen(false)}
                className="flex-1 rounded-2xl border border-border py-3 text-base font-medium">
                Cancelar
              </button>
              <button type="button" disabled={savingMatch || !matchForm.team1Id || !matchForm.team2Id} onClick={handleAddMatch}
                className="flex-1 rounded-2xl bg-primary py-3 text-base font-bold text-primary-foreground disabled:opacity-40">
                {savingMatch ? "..." : "Crear"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: cargar resultado ── */}
      {scoringMatch ? (
        <ScoreDialog
          match={scoringMatch}
          onClose={() => setScoreMatchId(null)}
          onUpdate={(u) => { updateMatch(scoringMatch.id, u); if (u.played) setScoreMatchId(null) }}
          onError={showError}
        />
      ) : null}
    </div>
  )
}

// ─── Score dialog ─────────────────────────────────────────────────────────────

function ScoreDialog({
  match, onClose, onUpdate, onError,
}: {
  match: Match
  onClose: () => void
  onUpdate: (u: Partial<Match>) => void
  onError:  (msg: string) => void
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
      if (!res.ok) throw new Error(data.error)
      onUpdate({ score1: data.score1, score2: data.score2, played: data.played })
    } catch { onError("No se pudo guardar.") }
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
          {([
            { score: score1, setScore: setScore1, name: match.team1?.name },
            null,
            { score: score2, setScore: setScore2, name: match.team2?.name },
          ] as const).map((side, i) =>
            side === null ? (
              <div key={i} className="text-center text-2xl font-black text-muted-foreground">—</div>
            ) : (
              <div key={i} className="flex flex-col items-center gap-3">
                <p className="w-full truncate text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {side.name}
                </p>
                <button type="button" onClick={() => side.setScore((s) => s + 1)}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary bg-primary/10 text-primary transition-transform active:scale-95">
                  <Plus className="h-7 w-7" />
                </button>
                <span className="text-6xl font-black tabular-nums text-foreground">{side.score}</span>
                <button type="button" onClick={() => side.setScore((s) => Math.max(0, s - 1))}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-border bg-background text-foreground transition-transform active:scale-95">
                  <Minus className="h-7 w-7" />
                </button>
              </div>
            )
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" disabled={saving} onClick={() => save(false)}
            className="flex-1 rounded-2xl border border-border py-3.5 text-base font-semibold disabled:opacity-40">
            Guardar
          </button>
          <button type="button" disabled={saving} onClick={() => save(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-base font-bold text-white hover:bg-emerald-700 disabled:opacity-40">
            <Check className="h-5 w-5" />
            Cerrar partido
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
