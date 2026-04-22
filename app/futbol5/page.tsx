"use client";

import { useState } from "react";
import { DisciplineHeader } from "@/components/discipline-header";
import { StandingsTable, type StandingRow } from "@/components/standings-table";
import { FixtureList, type FixtureMatch } from "@/components/fixture-list";
import { Bracket, type BracketMatch } from "@/components/bracket";
import { ParticipantsList } from "@/components/participants-list";
import { Regulations } from "@/components/regulations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { futbol5Teams, futbol5Groups, futbol5Matches } from "@/lib/data";

// Calculate standings from matches
function calculateStandings(
  teamIds: string[],
  matches: typeof futbol5Matches
): StandingRow[] {
  const stats: Record<string, StandingRow> = {};

  teamIds.forEach((teamId, index) => {
    const team = futbol5Teams.find((t) => t.id === teamId);
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
    };
  });

  matches
    .filter((m) => m.played && teamIds.includes(m.team1) && teamIds.includes(m.team2))
    .forEach((match) => {
      const t1 = stats[match.team1];
      const t2 = stats[match.team2];

      t1.pj++;
      t2.pj++;
      t1.gf += match.score1 || 0;
      t1.gc += match.score2 || 0;
      t2.gf += match.score2 || 0;
      t2.gc += match.score1 || 0;

      if ((match.score1 || 0) > (match.score2 || 0)) {
        t1.pg++;
        t1.pts += 3;
        t2.pp++;
      } else if ((match.score1 || 0) < (match.score2 || 0)) {
        t2.pg++;
        t2.pts += 3;
        t1.pp++;
      } else {
        t1.pe++;
        t2.pe++;
        t1.pts += 1;
        t2.pts += 1;
      }

      t1.dg = t1.gf - t1.gc;
      t2.dg = t2.gf - t2.gc;
    });

  return Object.values(stats)
    .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf)
    .map((row, index) => ({ ...row, position: index + 1 }));
}

// Convert matches to fixture format
function getFixtureMatches(
  teamIds: string[],
  matches: typeof futbol5Matches
): FixtureMatch[] {
  return matches
    .filter((m) => teamIds.includes(m.team1) && teamIds.includes(m.team2))
    .map((m, index) => ({
      id: m.id,
      team1: futbol5Teams.find((t) => t.id === m.team1)?.name || m.team1,
      team2: futbol5Teams.find((t) => t.id === m.team2)?.name || m.team2,
      score1: m.score1,
      score2: m.score2,
      played: m.played,
      matchNumber: index + 1,
    }));
}

const regulations = [
  {
    title: "Formato del Torneo",
    items: [
      "36 jugadores divididos en 6 equipos de 6 jugadores",
      "2 grupos (A y B) de 3 equipos cada uno",
      "Fase de grupos: todos contra todos dentro del grupo",
      "Los 2 mejores de cada grupo avanzan a semifinales",
    ],
  },
  {
    title: "Duración de Partidos",
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
      "1. Resultado entre empatados (cabeza a cabeza)",
      "2. Diferencia de goles",
      "3. Goles a favor",
      "4. Goles en contra (menor cantidad)",
      "5. Antigüedad del equipo (suma de años de antigüedad)",
      "6. Sorteo",
    ],
  },
  {
    title: "Fase Final",
    items: [
      "Semifinal 1: 1° Grupo A vs 2° Grupo B",
      "Semifinal 2: 1° Grupo B vs 2° Grupo A",
      "Final y partido por el 3er puesto",
    ],
  },
];

// Mock bracket data
const semis: BracketMatch[] = [
  { id: "sf1", team1: "Por definir (1° A)", team2: "Por definir (2° B)", played: false },
  { id: "sf2", team1: "Por definir (1° B)", team2: "Por definir (2° A)", played: false },
];

export default function Futbol5Page() {
  const [activeTab, setActiveTab] = useState("fixture");

  const standingsA = calculateStandings(futbol5Groups.A, futbol5Matches);
  const standingsB = calculateStandings(futbol5Groups.B, futbol5Matches);
  const fixtureA = getFixtureMatches(futbol5Groups.A, futbol5Matches);
  const fixtureB = getFixtureMatches(futbol5Groups.B, futbol5Matches);

  return (
    <div className="min-h-screen bg-background">
      <DisciplineHeader name="Fútbol 5" icon="⚽" />

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
            <ParticipantsList title="Equipos Participantes" teams={futbol5Teams} />
          </TabsContent>

          <TabsContent value="fixture" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FixtureList title="Grupo A" matches={fixtureA} />
              <FixtureList title="Grupo B" matches={fixtureB} />
            </div>
          </TabsContent>

          <TabsContent value="posiciones" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <StandingsTable title="Grupo A" standings={standingsA} />
              <StandingsTable title="Grupo B" standings={standingsB} />
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
