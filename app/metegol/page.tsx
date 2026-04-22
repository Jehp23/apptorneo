"use client"

import { useState } from "react"
import { Gamepad2, Trophy } from "lucide-react"
import { DisciplineHeader } from "@/components/discipline-header"
import { SimpleStandingsTable, type SimpleStandingRow } from "@/components/simple-standings-table"
import { PairParticipantsList } from "@/components/participants-list"
import { Regulations } from "@/components/regulations"
import { PremiumTabs } from "@/components/premium-tabs"
import { InfoPanel } from "@/components/info-panel"
import { metegolTeams, metegolGroups } from "@/lib/data"

const regulations = [
  {
    title: "Formato del Torneo",
    items: [
      "36 jugadores en 18 equipos de 2",
      "6 grupos de 3 equipos",
      "Ganador de cada grupo al hexagonal",
    ],
  },
  {
    title: "Fase Final",
    items: ["Hexagonal: 6 ganadores de grupo", "Todos contra todos"],
  },
  {
    title: "Formato de Partidos",
    items: ["Mejor de 3 partidos", "Cada partido a 7 goles"],
  },
  {
    title: "Sistema de Puntos",
    items: ["Victoria: 1 punto", "Bonus por 2-0: +2 pts", "Bonus por 2-1: +1 pt"],
  },
]

const mockGroupStandings: Record<number, SimpleStandingRow[]> = {
  1: [
    { position: 1, teamName: "Los Goleadores", pj: 2, pg: 2, pp: 0, pts: 5, bonus: 3 },
    { position: 2, teamName: "Metegol Masters", pj: 2, pg: 1, pp: 1, pts: 2, bonus: 1 },
    { position: 3, teamName: "Los Barras", pj: 2, pg: 0, pp: 2, pts: 0, bonus: 0 },
  ],
  2: [
    { position: 1, teamName: "Fulbito FC", pj: 2, pg: 2, pp: 0, pts: 4, bonus: 2 },
    { position: 2, teamName: "Los Munecos", pj: 2, pg: 1, pp: 1, pts: 2, bonus: 1 },
    { position: 3, teamName: "Barra Brava", pj: 2, pg: 0, pp: 2, pts: 0, bonus: 0 },
  ],
  3: [
    { position: 1, teamName: "Los Arqueros", pj: 2, pg: 2, pp: 0, pts: 5, bonus: 3 },
    { position: 2, teamName: "Defensa Central", pj: 2, pg: 1, pp: 1, pts: 3, bonus: 2 },
    { position: 3, teamName: "Los Delanteros", pj: 2, pg: 0, pp: 2, pts: 0, bonus: 0 },
  ],
  4: [
    { position: 1, teamName: "Mediocampo FC", pj: 2, pg: 2, pp: 0, pts: 4, bonus: 2 },
    { position: 2, teamName: "Los Laterales", pj: 2, pg: 0, pp: 1, pts: 2, bonus: 1 },
    { position: 3, teamName: "Gol en Contra", pj: 2, pg: 0, pp: 2, pts: 0, bonus: 0 },
  ],
  5: [
    { position: 1, teamName: "Los Centros", pj: 2, pg: 1, pp: 0, pts: 4, bonus: 2 },
    { position: 2, teamName: "Tiro Libre FC", pj: 2, pg: 1, pp: 1, pts: 2, bonus: 1 },
    { position: 3, teamName: "Penal Masters", pj: 2, pg: 0, pp: 1, pts: 1, bonus: 0 },
  ],
  6: [
    { position: 1, teamName: "Los Corners", pj: 2, pg: 2, pp: 0, pts: 5, bonus: 3 },
    { position: 2, teamName: "Fuera de Juego", pj: 2, pg: 1, pp: 1, pts: 2, bonus: 1 },
    { position: 3, teamName: "Los Tarjetas", pj: 2, pg: 0, pp: 2, pts: 0, bonus: 0 },
  ],
}

const hexagonalStandings: SimpleStandingRow[] = [
  { position: 1, teamName: "Los Goleadores", pj: 0, pg: 0, pp: 0, pts: 0 },
  { position: 2, teamName: "Fulbito FC", pj: 0, pg: 0, pp: 0, pts: 0 },
  { position: 3, teamName: "Los Arqueros", pj: 0, pg: 0, pp: 0, pts: 0 },
  { position: 4, teamName: "Mediocampo FC", pj: 0, pg: 0, pp: 0, pts: 0 },
  { position: 5, teamName: "Los Centros", pj: 0, pg: 0, pp: 0, pts: 0 },
  { position: 6, teamName: "Los Corners", pj: 0, pg: 0, pp: 0, pts: 0 },
]

function GroupTablesView() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(metegolGroups).map(([groupNum, teamIds]) => {
        const groupTeams = teamIds.map((id) => metegolTeams.find((t) => t.id === id)!)
        return (
          <div key={groupNum} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <span className="font-semibold text-foreground">Grupo {groupNum}</span>
            </div>
            <ul className="divide-y divide-border">
              {groupTeams.map((team, index) => (
                <li key={team.id} className={`px-4 py-3 ${index % 2 === 1 ? "bg-muted/20" : ""}`}>
                  <div className="font-medium text-sm text-foreground">{team.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {team.player1.name} y {team.player2.name}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function HexagonalView() {
  const groupWinners = Object.entries(mockGroupStandings).map(([groupNum, standings]) => ({
    group: groupNum,
    winner: standings[0].teamName,
  }))

  return (
    <div className="space-y-8">
      {/* Group winners summary */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-serif font-semibold text-foreground">Clasificados al Hexagonal</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {groupWinners.map((gw) => (
            <div
              key={gw.group}
              className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-lg"
            >
              <span className="text-sm text-muted-foreground">Grupo {gw.group}</span>
              <span className="font-medium text-foreground">{gw.winner}</span>
            </div>
          ))}
        </div>
      </div>

      <SimpleStandingsTable title="Hexagonal Final" standings={hexagonalStandings} highlightTop={3} showBonus />

      <div className="bg-muted/30 border-2 border-dashed border-border rounded-xl px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          El hexagonal final aun no ha comenzado. Los 6 ganadores de grupo se enfrentaran todos contra
          todos para determinar el campeon.
        </p>
      </div>
    </div>
  )
}

const tabs = [
  { id: "posiciones", label: "Posiciones" },
  { id: "grupos", label: "Grupos" },
  { id: "participantes", label: "Equipos" },
  { id: "hexagonal", label: "Hexagonal" },
  { id: "reglamento", label: "Reglamento" },
]

export default function MetegolPage() {
  const [activeTab, setActiveTab] = useState("posiciones")

  const formattedTeams = metegolTeams.map((team) => ({
    id: team.id,
    name: team.name,
    player1: team.player1,
    player2: team.player2,
  }))

  return (
    <div className="p-8">
      <DisciplineHeader name="Metegol" Icon={Gamepad2} description="18 equipos - 6 grupos + hexagonal final" />

      <div className="flex gap-8">
        <div className="flex-1 min-w-0">
          <PremiumTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "reglamento" && <Regulations sections={regulations} />}

          {activeTab === "participantes" && (
            <PairParticipantsList title="Equipos Participantes" pairs={formattedTeams} />
          )}

          {activeTab === "grupos" && <GroupTablesView />}

          {activeTab === "posiciones" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(mockGroupStandings).map(([groupNum, standings]) => (
                <SimpleStandingsTable
                  key={groupNum}
                  title={`Grupo ${groupNum}`}
                  standings={standings}
                  highlightTop={1}
                  showBonus
                />
              ))}
            </div>
          )}

          {activeTab === "hexagonal" && <HexagonalView />}
        </div>

        <div className="hidden xl:block w-72 flex-shrink-0">
          <InfoPanel teams={18} players={36} format="6 grupos + hexagonal" classification="1ro de cada grupo" />
        </div>
      </div>
    </div>
  )
}
