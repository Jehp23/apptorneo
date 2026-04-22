"use client";

import { useState } from "react";
import { DisciplineHeader } from "@/components/discipline-header";
import { SimpleStandingsTable, type SimpleStandingRow } from "@/components/simple-standings-table";
import { FixtureList, type FixtureMatch } from "@/components/fixture-list";
import { Bracket, type BracketMatch } from "@/components/bracket";
import { PairParticipantsList } from "@/components/participants-list";
import { Regulations } from "@/components/regulations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trucoPairs, trucoGroups, trucoMatches } from "@/lib/data";

// Calculate standings from matches
function calculateStandings(
  pairIds: string[],
  matches: typeof trucoMatches
): SimpleStandingRow[] {
  const stats: Record<string, SimpleStandingRow> = {};

  pairIds.forEach((pairId, index) => {
    const pair = trucoPairs.find((p) => p.id === pairId);
    stats[pairId] = {
      position: index + 1,
      teamName: pair?.name || pairId,
      pj: 0,
      pg: 0,
      pp: 0,
      pts: 0,
    };
  });

  matches
    .filter(
      (m) =>
        m.played &&
        pairIds.includes(m.pair1) &&
        pairIds.includes(m.pair2)
    )
    .forEach((match) => {
      const p1 = stats[match.pair1];
      const p2 = stats[match.pair2];

      p1.pj++;
      p2.pj++;

      if (match.winner === match.pair1) {
        p1.pg++;
        p1.pts += 1;
        p2.pp++;
      } else if (match.winner === match.pair2) {
        p2.pg++;
        p2.pts += 1;
        p1.pp++;
      }
    });

  return Object.values(stats)
    .sort((a, b) => b.pts - a.pts || a.pp - b.pp)
    .map((row, index) => ({ ...row, position: index + 1 }));
}

// Convert matches to fixture format
function getFixtureMatches(
  pairIds: string[],
  matches: typeof trucoMatches
): FixtureMatch[] {
  return matches
    .filter(
      (m) => pairIds.includes(m.pair1) && pairIds.includes(m.pair2)
    )
    .map((m, index) => {
      const pair1Name = trucoPairs.find((p) => p.id === m.pair1)?.name || m.pair1;
      const pair2Name = trucoPairs.find((p) => p.id === m.pair2)?.name || m.pair2;
      return {
        id: m.id,
        team1: pair1Name,
        team2: pair2Name,
        score1: m.played ? (m.winner === m.pair1 ? "W" : "L") : undefined,
        score2: m.played ? (m.winner === m.pair2 ? "W" : "L") : undefined,
        played: m.played,
        matchNumber: index + 1,
      };
    });
}

const regulations = [
  {
    title: "Formato del Torneo",
    items: [
      "8 parejas (16 jugadores) divididas en 2 grupos de 4",
      "Fase de grupos: todos contra todos",
      "Los 2 mejores de cada grupo avanzan a semifinales",
    ],
  },
  {
    title: "Formato de Partidos",
    items: [
      "Partidos a 30 puntos (15 malas + 15 buenas)",
      "Sin flor",
    ],
  },
  {
    title: "Sistema de Puntos",
    items: [
      "Victoria: 1 punto",
    ],
  },
  {
    title: "Criterios de Desempate",
    items: [
      "1. Resultado entre empatados (cabeza a cabeza)",
      "2. Diferencia de puntos en los partidos",
      "3. Antigüedad del equipo (suma de años de antigüedad)",
    ],
  },
  {
    title: "Fase Final",
    items: [
      "Semifinales",
      "Final",
      "Partido por el 3er puesto",
    ],
  },
];

// Mock bracket data
const semis: BracketMatch[] = [
  { id: "tsf1", team1: "Por definir (1° A)", team2: "Por definir (2° B)", played: false },
  { id: "tsf2", team1: "Por definir (1° B)", team2: "Por definir (2° A)", played: false },
];

export default function TrucoPage() {
  const [activeTab, setActiveTab] = useState("fixture");

  const standingsA = calculateStandings(trucoGroups.A, trucoMatches);
  const standingsB = calculateStandings(trucoGroups.B, trucoMatches);
  const fixtureA = getFixtureMatches(trucoGroups.A, trucoMatches);
  const fixtureB = getFixtureMatches(trucoGroups.B, trucoMatches);

  return (
    <div className="min-h-screen bg-background">
      <DisciplineHeader name="Truco" icon="🎴" />

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="reglamento">Reglamento</TabsTrigger>
            <TabsTrigger value="participantes">Participantes</TabsTrigger>
            <TabsTrigger value="fixture">Fixture</TabsTrigger>
            <TabsTrigger value="posiciones">Posiciones</TabsTrigger>
            <TabsTrigger value="fase-final">Fase Final</TabsTrigger>
          </TabsList>

          <TabsContent value="reglamento">
            <Regulations sections={regulations} />
          </TabsContent>

          <TabsContent value="participantes">
            <PairParticipantsList title="Parejas Participantes" pairs={trucoPairs} />
          </TabsContent>

          <TabsContent value="fixture" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FixtureList title="Grupo A" matches={fixtureA} />
              <FixtureList title="Grupo B" matches={fixtureB} />
            </div>
          </TabsContent>

          <TabsContent value="posiciones" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <SimpleStandingsTable title="Grupo A" standings={standingsA} />
              <SimpleStandingsTable title="Grupo B" standings={standingsB} />
            </div>
          </TabsContent>

          <TabsContent value="fase-final">
            <Bracket title="Fase Eliminatoria" semifinals={semis} thirdPlace={undefined} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
