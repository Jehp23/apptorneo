"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Minus, Pencil, Plus, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { StandingsTable } from "@/components/standings-table"
import { SimpleStandingsTable } from "@/components/simple-standings-table"
import { CompactStandingsTable } from "@/components/compact-standings-table"
import { LobaTableView, type LobaTable } from "@/components/loba-table-view"
import {
  buildBracketFinalPlan,
  buildBracketPlan,
  buildBracketSemifinalPlan,
  buildFinalPlan,
  buildGroupedStandings,
  buildHexagonalFinalPlan,
  buildSemifinalPlan,
  detectStandingsVariant,
  getCurrentPhase,
  getZoneOptions,
  type AdminDisciplineMatch as Match,
  type AdminDisciplineTeam as Team,
  type BracketPlan,
  type HexagonalPlan,
  type RankedSimpleStandingRow,
  type RankedStandingRow,
} from "@/lib/admin-discipline-workflows"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Discipline {
  id: string; name: string; slug: string
  format?: string | null; details?: string | null
  teamsCount?: number | null; playersCount?: number | null
  teams: Team[]; matches: Match[]
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminDisciplineView({ discipline: initial }: { discipline: Discipline }) {
  const router = useRouter()
  const [teams,   setTeams]   = useState(initial.teams)
  const [matches, setMatches] = useState(initial.matches)
  const [tab,     setTab]     = useState<"participantes" | "partidos" | "posiciones">("participantes")
  const [toast,   setToast]   = useState<{ ok: boolean; msg: string } | null>(null)
  const [tableWinners, setTableWinners] = useState<Record<string, string>>(() => {
    const winners: Record<string, string> = {}
    teams.forEach(t => {
      if (t.seed === 1 && t.group) winners[t.group] = t.id
    })
    return winners
  })

  // dialogs
  const [addOpen,    setAddOpen]    = useState(false)
  const [matchOpen,  setMatchOpen]  = useState(false)
  const [scoring,    setScoring]    = useState<Match | null>(null)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)

  function notify(ok: boolean, msg: string) {
    setToast({ ok, msg })
    setTimeout(() => setToast(null), 3000)
  }

  function handleUnauthorized() {
    notify(false, "Sesión expirada. Volvé a iniciar sesión.")
    const next = encodeURIComponent(window.location.pathname)
    router.push(`/admin/login?next=${next}`)
  }

  // ── handlers ──

  async function handleAddTeam(name: string, players: string[], group?: string) {
    try {
      const res  = await fetch(`/api/admin/disciplines/${initial.slug}/teams`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type: players.length > 0 ? "TEAM" : "SINGLE",
          players: players.map((p) => ({ name: p.trim() })).filter((p) => p.name),
          group: group?.trim() || undefined,
        }),
      })
      if (res.status === 401) {
        handleUnauthorized()
        return
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTeams((prev) => [...prev, { ...data, players: data.players ?? [] }])
      notify(true, `${name} inscripto.`)
    } catch { notify(false, "No se pudo inscribir.") }
  }

  async function handleRemoveTeam(teamId: string, teamName: string) {
    if (!confirm(`¿Eliminar "${teamName}"?`)) return
    try {
      const res = await fetch(`/api/admin/disciplines/${initial.slug}/teams/${teamId}`, { method: "DELETE", credentials: "include" })
      if (res.status === 401) {
        handleUnauthorized()
        return
      }
      if (!res.ok) throw new Error()
      setTeams((prev) => prev.filter((t) => t.id !== teamId))
      notify(true, "Eliminado.")
    } catch { notify(false, "No se pudo eliminar.") }
  }

  async function handleEditTeam(teamId: string, name: string, players: string[], group?: string) {
    try {
      const res = await fetch(`/api/admin/disciplines/${initial.slug}/teams/${teamId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, players, group: group?.trim() || null }),
      })
      if (res.status === 401) {
        handleUnauthorized()
        return
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTeams((prev) => prev.map((t) => t.id === teamId ? { ...data, players: data.players ?? [] } : t))
      notify(true, "Guardado.")
    } catch { notify(false, "No se pudo guardar.") }
  }

  async function handleDeleteMatch(matchId: string) {
    if (!confirm("¿Eliminar este partido?")) return
    try {
      const res = await fetch(`/api/admin/matches/${matchId}`, { method: "DELETE", credentials: "include" })
      if (res.status === 401) {
        handleUnauthorized()
        return
      }
      if (!res.ok) throw new Error()
      setMatches((prev) => prev.filter((m) => m.id !== matchId))
      notify(true, "Partido eliminado.")
    } catch { notify(false, "No se pudo eliminar el partido.") }
  }

  async function handleCreateMatch(team1Id: string, team2Id: string, stage: string) {
    try {
      const res  = await fetch(`/api/disciplines/${initial.slug}/matches`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team1Id, team2Id, stage: stage || undefined }),
      })
      if (res.status === 401) {
        handleUnauthorized()
        return
      }
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
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            team1Id: cross.team1.id,
            team2Id: cross.team2.id,
            stage: cross.stage,
          }),
        })
        if (res.status === 401) {
          handleUnauthorized()
          return
        }
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
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team1Id: finalCross.team1.id,
          team2Id: finalCross.team2.id,
          stage: finalCross.stage,
        }),
      })
      if (res.status === 401) {
        handleUnauthorized()
        return
      }
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

  async function handleGenerateHexagonal() {
    if (!hexagonalPlan.ready || hexagonalPlan.crosses.length === 0) return

    try {
      const createdMatches: Match[] = []

      for (const cross of hexagonalPlan.crosses) {
        const res = await fetch(`/api/disciplines/${initial.slug}/matches`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            team1Id: cross.team1.id,
            team2Id: cross.team2.id,
            stage: cross.stage,
          }),
        })
        if (res.status === 401) {
          handleUnauthorized()
          return
        }
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
      notify(true, "Hexagonal final generado (15 partidos).")
    } catch {
      notify(false, "No se pudo generar el hexagonal final.")
    }
  }

  function handleScoreUpdated(updated: Match) {
    setMatches((prev) => prev.map((m) => m.id === updated.id ? updated : m))
    setScoring(null)
    notify(true, updated.played ? "Partido cerrado." : "Score guardado.")
  }

  async function handleLobaWinnerSelect(tableId: string, winnerId: string) {
    const teamsInTable = teams.filter(t => t.group === tableId)

    try {
      await Promise.all(
        teamsInTable.map(async (t) => {
          const response = await fetch(`/api/admin/disciplines/${initial.slug}/teams/${t.id}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ seed: t.id === winnerId ? 1 : null })
          })
          if (response.status === 401) {
            throw new Error("UNAUTHORIZED")
          }
        })
      )

      setTeams(prev =>
        prev.map(t =>
          t.group === tableId
            ? { ...t, seed: t.id === winnerId ? 1 : null }
            : t
        )
      )
      setTableWinners((prev) => ({ ...prev, [tableId]: winnerId }))
      notify(true, "Ganador de mesa guardado.")
    } catch (error) {
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        handleUnauthorized()
        return
      }
      notify(false, "No se pudo guardar el ganador.")
    }
  }

  async function handleGenerateBracket() {
    if (!bracketPlan.ready || bracketPlan.crosses.length === 0) return

    try {
      const createdMatches: Match[] = []

      for (const cross of bracketPlan.crosses) {
        const res = await fetch(`/api/disciplines/${initial.slug}/matches`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            team1Id: cross.team1.id,
            team2Id: cross.team2.id,
            stage: cross.stage,
          }),
        })
        if (res.status === 401) {
          handleUnauthorized()
          return
        }
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
      notify(true, "Bracket eliminatorio generado (4tos de final).")
    } catch {
      notify(false, "No se pudo generar el bracket.")
    }
  }

  async function handleGenerateBracketSemifinals() {
    const plan = buildBracketSemifinalPlan(matches)
    if (!plan.ready) return

    try {
      const created = await Promise.all(
        plan.crosses.map(async (cross) => {
          const response = await fetch(`/api/disciplines/${initial.slug}/matches`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              team1Id: cross.team1.id,
              team2Id: cross.team2.id,
              stage: cross.stage,
            }),
          })
          if (response.status === 401) {
            throw new Error("UNAUTHORIZED")
          }
          return response.json()
        })
      )
      setMatches(prev => [...prev, ...created])
      notify(true, "Semifinales generadas.")
    } catch (error) {
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        handleUnauthorized()
        return
      }
      notify(false, "No se pudieron generar las semifinales.")
    }
  }

  async function handleGenerateBracketFinal() {
    const plan = buildBracketFinalPlan(matches)
    if (!plan.ready) return

    try {
      const created = await Promise.all(
        plan.crosses.map(async (cross) => {
          const response = await fetch(`/api/disciplines/${initial.slug}/matches`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              team1Id: cross.team1.id,
              team2Id: cross.team2.id,
              stage: cross.stage,
            }),
          })
          if (response.status === 401) {
            throw new Error("UNAUTHORIZED")
          }
          return response.json()
        })
      )
      setMatches(prev => [...prev, ...created])
      notify(true, "Final y 3er Puesto generados.")
    } catch (error) {
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        handleUnauthorized()
        return
      }
      notify(false, "No se pudieron generar la final.")
    }
  }

  const pending = matches.filter((m) => !m.played)
  const played  = matches.filter((m) =>  m.played)
  const teamCap = initial.teamsCount ?? null
  const remainingSpots = teamCap != null && teamCap > 0 ? Math.max(teamCap - teams.length, 0) : null
  const registrationLabel = teamCap == null || teamCap <= 0 ? "Abierto" : teams.length >= teamCap ? "Completo" : "Abierto"
  const registrationTone = teamCap != null && teamCap > 0 && teams.length >= teamCap ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20" : "bg-primary/10 text-primary border border-primary/20"
  const standingsVariant = detectStandingsVariant(initial.slug, initial.format)
  const groupedStandings = buildGroupedStandings(teams, matches, standingsVariant)
  const semifinalPlan = buildSemifinalPlan(groupedStandings, matches)
  const finalPlan = buildFinalPlan(matches)
  const hexagonalPlan = buildHexagonalFinalPlan(groupedStandings, matches)
  const currentPhase = getCurrentPhase(initial.slug, matches, teams)

  // For Sapo, get overall standings (not grouped) for bracket generation
  const sapoStandings = standingsVariant === "sapo" ? groupedStandings.flatMap((g) => g.standings as RankedSimpleStandingRow[]) : []
  const bracketPlan = buildBracketPlan(sapoStandings, matches)

  // Build Loba tables from teams (using group field)
  const lobaTables = standingsVariant === "loba" ? (() => {
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
        winnerId: groupTeams.find(t => t.seed === 1)?.id ?? null,
        isFinal: groupName.toLowerCase().includes("final"),
      }))
  })() : []

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-serif text-lg font-semibold text-foreground">{initial.name}</h1>
        </div>
      </header>

      {/* ── Toast ── */}
      {toast ? (
        <div className={`mx-6 mt-4 rounded-xl px-4 py-3 text-sm font-medium ${toast.ok ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
          {toast.msg}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 border-b border-border bg-card px-6 py-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <p className="text-xs text-muted-foreground">Cupo</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{teamCap ?? "Libre"}</p>
        </div>
        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <p className="text-xs text-muted-foreground">Inscriptos</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{teams.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <p className="text-xs text-muted-foreground">Faltan</p>
          <p className={`mt-1 text-lg font-semibold ${remainingSpots === 0 && teamCap != null ? "text-emerald-600" : "text-foreground"}`}>{remainingSpots ?? "—"}</p>
        </div>
        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <p className="text-xs text-muted-foreground">Estado</p>
          <p className={`mt-1 text-sm font-semibold ${registrationTone}`}>{registrationLabel}</p>
        </div>
      </div>

      {currentPhase.nextAction && (
        <div className="mx-6 mt-4 rounded-xl bg-primary/10 border border-primary/20 px-4 py-3">
          <p className="text-sm font-semibold text-primary">{currentPhase.label}</p>
          <p className="text-xs text-muted-foreground">{currentPhase.description}</p>
          <p className="mt-2 text-sm font-medium text-foreground">¿Qué sigue? → {currentPhase.nextAction}</p>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-border bg-card px-6">
        {(["participantes", "partidos", "posiciones"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "participantes" ? `Participantes (${teams.length})` : t === "partidos" ? `Partidos (${matches.length})` : `Posiciones (${groupedStandings.length})`}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-4">

        {/* ── Participantes ── */}
        {tab === "participantes" && (
          <>
            <button
              onClick={() => setAddOpen(true)}
              disabled={remainingSpots === 0 && teamCap != null}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-4 w-4" /> Agregar participante
            </button>

            {remainingSpots === 0 && teamCap != null ? (
              <p className="text-center text-sm text-muted-foreground">Cupo completo.</p>
            ) : null}

            {teams.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No hay participantes.</p>
            ) : (
              <div className="space-y-2">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{team.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {team.group ? (
                          <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                            {team.group}
                          </span>
                        ) : null}
                        <span className="text-xs text-muted-foreground">
                          {team.players.length} jugador{team.players.length === 1 ? "" : "es"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setEditingTeam(team)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveTeam(team.id, team.name)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Posiciones ── */}
        {tab === "posiciones" && (
          <>
            {standingsVariant === "sapo" ? (
              <>
                <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Cuartos de Final</p>
                      <p className="text-xs text-muted-foreground">Genera el bracket con al menos 8 clasificados.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateBracket}
                      disabled={!bracketPlan.ready}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Generar Cuartos
                    </button>
                  </div>
                  {!bracketPlan.ready ? (
                    <p className="text-xs text-muted-foreground">{bracketPlan.reason}</p>
                  ) : null}
                </div>

                {(() => {
                  const semiPlan = buildBracketSemifinalPlan(matches)
                  return (
                    <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">Semifinales</p>
                          <p className="text-xs text-muted-foreground">Genera las semifinales después de los cuartos.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleGenerateBracketSemifinals}
                          disabled={!semiPlan.ready}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Generar Semifinales
                        </button>
                      </div>
                      {!semiPlan.ready ? (
                        <p className="text-xs text-muted-foreground">{semiPlan.reason}</p>
                      ) : null}
                    </div>
                  )
                })()}

                {(() => {
                  const finalPlan = buildBracketFinalPlan(matches)
                  return (
                    <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">Final y 3er Puesto</p>
                          <p className="text-xs text-muted-foreground">Genera la final después de las semifinales.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleGenerateBracketFinal}
                          disabled={!finalPlan.ready}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Generar Final
                        </button>
                      </div>
                      {!finalPlan.ready ? (
                        <p className="text-xs text-muted-foreground">{finalPlan.reason}</p>
                      ) : null}
                    </div>
                  )
                })()}
              </>
            ) : standingsVariant === "loba" ? (
              <>
                {lobaTables.length === 0 ? (
                  <p className="py-12 text-center text-muted-foreground">
                    Para Loba, asigná los equipos a mesas usando el campo "Zona/grupo" al editar cada participante.
                  </p>
                ) : (
                  <LobaTableView
                    tables={lobaTables}
                    onWinnerSelect={handleLobaWinnerSelect}
                    isEditable={true}
                  />
                )}
              </>
            ) : standingsVariant === "compact" ? (
              <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Hexagonal Final</p>
                    <p className="text-xs text-muted-foreground">Genera el hexagonal con 6 zonas completas.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateHexagonal}
                    disabled={!hexagonalPlan.ready}
                    className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Generar
                  </button>
                </div>
                {!hexagonalPlan.ready ? (
                  <p className="text-xs text-muted-foreground">{hexagonalPlan.reason}</p>
                ) : null}
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Fase siguiente</p>
                      <p className="text-xs text-muted-foreground">Genera semifinales cuando las 2 zonas estén completas.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateSemifinals}
                      disabled={!semifinalPlan.ready}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Generar
                    </button>
                  </div>
                  {!semifinalPlan.ready ? (
                    <p className="text-xs text-muted-foreground">{semifinalPlan.reason}</p>
                  ) : null}
                </div>

                <div className="rounded-xl border border-border bg-card p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Final</p>
                      <p className="text-xs text-muted-foreground">Genera la final cuando las semifinales tengan ganador.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateFinal}
                      disabled={!finalPlan.ready}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Generar
                    </button>
                  </div>
                  {!finalPlan.ready ? (
                    <p className="text-xs text-muted-foreground">{finalPlan.reason}</p>
                  ) : finalPlan.cross ? (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-foreground">
                      <span className="font-medium">{finalPlan.cross.stage}:</span> {finalPlan.cross.team1.name} vs {finalPlan.cross.team2.name}
                    </div>
                  ) : null}
                </div>
              </>
            )}

            {standingsVariant !== "loba" && standingsVariant !== "sapo" && (
              <>
                {groupedStandings.length === 0 ? (
                  <p className="py-12 text-center text-muted-foreground">Todavía no hay participantes para calcular posiciones.</p>
                ) : (
                  <div className={standingsVariant === "compact" ? "grid gap-3 md:grid-cols-2 lg:grid-cols-3" : "grid gap-4 lg:grid-cols-2"}>
                    {groupedStandings.map((group) => (
                      standingsVariant === "compact" ? (
                        <CompactStandingsTable key={group.groupName} title={group.groupName} standings={group.standings as RankedSimpleStandingRow[]} highlightTop={1} />
                      ) : standingsVariant === "simple" ? (
                        <SimpleStandingsTable key={group.groupName} title={group.groupName} standings={group.standings as RankedSimpleStandingRow[]} highlightTop={2} />
                      ) : (
                        <StandingsTable key={group.groupName} title={group.groupName} standings={group.standings as RankedStandingRow[]} highlightTop={2} />
                      )
                    ))}
                  </div>
                )}
              </>
            )}

            {standingsVariant === "sapo" && (
              <>
                {sapoStandings.length === 0 ? (
                  <p className="py-12 text-center text-muted-foreground">Todavía no hay participantes para calcular posiciones.</p>
                ) : (
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <h3 className="mb-4 font-serif font-semibold text-foreground">Tabla de Clasificación (Top 8 pasan a bracket)</h3>
                    <SimpleStandingsTable title="Clasificación General" standings={sapoStandings} highlightTop={8} />
                  </div>
                )}
              </>
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
        slug={initial.slug}
        format={initial.format}
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
          onSave={handleEditTeam}
          slug={initial.slug}
          format={initial.format}
        />
      ) : null}

      {scoring ? (
        <ScoreDialog
          match={scoring}
          onClose={() => setScoring(null)}
          onUpdate={handleScoreUpdated}
          disciplineSlug={initial.slug}
        />
      ) : null}
    </div>
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
    <div className="rounded-2xl border border-border bg-card transition-colors hover:border-primary/40">
      {match.stage && (
        <div className="flex items-center gap-2 px-4 pt-3">
          {!match.played && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {match.stage}
          </span>
        </div>
      )}
      <div className="flex items-center gap-3 px-4 py-4">
        <button onClick={onTap} className="flex flex-1 items-center gap-4 min-w-0">
          <span className="flex-1 truncate text-sm font-semibold text-right text-foreground">
            {match.team1?.name ?? "?"}
          </span>
          <div className="shrink-0 min-w-[100px] text-center">
            {match.played ? (
              <span className="inline-block rounded-xl bg-muted px-4 py-2 font-mono text-lg font-bold tabular-nums text-foreground">
                {match.score1 ?? 0} – {match.score2 ?? 0}
              </span>
            ) : (
              <span className="inline-block rounded-xl bg-primary/10 border border-primary/30 px-4 py-2 text-sm font-semibold text-primary">
                Cargar
              </span>
            )}
          </div>
          <span className="flex-1 truncate text-sm font-semibold text-left text-foreground">
            {match.team2?.name ?? "?"}
          </span>
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
    </div>
  )
}

// ─── Add team dialog ──────────────────────────────────────────────────────────

function AddTeamDialog({
  open, onClose, onAdd, slug, format,
}: {
  open: boolean
  onClose: () => void
  onAdd: (name: string, players: string[], group?: string) => Promise<void>
  slug: string
  format?: string | null
}) {
  const [name,    setName]    = useState("")
  const [players, setPlayers] = useState<string[]>([])
  const [group,   setGroup]   = useState("")
  const [saving,  setSaving]  = useState(false)

  const zoneOptions = getZoneOptions(slug, format)
  const showZone = zoneOptions.length > 0

  function reset() { setName(""); setPlayers([]); setGroup(""); }

  function addPlayer() {
    setPlayers([...players, ""])
  }

  function removePlayer(index: number) {
    setPlayers(players.filter((_, i) => i !== index))
  }

  function updatePlayer(index: number, value: string) {
    setPlayers(players.map((p, i) => i === index ? value : p))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const playerList = players.map((p) => p.trim()).filter(Boolean)
    await onAdd(name.trim(), playerList, group)
    reset()
    onClose()
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose() } }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" onOpenAutoFocus={reset}>
        <DialogHeader><DialogTitle className="text-2xl">Agregar participante</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Nombre del equipo o jugador</label>
            <input
              autoFocus required
              className="w-full rounded-2xl border-2 border-border bg-background px-5 py-4 text-lg outline-none focus:border-primary placeholder:text-muted-foreground"
              placeholder="Ej: Los Goleadores"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {showZone && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Zona o Mesa</label>
              <select
                className="w-full rounded-2xl border-2 border-border bg-background px-5 py-4 text-lg outline-none focus:border-primary text-foreground"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              >
                <option value="">Seleccionar zona...</option>
                {zoneOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Jugadores (opcional)</label>
            <div className="space-y-2">
              {players.map((player, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className="flex-1 rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
                    placeholder={`Jugador ${index + 1}`}
                    value={player}
                    onChange={(event) => updatePlayer(index, event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removePlayer(index)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPlayer}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" /> Agregar jugador
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Si es individual, dejá sin jugadores</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { reset(); onClose() }} className="flex-1 rounded-2xl border-2 border-border py-4 text-lg font-semibold text-foreground hover:bg-muted">
              Cancelar
            </button>
            <button type="submit" disabled={saving || !name.trim()} className="flex-1 rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground disabled:opacity-40">
              {saving ? "Guardando..." : "Agregar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditTeamDialog({
  team, onClose, onSave, slug, format,
}: {
  team: Team
  onClose: () => void
  onSave: (teamId: string, name: string, players: string[], group?: string) => Promise<void>
  slug: string
  format?: string | null
}) {
  const [name, setName] = useState(team.name)
  const [group, setGroup] = useState(team.group ?? "")
  const [players, setPlayers] = useState<string[]>(team.players.map((player) => player.name))
  const [saving, setSaving] = useState(false)

  const zoneOptions = getZoneOptions(slug, format)
  const showZone = zoneOptions.length > 0

  function addPlayer() {
    setPlayers([...players, ""])
  }

  function removePlayer(index: number) {
    setPlayers(players.filter((_, i) => i !== index))
  }

  function updatePlayer(index: number, value: string) {
    setPlayers(players.map((p, i) => i === index ? value : p))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await onSave(team.id, name.trim(), players.map((p) => p.trim()).filter(Boolean), group)
    setSaving(false)
  }

  return (
    <Dialog open onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-2xl">Editar participante</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Nombre del equipo o jugador</label>
            <input
              autoFocus
              required
              className="w-full rounded-2xl border-2 border-border bg-background px-5 py-4 text-lg outline-none focus:border-primary placeholder:text-muted-foreground"
              placeholder="Ej: Los Goleadores"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          {showZone && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Zona o Mesa</label>
              <select
                className="w-full rounded-2xl border-2 border-border bg-background px-5 py-4 text-lg outline-none focus:border-primary text-foreground"
                value={group}
                onChange={(event) => setGroup(event.target.value)}
              >
                <option value="">Seleccionar zona...</option>
                {zoneOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Jugadores (opcional)</label>
            <div className="space-y-2">
              {players.map((player, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className="flex-1 rounded-2xl border-2 border-border bg-background px-4 py-3 text-base outline-none focus:border-primary placeholder:text-muted-foreground"
                    placeholder={`Jugador ${index + 1}`}
                    value={player}
                    onChange={(event) => updatePlayer(index, event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removePlayer(index)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPlayer}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" /> Agregar jugador
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Si es individual, dejá sin jugadores</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl border-2 border-border py-4 text-lg font-semibold text-foreground hover:bg-muted">
              Cancelar
            </button>
            <button type="submit" disabled={saving || !name.trim()} className="flex-1 rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground disabled:opacity-40">
              {saving ? "Guardando..." : "Guardar"}
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
      <DialogContent className="sm:max-w-xs max-h-[90vh] overflow-y-auto" onOpenAutoFocus={reset}>
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
  match, onClose, onUpdate, disciplineSlug,
}: {
  match: Match
  onClose: () => void
  onUpdate: (updated: Match) => void
  disciplineSlug: string
}) {
  const router = useRouter()
  const [score1, setScore1] = useState(match.score1 ?? 0)
  const [score2, setScore2] = useState(match.score2 ?? 0)
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isTruco = disciplineSlug === "truco"
  const isTie = score1 === score2
  const canFinish = !isTruco || !isTie

  async function save(played: boolean) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/matches/${match.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score1, score2, played }),
      })
      if (res.status === 401) {
        setError("Sesión expirada. Volvé a iniciar sesión.")
        const next = encodeURIComponent(window.location.pathname)
        router.push(`/admin/login?next=${next}`)
        return
      }
      const data = await res.json()
      if (!res.ok) { setError(data?.error ?? `Error ${res.status}. Intentá de nuevo.`); return }
      onUpdate({ ...match, score1: data.score1, score2: data.score2, played: data.played })
      if (played) onClose()
    } finally {
      setSaving(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <Dialog open onOpenChange={(o) => { if (!o) setConfirming(false) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">¿Cerrar el partido?</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-5xl font-black tabular-nums text-foreground mb-2">{score1} – {score2}</p>
            <p className="text-sm text-muted-foreground">{match.team1?.name ?? "?"} vs {match.team2?.name ?? "?"}</p>
            <p className="mt-3 text-xs text-muted-foreground">Este resultado quedará guardado como final.</p>
          </div>
          <div className="flex gap-3">
            <button type="button" disabled={saving} onClick={() => setConfirming(false)}
              className="flex-1 rounded-2xl border-2 border-border py-4 text-base font-semibold disabled:opacity-40 active:scale-95 transition-transform">
              Volver
            </button>
            <button type="button" disabled={saving} onClick={() => save(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground disabled:opacity-40 active:scale-95 transition-transform">
              <Check className="h-5 w-5" /> {saving ? "Guardando..." : "Confirmar"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-base">
            {match.stage && <span className="block text-xs font-semibold uppercase tracking-wider text-primary mb-1">{match.stage}</span>}
            <span className="flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
              <span className="truncate max-w-[100px]">{match.team1?.name ?? "—"}</span>
              <span className="shrink-0 tabular-nums text-base font-black text-primary">{score1} – {score2}</span>
              <span className="truncate max-w-[100px]">{match.team2?.name ?? "—"}</span>
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 items-center gap-2 py-4">
          {[
            { score: score1, set: setScore1, name: match.team1?.name ?? "?" },
            null,
            { score: score2, set: setScore2, name: match.team2?.name ?? "?" },
          ].map((side, i) =>
            !side ? (
              <div key={i} className="text-center text-2xl font-black text-muted-foreground">–</div>
            ) : (
              <div key={i} className="flex flex-col items-center gap-3">
                <p className="w-full truncate text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {side.name}
                </p>
                <button type="button" onClick={() => side.set((s) => s + 1)}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-primary bg-primary/10 text-primary active:scale-95 active:bg-primary/20 transition-all">
                  <Plus className="h-8 w-8" />
                </button>
                <span className="text-7xl font-black tabular-nums leading-none text-foreground">{side.score}</span>
                <button type="button" onClick={() => side.set((s) => Math.max(0, s - 1))}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-border bg-muted text-foreground active:scale-95 transition-all">
                  <Minus className="h-8 w-8" />
                </button>
              </div>
            )
          )}
        </div>

        {error && <p className="text-sm text-destructive text-center -mt-2">{error}</p>}
        {isTruco && isTie && (
          <p className="text-sm text-destructive text-center -mt-2">En Truco no puede haber empate.</p>
        )}

        <div className="flex gap-3">
          <button type="button" disabled={saving} onClick={() => save(false)}
            className="flex-1 rounded-2xl border-2 border-border py-4 text-base font-semibold disabled:opacity-40 active:scale-95 transition-transform">
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button type="button" disabled={saving || !canFinish} onClick={() => setConfirming(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground disabled:opacity-40 active:scale-95 transition-transform">
            <Check className="h-5 w-5" /> Finalizar
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
