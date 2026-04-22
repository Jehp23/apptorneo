"use client";

import { useState } from "react";
import { DisciplineHeader } from "@/components/discipline-header";
import { PairParticipantsList } from "@/components/participants-list";
import { Regulations } from "@/components/regulations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sapoPairs } from "@/lib/data";
import { Trophy, ArrowRight } from "lucide-react";

const regulations = [
  {
    title: "Formato del Torneo",
    items: [
      "15 parejas (30 jugadores)",
      "Fase 1: Clasificacion por puntaje total",
      "Fase 2: Eliminacion directa (Top 8)",
    ],
  },
  {
    title: "Fase de Clasificacion",
    items: [
      "Cada pareja realiza 2 rondas de tiros",
      "Se suma el puntaje total de ambas rondas",
      "Las 8 mejores parejas avanzan a cuartos de final",
    ],
  },
  {
    title: "Fase Eliminatoria",
    items: [
      "Cuartos de final, Semifinales, Final",
      "Partidos de eliminacion directa",
    ],
  },
  {
    title: "Criterio de Desempate",
    items: [
      "5 tiros adicionales por equipo",
      "Se repite hasta que haya un ganador",
    ],
  },
];

// Sort pairs by total score
const sortedPairs = [...sapoPairs].sort(
  (a, b) => (b.totalScore || 0) - (a.totalScore || 0)
);

// Top 8 qualify
const qualifiedPairs = sortedPairs.slice(0, 8);

// Bracket matches
interface BracketMatchData {
  id: string;
  round: string;
  team1: string;
  team2: string;
  played: boolean;
  winner?: string;
}

const bracketMatches: BracketMatchData[] = [
  // Quarterfinals
  { id: "qf1", round: "Cuartos", team1: qualifiedPairs[0]?.name || "", team2: qualifiedPairs[7]?.name || "", played: false },
  { id: "qf2", round: "Cuartos", team1: qualifiedPairs[1]?.name || "", team2: qualifiedPairs[6]?.name || "", played: false },
  { id: "qf3", round: "Cuartos", team1: qualifiedPairs[2]?.name || "", team2: qualifiedPairs[5]?.name || "", played: false },
  { id: "qf4", round: "Cuartos", team1: qualifiedPairs[3]?.name || "", team2: qualifiedPairs[4]?.name || "", played: false },
  // Semifinals
  { id: "sf1", round: "Semi", team1: "Ganador QF1", team2: "Ganador QF2", played: false },
  { id: "sf2", round: "Semi", team1: "Ganador QF3", team2: "Ganador QF4", played: false },
  // Final
  { id: "f1", round: "Final", team1: "Ganador SF1", team2: "Ganador SF2", played: false },
];

function RankingTable() {
  return (
    <div>
      <h3 className="text-sm uppercase tracking-[0.15em] text-muted-foreground mb-6">Ranking de Clasificacion</h3>
      <div className="overflow-x-auto border border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="w-12 text-center text-xs font-medium text-muted-foreground">#</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Pareja</TableHead>
              <TableHead className="w-16 text-center text-xs font-medium text-muted-foreground">R1</TableHead>
              <TableHead className="w-16 text-center text-xs font-medium text-muted-foreground">R2</TableHead>
              <TableHead className="w-20 text-center text-xs font-medium text-muted-foreground">Total</TableHead>
              <TableHead className="w-24 text-center text-xs font-medium text-muted-foreground">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPairs.map((pair, index) => {
              const isQualified = index < 8;
              return (
                <TableRow
                  key={pair.id}
                  className={`border-b border-border last:border-0 ${isQualified ? "bg-muted/30" : ""}`}
                >
                  <TableCell className="text-center font-medium tabular-nums">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{pair.name}</TableCell>
                  <TableCell className="text-center tabular-nums text-muted-foreground">
                    {pair.round1Score}
                  </TableCell>
                  <TableCell className="text-center tabular-nums text-muted-foreground">
                    {pair.round2Score}
                  </TableCell>
                  <TableCell className="text-center font-semibold tabular-nums">
                    {pair.totalScore}
                  </TableCell>
                  <TableCell className="text-center">
                    {isQualified ? (
                      <span className="text-xs font-medium">Clasificado</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Eliminado</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function BracketView() {
  const quarterfinals = bracketMatches.filter((m) => m.round === "Cuartos");
  const semifinals = bracketMatches.filter((m) => m.round === "Semi");
  const final = bracketMatches.find((m) => m.round === "Final");

  return (
    <div className="space-y-12">
      {/* Qualified teams */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-5 w-5" />
          <h3 className="text-sm uppercase tracking-[0.15em] text-muted-foreground">Clasificados</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {qualifiedPairs.map((pair, index) => (
            <div
              key={pair.id}
              className="flex items-center justify-between px-4 py-3 border border-border rounded-lg bg-muted/30"
            >
              <span className="text-sm text-muted-foreground tabular-nums">#{index + 1}</span>
              <span className="font-medium text-sm truncate mx-2 flex-1">{pair.name}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{pair.totalScore}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bracket visualization */}
      <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-6 overflow-x-auto pb-4">
        {/* Quarterfinals */}
        <div className="flex flex-col gap-4 min-w-[200px]">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Cuartos de Final</p>
          <div className="flex flex-col gap-4">
            {quarterfinals.map((match) => (
              <div key={match.id} className="border border-border rounded-lg overflow-hidden">
                <div className="px-3 py-1.5 border-b border-border bg-muted/30">
                  <span className="text-xs text-muted-foreground">{match.id.toUpperCase()}</span>
                </div>
                <div className="divide-y divide-border">
                  <div className="px-3 py-2">
                    <span className="text-sm font-medium">{match.team1}</span>
                  </div>
                  <div className="px-3 py-2">
                    <span className="text-sm font-medium">{match.team2}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden lg:flex items-center self-center">
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Semifinals */}
        <div className="flex flex-col gap-4 min-w-[200px]">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Semifinales</p>
          <div className="flex flex-col gap-4 pt-12">
            {semifinals.map((match) => (
              <div key={match.id} className="border border-border rounded-lg overflow-hidden">
                <div className="px-3 py-1.5 border-b border-border bg-muted/30">
                  <span className="text-xs text-muted-foreground">{match.id.toUpperCase()}</span>
                </div>
                <div className="divide-y divide-border">
                  <div className="px-3 py-2">
                    <span className="text-sm text-muted-foreground">{match.team1}</span>
                  </div>
                  <div className="px-3 py-2">
                    <span className="text-sm text-muted-foreground">{match.team2}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden lg:flex items-center self-center">
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Final */}
        <div className="flex flex-col gap-4 min-w-[200px]">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Final</p>
          <div className="pt-24">
            {final && (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="px-3 py-1.5 border-b border-border bg-muted/30">
                  <span className="text-xs font-medium">FINAL</span>
                </div>
                <div className="divide-y divide-border">
                  <div className="px-3 py-3">
                    <span className="text-sm text-muted-foreground">{final.team1}</span>
                  </div>
                  <div className="px-3 py-3">
                    <span className="text-sm text-muted-foreground">{final.team2}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const tabs = [
  { id: "reglamento", label: "Reglamento" },
  { id: "participantes", label: "Participantes" },
  { id: "ranking", label: "Ranking" },
  { id: "eliminatoria", label: "Eliminatoria" },
];

export default function SapoPage() {
  const [activeTab, setActiveTab] = useState("ranking");

  // Format pairs for PairParticipantsList
  const formattedPairs = sapoPairs.map((pair) => ({
    id: pair.id,
    name: pair.name,
    player1: pair.player1,
    player2: pair.player2,
  }));

  return (
    <div className="min-h-screen bg-background">
      <DisciplineHeader name="Sapo" icon="🐸" />

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
          <PairParticipantsList title="Parejas Participantes" pairs={formattedPairs} />
        )}

        {activeTab === "ranking" && <RankingTable />}

        {activeTab === "eliminatoria" && <BracketView />}
      </main>
    </div>
  );
}
