import type { StandingRow } from "@/components/standings-table"

export interface AdminDisciplineTeam {
  id: string
  name: string
  type: string
  group?: string | null
  players: Array<{ id: string; name: string; seniority?: number | null }>
}

export interface AdminDisciplineMatch {
  id: string
  team1?: { id: string; name: string } | null
  team2?: { id: string; name: string } | null
  score1?: number | null
  score2?: number | null
  played: boolean
  stage?: string | null
  date?: string | null
}

export interface RankedStandingRow extends StandingRow {
  teamId: string
}

export interface GroupedStanding {
  groupName: string
  teams: AdminDisciplineTeam[]
  standings: RankedStandingRow[]
  playedMatches: number
  expectedMatches: number
}

export interface MatchCross {
  stage: string
  team1: { id: string; name: string }
  team2: { id: string; name: string }
}

export interface PhasePlan {
  ready: boolean
  reason: string
  cross: MatchCross | null
}

export interface SemifinalPlan {
  ready: boolean
  reason: string
  crosses: MatchCross[]
}

export function buildGroupedStandings(
  teams: AdminDisciplineTeam[],
  matches: AdminDisciplineMatch[],
): GroupedStanding[] {
  const groups = teams.reduce<Record<string, AdminDisciplineTeam[]>>((acc, team) => {
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

export function calculateStandings(
  teams: AdminDisciplineTeam[],
  matches: AdminDisciplineMatch[],
): RankedStandingRow[] {
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

export function buildSemifinalPlan(
  groupedStandings: GroupedStanding[],
  matches: AdminDisciplineMatch[],
): SemifinalPlan {
  const existingSemis = matches.some((match) => match.stage?.toLowerCase().includes("semi"))
  if (existingSemis) {
    return { ready: false, reason: "Las semifinales ya fueron generadas.", crosses: [] }
  }

  if (groupedStandings.length !== 2) {
    return { ready: false, reason: "Este generador necesita exactamente 2 zonas para armar semifinales.", crosses: [] }
  }

  const [groupA, groupB] = groupedStandings
  if (groupA.standings.length < 2 || groupB.standings.length < 2) {
    return { ready: false, reason: "Cada zona necesita al menos 2 clasificados para generar semifinales.", crosses: [] }
  }

  if (groupA.playedMatches < groupA.expectedMatches || groupB.playedMatches < groupB.expectedMatches) {
    return { ready: false, reason: "Todavía faltan partidos de zona para cerrar las posiciones.", crosses: [] }
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

export function buildFinalPlan(matches: AdminDisciplineMatch[]): PhasePlan {
  const existingFinal = matches.some((match) => match.stage?.toLowerCase() === "final")
  if (existingFinal) {
    return { ready: false, reason: "La final ya fue generada.", cross: null }
  }

  const semifinals = matches.filter((match) => match.stage?.toLowerCase().includes("semifinal"))
  if (semifinals.length < 2) {
    return { ready: false, reason: "Primero tenés que generar las dos semifinales.", cross: null }
  }

  const playedSemifinals = semifinals.filter((match) => match.played && match.team1 && match.team2)
  if (playedSemifinals.length < 2) {
    return { ready: false, reason: "Todavía faltan resultados en semifinales para definir la final.", cross: null }
  }

  const winners = playedSemifinals.slice(0, 2).map((match) => {
    const score1 = match.score1 ?? 0
    const score2 = match.score2 ?? 0
    if (score1 === score2) return null
    return score1 > score2 ? match.team1 : match.team2
  })

  if (winners.some((winner) => !winner)) {
    return { ready: false, reason: "Las semifinales no pueden terminar empatadas para generar la final.", cross: null }
  }

  if (!winners[0] || !winners[1]) {
    return { ready: false, reason: "No se pudieron determinar los finalistas.", cross: null }
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

function countPlayedMatches(
  teams: AdminDisciplineTeam[],
  matches: AdminDisciplineMatch[],
) {
  const teamIds = new Set(teams.map((team) => team.id))
  return matches.filter((match) => match.played && match.team1 && match.team2 && teamIds.has(match.team1.id) && teamIds.has(match.team2.id)).length
}

function expectedRoundRobinMatches(teamCount: number) {
  return teamCount >= 2 ? (teamCount * (teamCount - 1)) / 2 : 0
}
