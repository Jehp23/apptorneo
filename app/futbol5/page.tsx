"use client"

import { useEffect, useState } from "react"
import { Trophy } from "lucide-react"
import { DisciplineHeader } from "@/components/discipline-header"
import { StandingsTable, type StandingRow } from "@/components/standings-table"
import { FixtureList, type FixtureMatch } from "@/components/fixture-list"
import { Bracket, type BracketMatch } from "@/components/bracket"
import { ParticipantsList } from "@/components/participants-list"
import { Regulations } from "@/components/regulations"
import { PremiumTabs } from "@/components/premium-tabs"
import { InfoPanel } from "@/components/info-panel"

interface DisciplinePlayer {
  id: string
  name: string
  seniority?: number
}

interface DisciplineTeam {
  id: string
  name: string
  group?: string
  players: DisciplinePlayer[]
}

interface DisciplineMatch {
  id: string
  team1?: {
    id: string
    name: string
  }
  team2?: {
    id: string
    name: string
  }
  score1?: number
  score2?: number
  played: boolean
  date?: string
}

interface DisciplineData {
  id: string
  name: string
  slug: string
  format?: string
  teamsCount?: number
  playersCount?: number
  details?: string
  teams: DisciplineTeam[]
  matches: DisciplineMatch[]
}

function calculateStandings(teamIds: string[], matches: DisciplineMatch[], teams: DisciplineTeam[]): StandingRow[] {
  const stats: Record<string, StandingRow> = {}

  teamIds.forEach((teamId, index) => {
    const team = teams.find((t) => t.id === teamId)
    stats[teamId] = {
      position: index + 1,
      teamName: team?.name || teamId,
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
    .filter((match) => match.played && match.team1 && match.team2 && teamIds.includes(match.team1.id) && teamIds.includes(match.team2.id))
    .forEach((match) => {
      const t1 = stats[match.team1!.id]
      const t2 = stats[match.team2!.id]
      const score1 = match.score1 || 0
      const score2 = match.score2 || 0

      t1.pj++
      t2.pj++
      t1.gf += score1
      t1.gc += score2
      t2.gf += score2
      t2.gc += score1

      if (score1 > score2) {
        t1.pg++
        t1.pts += 3
        t2.pp++
      } else if (score1 < score2) {
        t2.pg++
        t2.pts += 3
        t1.pp++
      } else {
        t1.pe++
        t2.pe++
        t1.pts += 1
        t2.pts += 1
      }

      t1.dg = t1.gf - t1.gc
      t2.dg = t2.gf - t2.gc
    })

  return Object.values(stats)
    .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf)
    .map((row, index) => ({ ...row, position: index + 1 }))
}

function getFixtureMatches(teamIds: string[], matches: DisciplineMatch[]): FixtureMatch[] {
  return matches
    .filter((match) => match.team1 && match.team2 && teamIds.includes(match.team1.id) && teamIds.includes(match.team2.id))
    .map((match, index) => ({
      id: match.id,
      team1: match.team1?.name || "Sin equipo",
      team2: match.team2?.name || "Sin equipo",
      score1: match.score1,
      score2: match.score2,
      played: match.played,
      matchNumber: index + 1,
    }))
}

function groupByCode(teams: DisciplineTeam[]) {
  return teams.reduce<Record<string, string[]>>((acc, team) => {
    const group = team.group || "A"
    acc[group] = acc[group] ?? []
    acc[group].push(team.id)
    return acc
  }, {})
}

const regulations = [
  {
    title: "Formato del Torneo",
    items: [
      "36 jugadores divididos en 6 equipos de 6 jugadores",
      "2 grupos (A y B) de 3 equipos cada uno",
      "Fase de grupos: todos contra todos",
      "Los 2 mejores de cada grupo avanzan a semifinales",
    ],
  },
  {
    title: "Duracion de Partidos",
    items: [
      "2 tiempos de 20 minutos cada uno",
      "10 minutos de descanso entre tiempos",
      "10 minutos entre partidos",
    ],
  },
  {
    title: "Sistema de Puntos",
    items: [
      "Victoria: 3 puntos",
      "Empate: 1 punto",
      "Derrota: 0 puntos",
    ],
  },
  {
    title: "Criterios de Desempate",
    items: [
      "1. Resultado entre empatados",
      "2. Diferencia de goles",
      "3. Goles a favor",
      "4. Goles en contra (menor)",
      "5. Antigüedad del equipo",
      "6. Sorteo",
    ],
  },
]

const semis: BracketMatch[] = [
  { id: "sf1", team1: "Por definir (1ro A)", team2: "Por definir (2do B)", played: false },
  { id: "sf2", team1: "Por definir (1ro B)", team2: "Por definir (2do A)", played: false },
]

const tabs = [
  { id: "posiciones", label: "Posiciones" },
  { id: "fixture", label: "Fixture" },
  { id: "participantes", label: "Equipos" },
  { id: "fase-final", label: "Fase Final" },
  { id: "reglamento", label: "Reglamento" },
]

export default function Futbol5Page() {
  const [activeTab, setActiveTab] = useState("posiciones")
  const [discipline, setDiscipline] = useState<DisciplineData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDiscipline() {
      try {
        const response = await fetch("/api/disciplines/futbol-5")
        if (!response.ok) {
          throw new Error("No se pudo cargar la disciplina")
        }

        const data: DisciplineData = await response.json()
        setDiscipline(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadDiscipline()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-lg text-muted-foreground">Cargando torneo...</p>
      </div>
    )
  }

  const groups = discipline ? groupByCode(discipline.teams) : { A: [], B: [] }
  const standingsA = discipline ? calculateStandings(groups.A, discipline.matches, discipline.teams) : []
  const standingsB = discipline ? calculateStandings(groups.B, discipline.matches, discipline.teams) : []
  const fixtureA = discipline ? getFixtureMatches(groups.A, discipline.matches) : []
  const fixtureB = discipline ? getFixtureMatches(groups.B, discipline.matches) : []

  const upcomingMatches = discipline
    ? discipline.matches
        .filter((match) => !match.played)
        .slice(0, 3)
        .map((match) => ({
          team1: match.team1?.name || "Por definir",
          team2: match.team2?.name || "Por definir",
        }))
    : []

  return (
    <div className="p-8">
      <DisciplineHeader name="Futbol 5" Icon={Trophy} description="6 equipos - Fase de grupos + eliminatorias" />

      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <PremiumTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "reglamento" && <Regulations sections={regulations} />}

          {activeTab === "participantes" && (
            <ParticipantsList title="Equipos Participantes" teams={discipline?.teams ?? []} />
          )}

          {activeTab === "fixture" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <FixtureList title="Grupo A" matches={fixtureA} />
              <FixtureList title="Grupo B" matches={fixtureB} />
            </div>
          )}

          {activeTab === "posiciones" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <StandingsTable title="Grupo A" standings={standingsA} />
              <StandingsTable title="Grupo B" standings={standingsB} />
            </div>
          )}

          {activeTab === "fase-final" && (
            <Bracket title="Fase Eliminatoria" semifinals={semis} thirdPlace={undefined} />
          )}
        </div>

        {/* Side Panel */}
        <div className="hidden xl:block w-72 flex-shrink-0">
          <InfoPanel
            teams={6}
            players={36}
            format="Grupos + Eliminatorias"
            classification="Top 2 por grupo"
            upcomingMatches={upcomingMatches}
          />
        </div>
      </div>
    </div>
  )
}
