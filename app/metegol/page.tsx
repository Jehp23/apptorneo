"use client";

import { useState } from "react";
import { DisciplineHeader } from "@/components/discipline-header";
import { SimpleStandingsTable, type SimpleStandingRow } from "@/components/simple-standings-table";
import { PairParticipantsList } from "@/components/participants-list";
import { Regulations } from "@/components/regulations";
import { metegolTeams, metegolGroups } from "@/lib/data";
import { Trophy } from "lucide-react";

const regulations = [
  {
    title: "Formato del Torneo",
    items: [
      "36 jugadores en 18 equipos de 2",
      "6 grupos de 3 equipos cada uno",
      "Fase de grupos: todos contra todos",
      "Ganador de cada grupo avanza a la fase final",
    ],
  },
  {
    title: "Fase Final",
    items: [
      "Hexagonal final: los 6 ganadores de grupo",
      "Todos contra todos en la fase final",
    ],
  },
  {
    title: "Formato de Partidos",
    items: [
      "Mejor de 3 partidos",
      "Cada partido a 7 goles",
    ],
  },
  {
    title: "Sistema de Puntos",
    items: [
      "Victoria: 1 punto",
      "Bonus por ganar 2-0: +2 puntos adicionales",
      "Bonus por ganar 2-1: +1 punto adicional",
    ],
  },
  {
    title: "Reglas Especiales",
    items: [
      "Prohibido el remolino (spinning)",
      "Se permite girar la barra maximo 360 grados",
    ],
  },
  {
    title: "Criterios de Desempate",
    items: [
      "1. Resultado entre empatados (cabeza a cabeza)",
      "2. Antigüedad del equipo",
      "3. Sorteo",
    ],
  },
];

// Mock standings for groups (simulated data)
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
};

// Final hexagonal standings
const hexagonalStandings: SimpleStandingRow[] = [
  { position: 1, teamName: "Los Goleadores", pj: 0, pg: 0, pp: 0, pts: 0 },
  { position: 2, teamName: "Fulbito FC", pj: 0, pg: 0, pp: 0, pts: 0 },
  { position: 3, teamName: "Los Arqueros", pj: 0, pg: 0, pp: 0, pts: 0 },
  { position: 4, teamName: "Mediocampo FC", pj: 0, pg: 0, pp: 0, pts: 0 },
  { position: 5, teamName: "Los Centros", pj: 0, pg: 0, pp: 0, pts: 0 },
  { position: 6, teamName: "Los Corners", pj: 0, pg: 0, pp: 0, pts: 0 },
];

function GroupTablesView() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(metegolGroups).map(([groupNum, teamIds]) => {
        const groupTeams = teamIds.map((id) => metegolTeams.find((t) => t.id === id)!);
        return (
          <div key={groupNum} className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <span className="font-medium">Grupo {groupNum}</span>
            </div>
            <ul className="divide-y divide-border">
              {groupTeams.map((team) => (
                <li key={team.id} className="px-4 py-3">
                  <div className="font-medium text-sm">{team.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {team.player1.name} y {team.player2.name}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function HexagonalView() {
  const groupWinners = Object.entries(mockGroupStandings).map(
    ([groupNum, standings]) => ({
      group: groupNum,
      winner: standings[0].teamName,
    })
  );

  return (
    <div className="space-y-12">
      {/* Group winners summary */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-5 w-5" />
          <h3 className="text-sm uppercase tracking-[0.15em] text-muted-foreground">Clasificados al Hexagonal</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {groupWinners.map((gw) => (
            <div
              key={gw.group}
              className="flex items-center justify-between px-4 py-3 border border-border rounded-lg bg-muted/30"
            >
              <span className="text-sm text-muted-foreground">Grupo {gw.group}</span>
              <span className="font-medium">{gw.winner}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hexagonal table */}
      <SimpleStandingsTable
        title="Hexagonal Final"
        standings={hexagonalStandings}
        highlightTop={3}
        showBonus
      />

      <div className="border border-dashed border-border rounded-lg px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          El hexagonal final aun no ha comenzado. Los 6 ganadores de grupo se
          enfrentaran todos contra todos para determinar el campeon.
        </p>
      </div>
    </div>
  );
}

const tabs = [
  { id: "reglamento", label: "Reglamento" },
  { id: "participantes", label: "Participantes" },
  { id: "grupos", label: "Grupos" },
  { id: "posiciones", label: "Posiciones" },
  { id: "hexagonal", label: "Hexagonal" },
];

export default function MetegolPage() {
  const [activeTab, setActiveTab] = useState("posiciones");

  // Format teams for PairParticipantsList
  const formattedTeams = metegolTeams.map((team) => ({
    id: team.id,
    name: team.name,
    player1: team.player1,
    player2: team.player2,
  }));

  return (
    <div className="min-h-screen bg-background">
      <DisciplineHeader name="Metegol" icon="🕹️" />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Tab Navigation */}
        <nav className="flex gap-1 border-b border-border mb-12 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        {activeTab === "reglamento" && <Regulations sections={regulations} />}

        {activeTab === "participantes" && (
          <PairParticipantsList title="Equipos Participantes" pairs={formattedTeams} />
        )}

        {activeTab === "grupos" && <GroupTablesView />}

        {activeTab === "posiciones" && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
      </main>
    </div>
  );
}
