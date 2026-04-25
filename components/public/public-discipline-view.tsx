"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Clock, Minus, Plus, Swords, Trash2, Trophy, UserPlus, List, Calendar, Users } from "lucide-react"

import { DisciplineHeader } from "@/components/discipline-header"
import { LiveIndicator } from "@/components/live-indicator"
import { ChampionBanner } from "@/components/champion-banner"
import { ScorersTable } from "@/components/scorers-table"
import { InfoPanel } from "@/components/info-panel"
import { PremiumTabs } from "@/components/premium-tabs"
import { StandingsTable } from "@/components/standings-table"
import { SimpleStandingsTable } from "@/components/simple-standings-table"
import { CompactStandingsTable } from "@/components/compact-standings-table"
import { LobaTableView, type LobaTable } from "@/components/loba-table-view"
import { Bracket, type BracketMatch } from "@/components/bracket"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  buildBracketPlan,
  buildGroupedStandings,
  detectChampion,
  detectStandingsVariant,
  getCurrentPhase,
  type AdminDisciplineMatch as Match,
  type AdminDisciplineTeam as Team,
  type RankedSimpleStandingRow,
  type RankedStandingRow,
} from "@/lib/admin-discipline-workflows"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Player { id: string; name: string; seniority?: number | null }

export interface PublicDisciplineData {
  id: string
  name: string
  slug: string
  format?: string | null
  playersCount?: number | null
  teamsCount?: number | null
  details?: string | null
  teams: Team[]
  matches: Match[]
}

const tabs = [
  { id: "posiciones",    label: "Posiciones", icon: List },
  { id: "fixture",       label: "Fixture", icon: Calendar },
  { id: "participantes", label: "Participantes", icon: Users },
]

// ─── Main component ───────────────────────────────────────────────────────────

export function PublicDisciplineView({
  discipline,
}: {
  discipline: PublicDisciplineData
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("posiciones")
  const [teams,   setTeams]   = useState(discipline.teams)
  const [matches, setMatches] = useState(discipline.matches)
  const [error,   setError]   = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [tableWinners, setTableWinners] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch("/api/admin/me", { credentials: "include" }).then((r) => { if (r.ok) setIsAdmin(true) })
  }, [])

  // Auto-refresh cada 30s para participantes no-admin
  useEffect(() => {
    if (isAdmin) return
    const id = window.setInterval(() => router.refresh(), 30_000)
    return () => window.clearInterval(id)
  }, [isAdmin, router])

  // admin: add participant
  const [addParticipantOpen, setAddParticipantOpen] = useState(false)
  const [newName,            setNewName]            = useState("")
  const [savingParticipant,  setSavingParticipant]  = useState(false)

  // admin: add match
  const [addMatchOpen, setAddMatchOpen] = useState(false)
  const [matchForm,    setMatchForm]    = useState({ team1Id: "", team2Id: "", stage: "" })
  const [savingMatch,  setSavingMatch]  = useState(false)

  // admin: score match
  const [scoreMatchId, setScoreMatchId] = useState<string | null>(null)

  // admin: schedule match
  const [dateMatchId, setDateMatchId] = useState<string | null>(null)

  function redirectToLogin() {
    const next = encodeURIComponent(window.location.pathname)
    router.push(`/admin/login?next=${next}`)
  }

  function showError(msg: string) {
    setError(msg)
    setTimeout(() => setError(null), 4000)
  }

  async function handleAddParticipant() {
    if (!newName.trim()) return
    setSavingParticipant(true)
    try {
      const res  = await fetch(`/api/admin/disciplines/${discipline.slug}/teams`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), type: "SINGLE" }),
      })
      if (res.status === 401) {
        redirectToLogin()
        return
      }
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
      const res = await fetch(`/api/admin/disciplines/${discipline.slug}/teams/${teamId}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (res.status === 401) {
        redirectToLogin()
        return
      }
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
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team1Id: matchForm.team1Id, team2Id: matchForm.team2Id, stage: matchForm.stage || undefined }),
      })
      if (res.status === 401) {
        redirectToLogin()
        return
      }
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

  function handleLobaWinnerSelect(tableId: string, winnerId: string) {
    setTableWinners((prev) => ({ ...prev, [tableId]: winnerId }))
  }

  // ── derived ──

  const isFull = discipline.teamsCount !== null && teams.length >= (discipline.teamsCount ?? Infinity)

  const standingsVariant = useMemo(() => detectStandingsVariant(discipline.slug, discipline.format), [discipline.format, discipline.slug])

  const groupedStandings = useMemo(
    () => buildGroupedStandings(teams, matches, standingsVariant),
    [teams, matches, standingsVariant]
  )

  const currentPhase = useMemo(() => getCurrentPhase(discipline.slug, matches, teams), [teams, matches, standingsVariant])

  const champion = useMemo(() => detectChampion(matches), [matches])

  // Build Loba tables from teams (using group field)
  const lobaTables = useMemo(() => {
    if (standingsVariant !== "loba") return []

    const groups = teams.reduce<Record<string, Team[]>>((acc, team) => {
      const key = team.group?.trim() || "General"
      acc[key] = acc[key] ?? []
      acc[key].push(team)
      return acc
    }, {})

    return Object.entries(groups)
      .filter(([_, groupTeams]) => groupTeams.length > 0)
      .map(([groupName, groupTeams], index) => ({
        id: groupName,
        name: groupName === "General" ? `Mesa ${index + 1}` : groupName,
        teams: groupTeams.map((t) => ({ id: t.id, name: t.name, seed: t.seed })),
        winnerId: groupTeams.find(t => t.seed === -1)?.id ?? tableWinners[groupName] ?? null,
        isFinal: groupName.toLowerCase().includes("final"),
      }))
  }, [teams, standingsVariant, tableWinners])

  // For Sapo, get overall standings (not grouped)
  const sapoStandings = useMemo(() => {
    if (standingsVariant !== "sapo") return []
    // Use seed-based standings (total group phase points per team)
    return [...teams]
      .filter(t => t.seed !== null && t.seed !== undefined && t.seed >= 0)
      .sort((a, b) => (b.seed ?? 0) - (a.seed ?? 0))
      .map((t, i) => ({ teamId: t.id, teamName: t.name, position: i + 1, pj: 0, pg: 0, pp: 0, pts: t.seed ?? 0 }))
  }, [teams, standingsVariant])

  // For Sapo bracket display
  const bracketMatches = useMemo(() => {
    if (standingsVariant !== "sapo") return null
    const eliminationMatches = matches.filter(m =>
      m.stage?.toLowerCase().includes("cuarto") ||
      m.stage?.toLowerCase().includes("semi") ||
      m.stage === "Final" ||
      m.stage === "3er Puesto" ||
      m.stage?.includes("°") || // 1° vs 8°, etc.
      m.stage?.includes("vs")
    )
    if (eliminationMatches.length === 0) return null

    const toBracketMatch = (m: Match): BracketMatch => ({
      id: m.id,
      team1: m.team1?.name ?? "Por definir",
      team2: m.team2?.name ?? "Por definir",
      score1: m.score1 ?? "-",
      score2: m.score2 ?? "-",
      played: m.played,
      winner: m.played ? (m.score1 ?? 0) >= (m.score2 ?? 0) ? m.team1?.name : m.team2?.name : undefined,
    })

    const semifinals = eliminationMatches.filter(m => m.stage?.toLowerCase().startsWith("semi")).map(toBracketMatch)
    const finalMatch = eliminationMatches.find(m => m.stage === "Final")
    const thirdPlaceMatch = eliminationMatches.find(m => m.stage === "3er Puesto")

    return {
      semifinals,
      final: finalMatch ? toBracketMatch(finalMatch) : undefined,
      thirdPlace: thirdPlaceMatch ? toBracketMatch(thirdPlaceMatch) : undefined,
    }
  }, [matches, standingsVariant])

  const fixtureGroups = useMemo(
    () => groupedStandings.map((group) => ({
      groupName: group.groupName,
      matches: matches
        .filter((m) => {
          if (!m.team1 || !m.team2) return false
          const teamIds = group.teams.map((team) => team.id)
          return teamIds.includes(m.team1.id) && teamIds.includes(m.team2.id)
        })
        .map((m, i) => ({ ...m, matchNumber: i + 1 })),
    })),
    [groupedStandings, matches]
  )

  const eliminationMatches = useMemo(() => {
    const coveredIds = new Set(
      fixtureGroups.flatMap((g) => g.matches.map((m) => m.id))
    )
    return matches.filter((m) => m.team1 && m.team2 && !coveredIds.has(m.id))
  }, [fixtureGroups, matches])

  const upcomingMatches = useMemo(
    () => matches.filter((m) => !m.played).slice(0, 4).map((m) => ({
      team1: m.team1?.name ?? "Por definir",
      team2: m.team2?.name ?? "Por definir",
      date:  m.date ?? undefined,
    })),
    [matches]
  )

  const scoringMatch = matches.find((m) => m.id === scoreMatchId) ?? null

  return (
    <div className="p-6">
      <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/torneo" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        {!isAdmin && <LiveIndicator />}
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <DisciplineHeader
        name={discipline.name}
        Icon={Trophy}
        description={discipline.format ?? ""}
      />

      {champion && (
        <div className="mb-6">
          <ChampionBanner
            disciplineName={discipline.name}
            championName={champion.championName}
            score1={champion.score1}
            score2={champion.score2}
            runnerUpName={champion.runnerUpName}
          />
        </div>
      )}

      <div className="mb-6 rounded-xl bg-primary/10 border border-primary/20 px-4 py-3">
        <p className="text-sm font-semibold text-primary">{currentPhase.label}</p>
        <p className="text-xs text-muted-foreground">{currentPhase.description}</p>
      </div>

      {isAdmin && (
        <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <p className="mr-2 self-center text-xs font-semibold text-primary">Admin</p>
          <button
            onClick={() => setAddParticipantOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
          >
            <UserPlus className="h-4 w-4" /> Agregar
          </button>
          {teams.length >= 2 && (
            <button
              onClick={() => setAddMatchOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
            >
              <Swords className="h-4 w-4" /> Partido
            </button>
          )}
        </div>
      )}

      <div className="flex gap-6">
        <div className="min-w-0 flex-1">
          <PremiumTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* ── Posiciones ── */}
          {activeTab === "posiciones" && (
            <>
              {standingsVariant === "sapo" ? (
                <>
                  {sapoStandings.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                      No hay participantes.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-border bg-card p-4">
                        <h3 className="mb-3 font-serif text-sm font-semibold text-foreground">Tabla de Clasificación</h3>
                        <SimpleStandingsTable title="" standings={sapoStandings} highlightTop={8} />
                      </div>
                      {bracketMatches && bracketMatches.semifinals.length > 0 && (
                        <Bracket
                          title="Bracket Eliminatorio"
                          semifinals={bracketMatches.semifinals}
                          final={bracketMatches.final}
                          thirdPlace={bracketMatches.thirdPlace}
                        />
                      )}
                    </div>
                  )}
                </>
              ) : standingsVariant === "loba" ? (
                <>
                  {lobaTables.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                      No hay mesas configuradas.
                    </p>
                  ) : (
                    <LobaTableView
                      tables={lobaTables}
                      onWinnerSelect={handleLobaWinnerSelect}
                      isEditable={isAdmin}
                    />
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className={(standingsVariant === "compact" || standingsVariant === "metegol") ? "grid gap-3 md:grid-cols-2 lg:grid-cols-3" : "grid gap-4"}>
                    {groupedStandings.map((group) => (
                      standingsVariant === "metegol" ? (
                        <CompactStandingsTable key={group.groupName} title={group.groupName} standings={group.standings as RankedSimpleStandingRow[]} highlightTop={1} showBonus />
                      ) : standingsVariant === "compact" ? (
                        <CompactStandingsTable key={group.groupName} title={group.groupName} standings={group.standings as RankedSimpleStandingRow[]} highlightTop={1} />
                      ) : standingsVariant === "simple" ? (
                        <SimpleStandingsTable key={group.groupName} title={group.groupName} standings={group.standings as RankedSimpleStandingRow[]} highlightTop={2} showPC />
                      ) : standingsVariant === "padel" ? (
                        <SimpleStandingsTable key={group.groupName} title={group.groupName} standings={group.standings as RankedSimpleStandingRow[]} highlightTop={2} showBonus />
                      ) : (
                        <StandingsTable key={group.groupName} title={group.groupName} standings={group.standings as RankedStandingRow[]} highlightTop={2} />
                      )
                    ))}
                  </div>
                  {standingsVariant === "classic" && (
                    <ScorersTable slug={discipline.slug} isAdmin={false} />
                  )}
                </div>
              )}
            </>
          )}

          {/* ── Fixture ── */}
          {activeTab === "fixture" && (
            <div className="space-y-4">
              {isAdmin && teams.length >= 2 && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setAddMatchOpen(true)}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Swords className="h-4 w-4" /> Nuevo partido
                  </button>
                </div>
              )}
              {fixtureGroups.map((group) => (
                <div key={group.groupName} className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="border-b border-border px-4 py-3">
                    <h3 className="font-serif text-sm font-semibold text-foreground">{group.groupName}</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {group.matches.length === 0 ? (
                      <p className="px-4 py-6 text-xs text-muted-foreground">Sin partidos.</p>
                    ) : group.matches.map((match, index) => {
                        const s1 = match.score1 ?? 0
                        const s2 = match.score2 ?? 0
                        const w1 = match.played && s1 > s2
                        const w2 = match.played && s2 > s1
                        return (
                          <div key={match.id} className={`px-4 py-3 transition-colors ${index % 2 === 1 ? "bg-muted/20" : ""}`}>
                            <div
                              onClick={() => isAdmin && !match.played && setScoreMatchId(match.id)}
                              className={`grid grid-cols-[1fr_80px_1fr] items-center gap-2 ${isAdmin && !match.played ? "cursor-pointer" : ""}`}
                            >
                              <div className="flex items-center justify-end gap-2">
                                <span className={`text-sm text-right leading-snug ${w1 ? "font-bold text-foreground" : match.played ? "font-medium text-muted-foreground" : "font-medium text-foreground"}`}>
                                  {match.team1?.name ?? "Por definir"}
                                </span>
                                {w1 && <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-primary" />}
                              </div>
                              <div className="flex items-center justify-center">
                                {match.played ? (
                                  <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 shadow-sm">
                                    <span className={`w-5 text-center font-mono font-bold text-sm leading-none ${w1 ? "text-primary" : "text-foreground"}`}>{s1}</span>
                                    <span className="text-muted-foreground/40 text-xs leading-none">–</span>
                                    <span className={`w-5 text-center font-mono font-bold text-sm leading-none ${w2 ? "text-primary" : "text-foreground"}`}>{s2}</span>
                                  </div>
                                ) : (
                                  <span className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${isAdmin ? "bg-amber-500/10 text-amber-600" : "text-muted-foreground/50"}`}>
                                    {isAdmin ? "cargar" : "vs"}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-start gap-2">
                                {w2 && <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-primary" />}
                                <span className={`text-sm text-left leading-snug ${w2 ? "font-bold text-foreground" : match.played ? "font-medium text-muted-foreground" : "font-medium text-foreground"}`}>
                                  {match.team2?.name ?? "Por definir"}
                                </span>
                              </div>
                            </div>
                            {isAdmin && !match.played && (
                              <div className="mt-1.5 flex justify-center">
                                <button
                                  onClick={() => setDateMatchId(match.id)}
                                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                                >
                                  <Clock className="h-3 w-3" />
                                  {match.date
                                    ? new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" }).format(new Date(match.date))
                                    : "Agregar horario"}
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </div>
              ))}
              {eliminationMatches.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-primary/20 bg-card">
                  <div className="border-b border-primary/20 bg-primary/5 px-4 py-3">
                    <h3 className="font-serif text-sm font-semibold text-primary">Eliminatorias</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {eliminationMatches.map((match, index) => {
                      const s1 = match.score1 ?? 0
                      const s2 = match.score2 ?? 0
                      const w1 = match.played && s1 > s2
                      const w2 = match.played && s2 > s1
                      return (
                        <div key={match.id} className={`px-4 py-3 ${index % 2 === 1 ? "bg-muted/20" : ""}`}>
                          {(match.stage || match.date) && (
                            <div className="flex items-center justify-between mb-1">
                              {match.stage && (
                                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">{match.stage}</span>
                              )}
                              {match.date && !match.played && (
                                <span className="text-[10px] font-medium text-muted-foreground">
                                  {new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" }).format(new Date(match.date))}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="grid grid-cols-[1fr_80px_1fr] items-center gap-2">
                            <div className="flex items-center justify-end gap-2">
                              <span className={`text-sm text-right leading-snug ${w1 ? "font-bold text-foreground" : match.played ? "font-medium text-muted-foreground" : "font-medium text-foreground"}`}>
                                {match.team1?.name ?? "Por definir"}
                              </span>
                              {w1 && <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-primary" />}
                            </div>
                            <div className="flex items-center justify-center">
                              {match.played ? (
                                <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 shadow-sm">
                                  <span className={`w-5 text-center font-mono font-bold text-sm leading-none ${w1 ? "text-primary" : "text-foreground"}`}>{s1}</span>
                                  <span className="text-muted-foreground/40 text-xs leading-none">–</span>
                                  <span className={`w-5 text-center font-mono font-bold text-sm leading-none ${w2 ? "text-primary" : "text-foreground"}`}>{s2}</span>
                                </div>
                              ) : (
                                <span className="rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">vs</span>
                              )}
                            </div>
                            <div className="flex items-center justify-start gap-2">
                              {w2 && <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-primary" />}
                              <span className={`text-sm text-left leading-snug ${w2 ? "font-bold text-foreground" : match.played ? "font-medium text-muted-foreground" : "font-medium text-foreground"}`}>
                                {match.team2?.name ?? "Por definir"}
                              </span>
                            </div>
                          </div>
                          {isAdmin && !match.played && (
                            <div className="mt-1.5 flex justify-center">
                              <button
                                onClick={() => setDateMatchId(match.id)}
                                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Clock className="h-3 w-3" />
                                {match.date
                                  ? new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" }).format(new Date(match.date))
                                  : "Agregar horario"}
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Participantes ── */}
          {activeTab === "participantes" && (
            <div className="space-y-4">
              {isAdmin && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {teams.length}{discipline.teamsCount ? ` / ${discipline.teamsCount}` : ""} inscriptos
                  </p>
                  {!isFull ? (
                    <button
                      onClick={() => setAddParticipantOpen(true)}
                      className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
                    >
                      <UserPlus className="h-4 w-4" /> Agregar
                    </button>
                  ) : (
                    <span className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600">Cupo completo</span>
                  )}
                </div>
              )}
              {teams.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
                  Sin participantes.
                </div>
              ) : (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {teams.map((team) => (
                    <div key={team.id} className="overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-sm">
                      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
                        <span className="font-medium text-foreground">{team.name}</span>
                        <div className="flex items-center gap-2">
                          {team.players.length > 0 && (
                            <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              {team.players.length}
                            </span>
                          )}
                          {isAdmin && (
                            <button type="button" onClick={() => handleRemove(team.id, team.name)}
                              className="text-muted-foreground transition-colors hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      {team.players.length > 0 && (
                        <ul className="divide-y divide-border">
                          {team.players.map((player, i) => (
                            <li key={player.id} className={`flex items-center justify-between px-4 py-2 text-xs ${i % 2 === 1 ? "bg-muted/20" : ""}`}>
                              <span className="text-foreground">{player.name}</span>
                              {player.seniority != null && (
                                <span className="font-mono text-xs text-muted-foreground">{player.seniority}a</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {discipline.details && (
            <details className="mt-4 rounded-2xl border border-border bg-card">
              <summary className="cursor-pointer select-none px-5 py-4 text-sm font-medium text-muted-foreground hover:text-foreground">
                Ver reglamento
              </summary>
              <div className="px-5 pb-5">
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {discipline.details}
                </p>
              </div>
            </details>
          )}
        </div>

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

      {/* ── Dialogs (admin only) ── */}

      <Dialog open={addParticipantOpen} onOpenChange={(o) => { setAddParticipantOpen(o); if (!o) setNewName("") }}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Agregar participante</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-1">
            <input autoFocus className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base outline-none placeholder:text-muted-foreground"
              placeholder="Nombre..." value={newName} onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddParticipant() }} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setAddParticipantOpen(false)} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium">Cancelar</button>
              <button type="button" disabled={savingParticipant || !newName.trim()} onClick={handleAddParticipant}
                className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-40">
                {savingParticipant ? "..." : "Guardar"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addMatchOpen} onOpenChange={(o) => { setAddMatchOpen(o); if (!o) setMatchForm({ team1Id: "", team2Id: "", stage: "" }) }}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Nuevo partido</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-1">
            <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base outline-none focus:border-primary"
              value={matchForm.team1Id} onChange={(e) => setMatchForm((f) => ({ ...f, team1Id: e.target.value }))}>
              <option value="">Equipo 1...</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base outline-none focus:border-primary"
              value={matchForm.team2Id} onChange={(e) => setMatchForm((f) => ({ ...f, team2Id: e.target.value }))}>
              <option value="">Equipo 2...</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
              placeholder="Fase (opcional)" value={matchForm.stage} onChange={(e) => setMatchForm((f) => ({ ...f, stage: e.target.value }))} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setAddMatchOpen(false)} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium">Cancelar</button>
              <button type="button" disabled={savingMatch || !matchForm.team1Id || !matchForm.team2Id} onClick={handleAddMatch}
                className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-40">
                {savingMatch ? "..." : "Crear"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {scoringMatch && (
        <ScoreDialog
          match={scoringMatch}
          onClose={() => setScoreMatchId(null)}
          onUpdate={(u) => { updateMatch(scoringMatch.id, u); if (u.played) setScoreMatchId(null) }}
          onError={showError}
          onUnauthorized={redirectToLogin}
        />
      )}

      {dateMatchId && (() => {
        const m = matches.find((x) => x.id === dateMatchId)
        return m ? (
          <DateDialog
            match={m}
            onClose={() => setDateMatchId(null)}
            onUpdate={(u) => { updateMatch(m.id, u); setDateMatchId(null) }}
            onError={showError}
            onUnauthorized={redirectToLogin}
          />
        ) : null
      })()}
    </div>
    </div>
  )
}

// ─── Score dialog ─────────────────────────────────────────────────────────────

function ScoreDialog({ match, onClose, onUpdate, onError, onUnauthorized }: {
  match: Match
  onClose: () => void
  onUpdate: (u: Partial<Match>) => void
  onError: (msg: string) => void
  onUnauthorized: () => void
}) {
  const [score1, setScore1] = useState(match.score1 ?? 0)
  const [score2, setScore2] = useState(match.score2 ?? 0)
  const [saving, setSaving] = useState(false)

  async function save(played: boolean) {
    setSaving(true)
    try {
      const res  = await fetch(`/api/admin/matches/${match.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score1, score2, played }),
      })
      if (res.status === 401) {
        onUnauthorized()
        return
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onUpdate({ score1: data.score1, score2: data.score2, played: data.played })
    } catch { onError("No se pudo guardar.") }
    finally  { setSaving(false) }
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-base font-semibold text-muted-foreground">
            {match.team1?.name ?? "—"} vs {match.team2?.name ?? "—"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 items-center gap-4 py-2">
          {[
            { score: score1, set: setScore1, name: match.team1?.name },
            null,
            { score: score2, set: setScore2, name: match.team2?.name },
          ].map((side, i) =>
            !side ? (
              <div key={i} className="text-center text-2xl font-black text-muted-foreground">—</div>
            ) : (
              <div key={i} className="flex flex-col items-center gap-3">
                <p className="w-full truncate text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">{side.name}</p>
                <button type="button" onClick={() => side.set((s) => s + 1)}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary bg-primary/10 text-primary active:scale-95 transition-transform">
                  <Plus className="h-7 w-7" />
                </button>
                <span className="text-6xl font-black tabular-nums">{side.score}</span>
                <button type="button" onClick={() => side.set((s) => Math.max(0, s - 1))}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-border bg-background text-foreground active:scale-95 transition-transform">
                  <Minus className="h-7 w-7" />
                </button>
              </div>
            )
          )}
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" disabled={saving} onClick={() => save(false)}
            className="flex-1 rounded-2xl border border-border py-3.5 text-base font-semibold disabled:opacity-40">Guardar</button>
          <button type="button" disabled={saving} onClick={() => save(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-base font-bold text-white hover:bg-emerald-700 disabled:opacity-40">
            <Check className="h-5 w-5" /> Cerrar partido
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Date dialog ──────────────────────────────────────────────────────────────

function DateDialog({ match, onClose, onUpdate, onError, onUnauthorized }: {
  match: Match
  onClose: () => void
  onUpdate: (u: Partial<Match>) => void
  onError: (msg: string) => void
  onUnauthorized: () => void
}) {
  const toARParts = (iso: string) => {
    const d = new Date(iso)
    const date = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit" }).format(d)
    const time = new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", hour: "2-digit", minute: "2-digit", hour12: false }).format(d)
    return { date, time }
  }

  const defaults = match.date ? toARParts(match.date) : { date: "", time: "" }
  const [dateVal, setDateVal] = useState(defaults.date)
  const [timeVal, setTimeVal] = useState(defaults.time)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!dateVal || !timeVal) return
    setSaving(true)
    try {
      const iso = new Date(`${dateVal}T${timeVal}:00-03:00`).toISOString()
      const res = await fetch(`/api/admin/matches/${match.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: iso }),
      })
      if (res.status === 401) { onUnauthorized(); return }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onUpdate({ date: data.date ? new Date(data.date).toISOString() : null })
    } catch { onError("No se pudo guardar el horario.") }
    finally { setSaving(false) }
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Horario del partido</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-2">
          {match.team1?.name ?? "?"} vs {match.team2?.name ?? "?"}
        </p>
        <div className="space-y-3 pt-1">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Fecha</label>
            <input
              type="date"
              value={dateVal}
              onChange={(e) => setDateVal(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Hora (Argentina)</label>
            <input
              type="time"
              value={timeVal}
              onChange={(e) => setTimeVal(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium">Cancelar</button>
            <button type="button" disabled={saving || !dateVal || !timeVal} onClick={save}
              className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-40">
              {saving ? "..." : "Guardar"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
