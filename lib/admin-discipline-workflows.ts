import type { StandingRow } from "@/components/standings-table"
import type { SimpleStandingRow } from "@/components/simple-standings-table"

export interface AdminDisciplineTeam {
  id: string
  name: string
  type: string
  group?: string | null
  seed?: number | null
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

export type StandingsVariant = "classic" | "simple" | "compact" | "loba" | "sapo" | "padel"

export interface RankedStandingRow extends StandingRow {
  teamId: string
}

export interface RankedSimpleStandingRow extends SimpleStandingRow {
  teamId: string
}

export interface GroupedStanding<TStanding = RankedStandingRow> {
  groupName: string
  teams: AdminDisciplineTeam[]
  standings: TStanding[]
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

export interface HexagonalPlan {
  ready: boolean
  reason: string
  crosses: MatchCross[]
}

export interface BracketPlan {
  ready: boolean
  reason: string
  crosses: MatchCross[]
}

export function detectStandingsVariant(slug: string, format?: string | null): StandingsVariant {
  const normalizedSlug = slug.toLowerCase()
  const normalizedFormat = format?.toLowerCase() ?? ""

  if (normalizedSlug.includes("truco") || normalizedFormat.includes("truco")) {
    return "simple"
  }

  if (normalizedSlug.includes("metegol") || normalizedFormat.includes("metegol")) {
    return "compact"
  }

  if (normalizedSlug.includes("loba") || normalizedFormat.includes("loba")) {
    return "loba"
  }

  if (normalizedSlug.includes("sapo") || normalizedFormat.includes("sapo")) {
    return "sapo"
  }

  if (normalizedSlug.includes("padel") || normalizedSlug.includes("pádel") ||
      normalizedFormat.includes("padel") || normalizedFormat.includes("pádel")) {
    return "padel"
  }

  return "classic"
}

export function getZoneOptions(slug: string, format?: string | null): Array<{ value: string; label: string }> {
  const normalizedSlug = slug.toLowerCase()
  const normalizedFormat = format?.toLowerCase() ?? ""

  if (normalizedSlug.includes("metegol") || normalizedFormat.includes("metegol")) {
    return [
      { value: "Zona 1", label: "Zona 1" },
      { value: "Zona 2", label: "Zona 2" },
      { value: "Zona 3", label: "Zona 3" },
      { value: "Zona 4", label: "Zona 4" },
      { value: "Zona 5", label: "Zona 5" },
      { value: "Zona 6", label: "Zona 6" },
    ]
  }

  if (normalizedSlug.includes("loba") || normalizedFormat.includes("loba")) {
    return [
      { value: "Mesa 1", label: "Mesa 1" },
      { value: "Mesa 2", label: "Mesa 2" },
      { value: "Mesa 3", label: "Mesa 3" },
      { value: "Mesa 4", label: "Mesa 4" },
      { value: "Mesa 5", label: "Mesa 5" },
      { value: "Mesa 6", label: "Mesa 6" },
      { value: "Mesa Final", label: "Mesa Final" },
    ]
  }

  if (normalizedSlug.includes("truco") || normalizedFormat.includes("truco")) {
    return [
      { value: "Zona 1", label: "Zona 1" },
      { value: "Zona 2", label: "Zona 2" },
    ]
  }

  // Fútbol 5, Pádel, etc.
  return [
    { value: "Zona A", label: "Zona A" },
    { value: "Zona B", label: "Zona B" },
  ]
}

export function buildGroupedStandings(
  teams: AdminDisciplineTeam[],
  matches: AdminDisciplineMatch[],
  variant: StandingsVariant = "classic",
): GroupedStanding[] | GroupedStanding<RankedSimpleStandingRow>[] {
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
      standings: variant === "padel" ? calculatePadelStandings(groupTeams, matches) : variant === "simple" ? calculateSimpleStandings(groupTeams, matches) : variant === "compact" ? calculateCompactStandings(groupTeams, matches) : variant === "sapo" ? calculateSapoStandings(groupTeams, matches) : calculateStandings(groupTeams, matches),
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

export function calculatePadelStandings(
  teams: AdminDisciplineTeam[],
  matches: AdminDisciplineMatch[],
): RankedSimpleStandingRow[] {
  const stats: Record<string, RankedSimpleStandingRow> = {}

  teams.forEach((team) => {
    stats[team.id] = { teamId: team.id, position: 0, teamName: team.name, pj: 0, pg: 0, pp: 0, pts: 0, bonus: 0 }
  })

  matches
    .filter((m) => m.played && m.team1 && m.team2 && stats[m.team1.id] && stats[m.team2.id])
    .forEach((m) => {
      const t1 = stats[m.team1!.id]
      const t2 = stats[m.team2!.id]
      const s1 = m.score1 ?? 0
      const s2 = m.score2 ?? 0
      t1.pj += 1
      t2.pj += 1

      if (s1 > s2) {
        // team1 gana: bonus = sets ganados por ganador - sets ganados por perdedor
        const bp = s1 - s2  // 2-0 → 2, 2-1 → 1
        t1.pg += 1
        t1.bonus = (t1.bonus ?? 0) + bp
        t1.pts += 3 + bp
        t2.pp += 1
      } else if (s2 > s1) {
        const bp = s2 - s1
        t2.pg += 1
        t2.bonus = (t2.bonus ?? 0) + bp
        t2.pts += 3 + bp
        t1.pp += 1
      }
    })

  return Object.values(stats)
    .sort((a, b) => b.pts - a.pts || b.pg - a.pg || (b.bonus ?? 0) - (a.bonus ?? 0))
    .map((row, i) => ({ ...row, position: i + 1 }))
}

export function calculateSimpleStandings(
  teams: AdminDisciplineTeam[],
  matches: AdminDisciplineMatch[],
): RankedSimpleStandingRow[] {
  const stats: Record<string, RankedSimpleStandingRow> = {}

  teams.forEach((team, index) => {
    stats[team.id] = {
      teamId: team.id,
      position: index + 1,
      teamName: team.name,
      pj: 0,
      pg: 0,
      pp: 0,
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

      if (score1 > score2) {
        team1.pg += 1
        team1.pts += 1
        team2.pp += 1
      } else if (score2 > score1) {
        team2.pg += 1
        team2.pts += 1
        team1.pp += 1
      }
    })

  return Object.values(stats)
    .sort((a, b) => b.pts - a.pts || b.pg - a.pg || a.pp - b.pp)
    .map((row, index) => ({ ...row, position: index + 1 }))
}

export function calculateCompactStandings(
  teams: AdminDisciplineTeam[],
  matches: AdminDisciplineMatch[],
): RankedSimpleStandingRow[] {
  const stats: Record<string, RankedSimpleStandingRow> = {}

  teams.forEach((team, index) => {
    stats[team.id] = {
      teamId: team.id,
      position: index + 1,
      teamName: team.name,
      pj: 0,
      pg: 0,
      pp: 0,
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

      if (score1 > score2) {
        team1.pg += 1
        team1.pts += 1
        team2.pp += 1
      } else if (score2 > score1) {
        team2.pg += 1
        team2.pts += 1
        team1.pp += 1
      }
    })

  return Object.values(stats)
    .sort((a, b) => b.pts - a.pts || b.pg - a.pg || a.pp - b.pp)
    .map((row, index) => ({ ...row, position: index + 1 }))
}

export function calculateSapoStandings(
  teams: AdminDisciplineTeam[],
  matches: AdminDisciplineMatch[],
): RankedSimpleStandingRow[] {
  const stats: Record<string, RankedSimpleStandingRow> = {}

  teams.forEach((team, index) => {
    stats[team.id] = {
      teamId: team.id,
      position: index + 1,
      teamName: team.name,
      pj: 0,
      pg: 0,
      pp: 0,
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

      // For Sapo, pts = accumulated score
      team1.pts += score1
      team2.pts += score2

      if (score1 > score2) {
        team1.pg += 1
        team2.pp += 1
      } else if (score2 > score1) {
        team2.pg += 1
        team1.pp += 1
      }
    })

  return Object.values(stats)
    .sort((a, b) => b.pts - a.pts || b.pg - a.pg || a.pp - b.pp)
    .map((row, index) => ({ ...row, position: index + 1 }))
}

export function buildSemifinalPlan(
  groupedStandings: Array<GroupedStanding<{ teamId: string; teamName: string }>>,
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

export function buildHexagonalFinalPlan(
  groupedStandings: Array<GroupedStanding<{ teamId: string; teamName: string }>>,
  matches: AdminDisciplineMatch[],
): HexagonalPlan {
  const existingHexagonal = matches.some((match) => match.stage?.toLowerCase().includes("hexagonal"))
  if (existingHexagonal) {
    return { ready: false, reason: "El hexagonal final ya fue generado.", crosses: [] }
  }

  if (groupedStandings.length < 6) {
    return { ready: false, reason: "Necesitás 6 zonas para generar el hexagonal final.", crosses: [] }
  }

  const groupWinners = groupedStandings
    .map((group) => group.standings[0])
    .filter((winner) => winner !== undefined)

  if (groupWinners.length < 6) {
    return { ready: false, reason: "Todavía faltan ganadores de zona definidos.", crosses: [] }
  }

  const allGroupsComplete = groupedStandings.every(
    (group) => group.playedMatches >= group.expectedMatches
  )

  if (!allGroupsComplete) {
    return { ready: false, reason: "Todavía faltan partidos de zona para cerrar.", crosses: [] }
  }

  const crosses: MatchCross[] = []
  for (let i = 0; i < groupWinners.length; i++) {
    for (let j = i + 1; j < groupWinners.length; j++) {
      crosses.push({
        stage: "Final · Hexagonal",
        team1: { id: groupWinners[i].teamId, name: groupWinners[i].teamName },
        team2: { id: groupWinners[j].teamId, name: groupWinners[j].teamName },
      })
    }
  }

  return {
    ready: true,
    reason: "Listo para generar el hexagonal final (15 partidos).",
    crosses,
  }
}

export function buildBracketPlan(
  standings: RankedSimpleStandingRow[],
  matches: AdminDisciplineMatch[],
): BracketPlan {
  const existingBracket = matches.some((match) => match.stage?.toLowerCase().includes("cuartos") || match.stage?.toLowerCase().includes("bracket"))
  if (existingBracket) {
    return { ready: false, reason: "El bracket eliminatorio ya fue generado.", crosses: [] }
  }

  if (standings.length < 8) {
    return { ready: false, reason: "Necesitás al menos 8 clasificados para generar el bracket.", crosses: [] }
  }

  const top8 = standings.slice(0, 8)

  const crosses: MatchCross[] = [
    // Cuartos de final
    { stage: "Cuartos 1", team1: { id: top8[0].teamId, name: top8[0].teamName }, team2: { id: top8[7].teamId, name: top8[7].teamName } },
    { stage: "Cuartos 2", team1: { id: top8[3].teamId, name: top8[3].teamName }, team2: { id: top8[4].teamId, name: top8[4].teamName } },
    { stage: "Cuartos 3", team1: { id: top8[1].teamId, name: top8[1].teamName }, team2: { id: top8[6].teamId, name: top8[6].teamName } },
    { stage: "Cuartos 4", team1: { id: top8[2].teamId, name: top8[2].teamName }, team2: { id: top8[5].teamId, name: top8[5].teamName } },
  ]

  return {
    ready: true,
    reason: "Listo para generar el bracket eliminatorio (4tos, semis, final).",
    crosses,
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

export function getCurrentPhase(slug: string, matches: AdminDisciplineMatch[], teams: AdminDisciplineTeam[]): {
  label: string
  description: string
  nextAction: string | null
} {
  if (slug === "loba") {
    const winnersDefined = teams.filter(t => t.seed === -1).length
    const totalTables = new Set(teams.map(t => t.group)).size
    if (winnersDefined < totalTables) {
      return {
        label: "Jugando mesas",
        description: `${winnersDefined} de ${totalTables} mesas con ganador definido`,
        nextAction: "Marcá el ganador de cada mesa en la pestaña Posiciones",
      }
    }
    return { label: "Mesas completas", description: "Todos los ganadores definidos", nextAction: null }
  }

  const hasMatches = matches.length > 0
  const allGroupPlayed = matches.filter(m => !m.stage?.toLowerCase().includes("semi") && !m.stage?.toLowerCase().includes("final")).every(m => m.played)
  const hasSemis = matches.some(m => m.stage?.toLowerCase().startsWith("semi"))
  const hasFinal = matches.some(m => m.stage === "Final")

  if (!hasMatches) return { label: "Sin fixture", description: "No hay partidos creados aún", nextAction: "Creá los partidos en la pestaña Partidos" }
  if (!allGroupPlayed) return { label: "Fase de grupos", description: "Jugando partidos de zona", nextAction: "Cargá los resultados a medida que terminan" }
  if (!hasSemis) return { label: "Grupos completados", description: "Todos los partidos de zona jugados", nextAction: "Generá las Semifinales desde la pestaña Posiciones" }
  if (hasSemis && !hasFinal) return { label: "Semifinales", description: "Jugando semifinales", nextAction: "Cargá los resultados y luego generá la Final" }
  if (hasFinal) return { label: "Final", description: "Jugando la final", nextAction: "Cargá el resultado de la final" }

  return { label: "En curso", description: "", nextAction: null }
}

export function buildBracketSemifinalPlan(matches: AdminDisciplineMatch[]): BracketPlan {
  const cuartos = matches.filter(m => m.stage?.toLowerCase().startsWith("cuarto"))

  if (cuartos.length < 4) {
    return { ready: false, reason: "Primero generá los Cuartos de Final", crosses: [] }
  }

  if (cuartos.some(m => !m.played)) {
    return { ready: false, reason: "Faltan resultados en Cuartos de Final", crosses: [] }
  }

  const semisExistentes = matches.filter(m => m.stage?.toLowerCase().startsWith("semifinal"))
  if (semisExistentes.length > 0) {
    return { ready: false, reason: "Las Semifinales ya fueron generadas", crosses: [] }
  }

  const sorted = [...cuartos].sort((a, b) => (a.stage ?? "").localeCompare(b.stage ?? ""))

  const getWinner = (m: AdminDisciplineMatch) => {
    if (m.score1 === undefined || m.score2 === undefined) return null
    return (m.score1 ?? 0) >= (m.score2 ?? 0) ? m.team1 : m.team2
  }

  const w1 = getWinner(sorted[0])
  const w2 = getWinner(sorted[1])
  const w3 = getWinner(sorted[2])
  const w4 = getWinner(sorted[3])

  if (!w1 || !w2 || !w3 || !w4) {
    return { ready: false, reason: "No se pueden determinar los ganadores de Cuartos", crosses: [] }
  }

  return {
    ready: true,
    reason: "Listo para generar Semifinales",
    crosses: [
      { team1: w1, team2: w3, stage: "Semifinal 1" },
      { team1: w2, team2: w4, stage: "Semifinal 2" },
    ]
  }
}

export function buildBracketFinalPlan(matches: AdminDisciplineMatch[]): BracketPlan {
  const semis = matches.filter(m => m.stage?.toLowerCase().startsWith("semifinal"))

  if (semis.length < 2) {
    return { ready: false, reason: "Primero generá las Semifinales", crosses: [] }
  }

  if (semis.some(m => !m.played)) {
    return { ready: false, reason: "Faltan resultados en Semifinales", crosses: [] }
  }

  if (matches.some(m => m.stage === "Final")) {
    return { ready: false, reason: "La Final ya fue generada", crosses: [] }
  }

  const getWinner = (m: AdminDisciplineMatch) => {
    const winner = (m.score1 ?? 0) >= (m.score2 ?? 0) ? m.team1 : m.team2
    if (!winner) throw new Error("No winner determined")
    return winner
  }
  const getLoser = (m: AdminDisciplineMatch) => {
    const loser = (m.score1 ?? 0) >= (m.score2 ?? 0) ? m.team2 : m.team1
    if (!loser) throw new Error("No loser determined")
    return loser
  }

  const sorted = [...semis].sort((a, b) => (a.stage ?? "").localeCompare(b.stage ?? ""))

  return {
    ready: true,
    reason: "Listo para generar Final y 3er Puesto",
    crosses: [
      { team1: getWinner(sorted[0]), team2: getWinner(sorted[1]), stage: "Final" },
      { team1: getLoser(sorted[0]),  team2: getLoser(sorted[1]),  stage: "3er Puesto" },
    ]
  }
}

export interface ChampionResult {
  championName: string
  runnerUpName: string
  score1: number
  score2: number
}

export function detectChampion(matches: AdminDisciplineMatch[]): ChampionResult | null {
  const final = matches.find(
    (m) => m.played && m.stage?.toLowerCase() === "final" && m.team1 && m.team2
  )
  if (!final) return null

  const s1 = final.score1 ?? 0
  const s2 = final.score2 ?? 0
  if (s1 === s2) return null

  const champion = s1 > s2 ? final.team1! : final.team2!
  const runnerUp  = s1 > s2 ? final.team2! : final.team1!
  const champScore = s1 > s2 ? s1 : s2
  const runnerScore = s1 > s2 ? s2 : s1

  return {
    championName: champion.name,
    runnerUpName: runnerUp.name,
    score1: champScore,
    score2: runnerScore,
  }
}
