"use client";

import { useState } from "react";
import { DisciplineHeader } from "@/components/discipline-header";
import { PairParticipantsList } from "@/components/participants-list";
import { Regulations } from "@/components/regulations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { sapoPairs } from "@/lib/data";
import { Trophy, Target, ArrowRight } from "lucide-react";

const regulations = [
  {
    title: "Formato del Torneo",
    items: [
      "15 parejas (30 jugadores)",
      "Fase 1: Clasificación por puntaje total",
      "Fase 2: Eliminación directa (Top 8)",
    ],
  },
  {
    title: "Fase de Clasificación",
    items: [
      "Cada pareja realiza 2 rondas de tiros",
      "Se suma el puntaje total de ambas rondas",
      "Las 8 mejores parejas avanzan a cuartos de final",
    ],
  },
  {
    title: "Fase Eliminatoria",
    items: [
      "Cuartos de final → Semifinales → Final",
      "Partidos de eliminación directa",
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Ranking de Clasificación
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 text-center font-bold">#</TableHead>
                <TableHead className="font-bold">Pareja</TableHead>
                <TableHead className="w-20 text-center font-bold">Ronda 1</TableHead>
                <TableHead className="w-20 text-center font-bold">Ronda 2</TableHead>
                <TableHead className="w-24 text-center font-bold bg-primary/10">Total</TableHead>
                <TableHead className="w-24 text-center font-bold">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPairs.map((pair, index) => {
                const isQualified = index < 8;
                return (
                  <TableRow
                    key={pair.id}
                    className={isQualified ? "bg-green-50" : ""}
                  >
                    <TableCell className="text-center font-semibold">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{pair.name}</TableCell>
                    <TableCell className="text-center font-mono">
                      {pair.round1Score}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {pair.round2Score}
                    </TableCell>
                    <TableCell className="text-center font-bold bg-primary/5">
                      {pair.totalScore}
                    </TableCell>
                    <TableCell className="text-center">
                      {isQualified ? (
                        <Badge className="bg-green-500">Clasificado</Badge>
                      ) : (
                        <Badge variant="outline">Eliminado</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function BracketView() {
  const quarterfinals = bracketMatches.filter((m) => m.round === "Cuartos");
  const semifinals = bracketMatches.filter((m) => m.round === "Semi");
  const final = bracketMatches.find((m) => m.round === "Final");

  return (
    <div className="space-y-8">
      {/* Qualified teams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Clasificados a la Fase Eliminatoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {qualifiedPairs.map((pair, index) => (
              <div
                key={pair.id}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <Badge variant="outline" className="font-mono">
                  #{index + 1}
                </Badge>
                <span className="font-medium text-green-700 text-sm truncate ml-2">
                  {pair.name}
                </span>
                <span className="text-xs text-green-600 font-mono">
                  {pair.totalScore}pts
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bracket visualization */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Quarterfinals */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-center text-muted-foreground bg-muted py-2 rounded">
            Cuartos de Final
          </h4>
          {quarterfinals.map((match) => (
            <Card key={match.id} className="overflow-hidden">
              <div className="bg-muted/50 px-3 py-1 text-xs font-medium text-center">
                {match.id.toUpperCase()}
              </div>
              <CardContent className="p-0 divide-y">
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm font-medium truncate">{match.team1}</span>
                </div>
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm font-medium truncate">{match.team2}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Arrow */}
        <div className="hidden lg:flex items-center justify-center">
          <ArrowRight className="h-8 w-8 text-muted-foreground" />
        </div>

        {/* Semifinals */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-center text-muted-foreground bg-muted py-2 rounded">
            Semifinales
          </h4>
          <div className="space-y-4 pt-8">
            {semifinals.map((match) => (
              <Card key={match.id} className="overflow-hidden">
                <div className="bg-muted/50 px-3 py-1 text-xs font-medium text-center">
                  {match.id.toUpperCase()}
                </div>
                <CardContent className="p-0 divide-y">
                  <div className="flex items-center justify-between p-2 bg-muted/20">
                    <span className="text-sm text-muted-foreground">{match.team1}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted/20">
                    <span className="text-sm text-muted-foreground">{match.team2}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-center text-muted-foreground bg-yellow-100 py-2 rounded">
            Final
          </h4>
          <div className="pt-16">
            {final && (
              <Card className="overflow-hidden border-yellow-300">
                <div className="bg-yellow-50 px-3 py-1 text-xs font-medium text-center text-yellow-700">
                  FINAL
                </div>
                <CardContent className="p-0 divide-y">
                  <div className="flex items-center justify-between p-3 bg-muted/20">
                    <span className="text-sm text-muted-foreground">{final.team1}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20">
                    <span className="text-sm text-muted-foreground">{final.team2}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="reglamento">Reglamento</TabsTrigger>
            <TabsTrigger value="participantes">Participantes</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="eliminatoria">Eliminatoria</TabsTrigger>
          </TabsList>

          <TabsContent value="reglamento">
            <Regulations sections={regulations} />
          </TabsContent>

          <TabsContent value="participantes">
            <PairParticipantsList title="Parejas Participantes" pairs={formattedPairs} />
          </TabsContent>

          <TabsContent value="ranking">
            <RankingTable />
          </TabsContent>

          <TabsContent value="eliminatoria">
            <BracketView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
