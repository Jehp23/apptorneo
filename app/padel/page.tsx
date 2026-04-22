"use client";

import { useState } from "react";
import { DisciplineHeader } from "@/components/discipline-header";
import { SimpleStandingsTable, type SimpleStandingRow } from "@/components/simple-standings-table";
import { FixtureList, type FixtureMatch } from "@/components/fixture-list";
import { Bracket, type BracketMatch } from "@/components/bracket";
import { PairParticipantsList } from "@/components/participants-list";
import { Regulations } from "@/components/regulations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { padelPairs, padelGroups, padelMatches } from "@/lib/data";

// Calculate standings from matches
function calculateStandings(
  pairIds: string[],
  matches: typeof padelMatches
): SimpleStandingRow[] {
  const stats: Record<string, SimpleStandingRow> = {};

  pairIds.forEach((pairId, index) => {
    const pair = padelPairs.find((p) => p.id === pairId);
    stats[pairId] = {
      position: index + 1,
      teamName: pair?.name || pairId,
      pj: 0,
      pg: 0,
      pp: 0,
      pts: 0,
      bonus: 0,
    };
  });

  matches
    .filter((m) => m.played && pairIds.includes(m.pair1) && pairIds.includes(m.pair2))
    .forEach((match) => {
      const p1 = stats[match.pair1];
      const p2 = stats[match.pair2];

      p1.pj++;
      p2.pj++;

      if ((match.sets1 || 0) > (match.sets2 || 0)) {
        p1.pg++;
        p1.pts += 1;
        p2.pp++;
        // Bonus points
        if (match.sets1 === 2 && match.sets2 === 0) {
          p1.bonus = (p1.bonus || 0) + 2;
          p1.pts += 2;
        } else if (match.sets1 === 2 && match.sets2 === 1) {
          p1.bonus = (p1.bonus || 0) + 1;
          p1.pts += 1;
        }
      } else {
        p2.pg++;
        p2.pts += 1;
        p1.pp++;
        // Bonus points
        if (match.sets2 === 2 && match.sets1 === 0) {
          p2.bonus = (p2.bonus || 0) + 2;
          p2.pts += 2;
        } else if (match.sets2 === 2 && match.sets1 === 1) {
          p2.bonus = (p2.bonus || 0) + 1;
          p2.pts += 1;
        }
      }
    });

  return Object.values(stats)
    .sort((a, b) => b.pts - a.pts)
    .map((row, index) => ({ ...row, position: index + 1 }));
}

// Convert matches to fixture format
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
    }));
}

const regulations = [
  {
    title: "Formato del Torneo",
    items: [
      "6 parejas divididas en 2 grupos de 3",
      "Fase de grupos: todos contra todos",
      "Los 2 mejores de cada grupo avanzan a semifinales",
    ],
  },
  {
    title: "Formato de Partidos",
    items: [
      "Mejor de 3 sets",
      "Golden point en caso de 40-40 (deuce)",
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
    title: "Criterios de Desempate",
    items: [
      "1. Resultado entre empatados (cabeza a cabeza)",
      "2. Antigüedad del equipo (suma de años de antigüedad)",
      "3. Sorteo",
    ],
  },
  {
    title: "Fase Final",
    items: [
      "Semifinales: Cruce entre grupos",
      "Final",
    ],
  },
];

// Mock bracket data
const semis: BracketMatch[] = [
  { id: "psf1", team1: "Por definir (1° A)", team2: "Por definir (2° B)", played: false },
  { id: "psf2", team1: "Por definir (1° B)", team2: "Por definir (2° A)", played: false },
];

export default function PadelPage() {
  const [activeTab, setActiveTab] = useState("fixture");

  const standingsA = calculateStandings(padelGroups.A, padelMatches);
  const standingsB = calculateStandings(padelGroups.B, padelMatches);
  const fixtureA = getFixtureMatches(padelGroups.A, padelMatches);
  const fixtureB = getFixtureMatches(padelGroups.B, padelMatches);

  return (
    <div className="min-h-screen bg-background">
      <DisciplineHeader name="Padel" icon="🎾" />

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
            <PairParticipantsList title="Parejas Participantes" pairs={padelPairs} />
          </TabsContent>

          <TabsContent value="fixture" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FixtureList title="Grupo A" matches={fixtureA} />
              <FixtureList title="Grupo B" matches={fixtureB} />
            </div>
          </TabsContent>

          <TabsContent value="posiciones" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <SimpleStandingsTable title="Grupo A" standings={standingsA} showBonus />
              <SimpleStandingsTable title="Grupo B" standings={standingsB} showBonus />
            </div>
          </TabsContent>

          <TabsContent value="fase-final">
            <Bracket title="Fase Eliminatoria" semifinals={semis} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
