"use client"

import { useState } from "react"
import { Target } from "lucide-react"
import { DisciplineHeader } from "@/components/discipline-header"
import { SimpleStandingsTable, type SimpleStandingRow } from "@/components/simple-standings-table"
import { FixtureList, type FixtureMatch } from "@/components/fixture-list"
import { Bracket, type BracketMatch } from "@/components/bracket"
import { PairParticipantsList } from "@/components/participants-list"
import { Regulations } from "@/components/regulations"
import { PremiumTabs } from "@/components/premium-tabs"
import { InfoPanel } from "@/components/info-panel"
import { padelPairs, padelGroups, padelMatches } from "@/lib/data"

function calculateStandings(
  pairIds: string[],
  matches: typeof padelMatches
): SimpleStandingRow[] {
  const stats: Record<string, SimpleStandingRow> = {}

  pairIds.forEach((pairId, index) => {
    const pair = padelPairs.find((p) => p.id === pairId)
    stats[pairId] = {
      position: index + 1,
      teamName: pair?.name || pairId,
      pj: 0,
      pg: 0,
      pp: 0,
      pts: 0,
      bonus: 0,
    }
  })

  matches
    .filter((m) => m.played && pairIds.includes(m.pair1) && pairIds.includes(m.pair2))
    .forEach((match) => {
      const p1 = stats[match.pair1]
      const p2 = stats[match.pair2]

      p1.pj++
      p2.pj++

      if ((match.sets1 || 0) > (match.sets2 || 0)) {
        p1.pg++
        p1.pts += 1
        p2.pp++
        if (match.sets1 === 2 && match.sets2 === 0) {
          p1.bonus = (p1.bonus || 0) + 2
          p1.pts += 2
        } else if (match.sets1 === 2 && match.sets2 === 1) {
          p1.bonus = (p1.bonus || 0) + 1
          p1.pts += 1
        }
      } else {
        p2.pg++
        p2.pts += 1
        p1.pp++
        if (match.sets2 === 2 && match.sets1 === 0) {
          p2.bonus = (p2.bonus || 0) + 2
          p2.pts += 2
        } else if (match.sets2 === 2 && match.sets1 === 1) {
          p2.bonus = (p2.bonus || 0) + 1
          p2.pts += 1
        }
      }
    })

  return Object.values(stats)
    .sort((a, b) => b.pts - a.pts)
    .map((row, index) => ({ ...row, position: index + 1 }))
}

function getFixtureMatches(
  pairIds: string[],
  matches: typeof padelMatches
): FixtureMatch[] {
  return matches
    .filter((m) => pairIds.includes(m.pair1) && pairIds.includes(m.pair2))
    .map((m, index) => ({
      id: m.id,
      team1: padelPairs.find((p) => p.id === m.pair1)?.name || m.pair1,
      team2: padelPairs.find((p) => p.id === m.pair2)?.name || m.pair2,
      score1: m.played ? `${m.sets1}` : undefined,
      score2: m.played ? `${m.sets2}` : undefined,
      played: m.played,
      matchNumber: index + 1,
    }))
}

const regulations = [
  {
    title: "Formato del Torneo",
    items: [
      "6 parejas divididas en 2 grupos de 3",
      "Fase de grupos: todos contra todos",
      "Los 2 mejores de cada grupo avanzan",
    ],
  },
  {
    title: "Formato de Partidos",
    items: [
      "Mejor de 3 sets",
      "Golden point en caso de deuce",
    ],
  },
  {
    title: "Sistema de Puntos",
    items: [
      "Victoria: 1 punto",
      "Bonus por 2-0: +2 puntos",
      "Bonus por 2-1: +1 punto",
    ],
  },
  {
    title: "Criterios de Desempate",
    items: [
      "1. Cabeza a cabeza",
      "2. Antigüedad del equipo",
      "3. Sorteo",
    ],
  },
]

const semis: BracketMatch[] = [
  { id: "psf1", team1: "Por definir (1ro A)", team2: "Por definir (2do B)", played: false },
  { id: "psf2", team1: "Por definir (1ro B)", team2: "Por definir (2do A)", played: false },
]

const tabs = [
  { id: "posiciones", label: "Posiciones" },
  { id: "fixture", label: "Fixture" },
  { id: "participantes", label: "Parejas" },
  { id: "fase-final", label: "Fase Final" },
  { id: "reglamento", label: "Reglamento" },
]

export default function PadelPage() {
  const [activeTab, setActiveTab] = useState("posiciones")

  const standingsA = calculateStandings(padelGroups.A, padelMatches)
  const standingsB = calculateStandings(padelGroups.B, padelMatches)
  const fixtureA = getFixtureMatches(padelGroups.A, padelMatches)
  const fixtureB = getFixtureMatches(padelGroups.B, padelMatches)

  const upcomingMatches = padelMatches
    .filter((m) => !m.played)
    .slice(0, 3)
    .map((m) => ({
      team1: padelPairs.find((p) => p.id === m.pair1)?.name || m.pair1,
      team2: padelPairs.find((p) => p.id === m.pair2)?.name || m.pair2,
    }))

  return (
    <div className="p-8">
      <DisciplineHeader name="Padel" Icon={Target} description="6 parejas - Fase de grupos + eliminatorias" />

      <div className="flex gap-8">
        <div className="flex-1 min-w-0">
          <PremiumTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "reglamento" && <Regulations sections={regulations} />}

          {activeTab === "participantes" && (
            <PairParticipantsList title="Parejas Participantes" pairs={padelPairs} />
          )}

          {activeTab === "fixture" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <FixtureList title="Grupo A" matches={fixtureA} />
              <FixtureList title="Grupo B" matches={fixtureB} />
            </div>
          )}

          {activeTab === "posiciones" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <SimpleStandingsTable title="Grupo A" standings={standingsA} showBonus />
              <SimpleStandingsTable title="Grupo B" standings={standingsB} showBonus />
            </div>
          )}

          {activeTab === "fase-final" && (
            <Bracket title="Fase Eliminatoria" semifinals={semis} />
          )}
        </div>

        <div className="hidden xl:block w-72 flex-shrink-0">
          <InfoPanel
            teams={6}
            players={12}
            format="Grupos + Semis"
            classification="Top 2 por grupo"
            upcomingMatches={upcomingMatches}
          />
        </div>
      </div>
    </div>
  )
}
