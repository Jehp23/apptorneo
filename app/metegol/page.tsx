"use client";

import { useState } from "react";
import { DisciplineHeader } from "@/components/discipline-header";
import { SimpleStandingsTable, type SimpleStandingRow } from "@/components/simple-standings-table";
import { PairParticipantsList } from "@/components/participants-list";
import { Regulations } from "@/components/regulations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      "Prohibido el 'remolino' (spinning)",
      "Se permite girar la barra máximo 360°",
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
    { position: 2, teamName: "Los Muñecos", pj: 2, pg: 1, pp: 1, pts: 2, bonus: 1 },
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(metegolGroups).map(([groupNum, teamIds]) => {
        const groupTeams = teamIds.map((id) => metegolTeams.find((t) => t.id === id)!);
        return (
          <Card key={groupNum}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Grupo {groupNum}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {groupTeams.map((team) => (
                  <li key={team.id} className="p-2 bg-muted/30 rounded text-sm">
                    <div className="font-medium">{team.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {team.player1.name} y {team.player2.name}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
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
    <div className="space-y-6">
      {/* Group winners summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Clasificados al Hexagonal Final
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {groupWinners.map((gw) => (
              <div
                key={gw.group}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <Badge variant="outline">Grupo {gw.group}</Badge>
                <span className="font-medium text-green-700">{gw.winner}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hexagonal table */}
      <SimpleStandingsTable
        title="Hexagonal Final - Tabla de Posiciones"
        standings={hexagonalStandings}
        highlightTop={3}
        showBonus
      />

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            El hexagonal final aún no ha comenzado. Los 6 ganadores de grupo se
            enfrentarán todos contra todos para determinar el campeón.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

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

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="reglamento">Reglamento</TabsTrigger>
            <TabsTrigger value="participantes">Participantes</TabsTrigger>
            <TabsTrigger value="grupos">Grupos</TabsTrigger>
            <TabsTrigger value="posiciones">Posiciones</TabsTrigger>
            <TabsTrigger value="hexagonal">Hexagonal</TabsTrigger>
          </TabsList>

          <TabsContent value="reglamento">
            <Regulations sections={regulations} />
          </TabsContent>

          <TabsContent value="participantes">
            <PairParticipantsList title="Equipos Participantes" pairs={formattedTeams} />
          </TabsContent>

          <TabsContent value="grupos">
            <GroupTablesView />
          </TabsContent>

          <TabsContent value="posiciones" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="hexagonal">
            <HexagonalView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
