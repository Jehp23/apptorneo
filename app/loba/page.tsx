"use client";

import { useState } from "react";
import { DisciplineHeader } from "@/components/discipline-header";
import { Regulations } from "@/components/regulations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { lobaTables } from "@/lib/data";
import { ArrowRight, Trophy, Medal } from "lucide-react";

const regulations = [
  {
    title: "Formato del Torneo",
    items: [
      "38 jugadores distribuidos en 6 mesas",
      "4 mesas de 6 jugadores",
      "2 mesas de 7 jugadores",
    ],
  },
  {
    title: "Regla de Eliminación",
    items: [
      "El jugador que alcanza 101 o más puntos queda eliminado",
      "El ganador de cada mesa es el último jugador que queda en pie",
    ],
  },
  {
    title: "Estructura de Rondas",
    items: [
      "Ronda Inicial: 6 mesas compiten simultáneamente",
      "Ganadores de cada mesa avanzan a la 'Ronda de Oro'",
      "Jugadores restantes se redistribuyen en 5 mesas para la 'Ronda de Plata'",
    ],
  },
  {
    title: "Premiación",
    items: [
      "1° Puesto: Ganador de la Ronda de Oro",
      "2° al 6°: Posiciones en Ronda de Oro",
      "Ronda de Plata: Premios de consolación",
    ],
  },
];

function LobaTableCard({ table }: { table: typeof lobaTables[0] }) {
  const sortedPlayers = [...table.players].sort((a, b) => a.points - b.points);
  const winner = sortedPlayers.find((p) => !p.eliminated);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          {table.name}
          {winner && (
            <Badge className="bg-yellow-500 text-yellow-950">
              <Trophy className="h-3 w-3 mr-1" />
              Líder
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {sortedPlayers.map((player, index) => (
            <li
              key={player.id}
              className={`flex items-center justify-between p-2 rounded-md ${
                player.eliminated
                  ? "bg-red-50 text-red-700 line-through"
                  : index === 0
                  ? "bg-green-50 text-green-700 font-medium"
                  : "bg-muted/30"
              }`}
            >
              <span className="flex items-center gap-2">
                {index === 0 && !player.eliminated && (
                  <Trophy className="h-4 w-4 text-yellow-500" />
                )}
                {player.name}
              </span>
              <span className="font-mono font-semibold">
                {player.points} pts
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function TournamentFlow() {
  const tableWinners = lobaTables.map((table) => {
    const activePlayers = table.players.filter((p) => !p.eliminated);
    const winner = activePlayers.sort((a, b) => a.points - b.points)[0];
    return {
      tableId: table.id,
      tableName: table.name,
      winner: winner?.name || "En progreso",
      points: winner?.points || 0,
    };
  });

  return (
    <div className="space-y-8">
      {/* Phase 1 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm">
              1
            </span>
            Ronda Inicial - 6 Mesas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tableWinners.map((tw) => (
              <div
                key={tw.tableId}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <span className="font-medium">{tw.tableName}</span>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">{tw.winner}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Arrow */}
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-0.5 bg-border" />
          <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
        </div>
      </div>

      {/* Phase 2 - Split */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Ronda de Oro */}
        <Card className="border-yellow-300 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Trophy className="h-5 w-5" />
              Ronda de Oro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              6 ganadores de mesas compiten por el primer puesto
            </p>
            <div className="space-y-2">
              {tableWinners.map((tw) => (
                <div
                  key={tw.tableId}
                  className="flex items-center justify-between p-2 bg-white rounded border"
                >
                  <span className="text-sm">{tw.winner}</span>
                  <Badge variant="secondary" className="text-xs">
                    {tw.tableName}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ronda de Plata */}
        <Card className="border-gray-300 bg-gray-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <Medal className="h-5 w-5" />
              Ronda de Plata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Jugadores restantes redistribuidos en 5 mesas
            </p>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <div
                  key={num}
                  className="flex items-center justify-center p-3 bg-white rounded border text-sm font-medium"
                >
                  M{num}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Se redistribuyen los jugadores no eliminados
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ParticipantsView() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Distribución por Mesas</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lobaTables.map((table) => (
          <Card key={table.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                {table.name}
                <Badge variant="secondary">{table.players.length} jugadores</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {table.players.map((player) => (
                  <li key={player.id} className="flex items-center justify-between text-sm">
                    <span>{player.name}</span>
                    <span className="text-muted-foreground text-xs">{player.seniority} años</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function LobaPage() {
  const [activeTab, setActiveTab] = useState("estado");

  return (
    <div className="min-h-screen bg-background">
      <DisciplineHeader name="Loba" icon="🃏" />

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="reglamento">Reglamento</TabsTrigger>
            <TabsTrigger value="participantes">Participantes</TabsTrigger>
            <TabsTrigger value="estado">Estado Mesas</TabsTrigger>
            <TabsTrigger value="clasificacion">Clasificación</TabsTrigger>
          </TabsList>

          <TabsContent value="reglamento">
            <Regulations sections={regulations} />
          </TabsContent>

          <TabsContent value="participantes">
            <ParticipantsView />
          </TabsContent>

          <TabsContent value="estado">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lobaTables.map((table) => (
                <LobaTableCard key={table.id} table={table} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="clasificacion">
            <TournamentFlow />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
