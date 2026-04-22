"use client";

import { useState } from "react";
import { DisciplineHeader } from "@/components/discipline-header";
import { Regulations } from "@/components/regulations";
import { lobaTables } from "@/lib/data";
import { ArrowDown, Trophy, Medal } from "lucide-react";

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
    title: "Regla de Eliminacion",
    items: [
      "El jugador que alcanza 101 o mas puntos queda eliminado",
      "El ganador de cada mesa es el ultimo jugador que queda en pie",
    ],
  },
  {
    title: "Estructura de Rondas",
    items: [
      "Ronda Inicial: 6 mesas compiten simultaneamente",
      "Ganadores de cada mesa avanzan a la Ronda de Oro",
      "Jugadores restantes se redistribuyen en 5 mesas para la Ronda de Plata",
    ],
  },
  {
    title: "Premiacion",
    items: [
      "1er Puesto: Ganador de la Ronda de Oro",
      "2do al 6to: Posiciones en Ronda de Oro",
      "Ronda de Plata: Premios de consolacion",
    ],
  },
];

function LobaTableCard({ table }: { table: typeof lobaTables[0] }) {
  const sortedPlayers = [...table.players].sort((a, b) => a.points - b.points);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <span className="font-medium">{table.name}</span>
        <span className="text-xs text-muted-foreground">{table.players.length} jugadores</span>
      </div>
      <ul className="divide-y divide-border">
        {sortedPlayers.map((player, index) => (
          <li
            key={player.id}
            className={`flex items-center justify-between px-4 py-2.5 text-sm ${
              player.eliminated
                ? "text-muted-foreground line-through bg-muted/20"
                : index === 0
                ? "bg-foreground/5"
                : ""
            }`}
          >
            <span className="flex items-center gap-2">
              {index === 0 && !player.eliminated && (
                <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
              )}
              {player.name}
            </span>
            <span className="tabular-nums font-medium">
              {player.points}
            </span>
          </li>
        ))}
      </ul>
    </div>
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
    <div className="space-y-12">
      {/* Phase 1 */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium">1</span>
          <h3 className="text-sm uppercase tracking-[0.15em] text-muted-foreground">Ronda Inicial</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tableWinners.map((tw) => (
            <div
              key={tw.tableId}
              className="flex items-center justify-between px-4 py-3 border border-border rounded-lg"
            >
              <span className="text-sm text-muted-foreground">{tw.tableName}</span>
              <span className="font-medium">{tw.winner}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <ArrowDown className="h-6 w-6 text-muted-foreground" />
      </div>

      {/* Phase 2 - Split */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Ronda de Oro */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-3">
            <Trophy className="h-4 w-4" />
            <span className="font-medium">Ronda de Oro</span>
          </div>
          <div className="p-5">
            <p className="text-sm text-muted-foreground mb-4">
              6 ganadores de mesas compiten por el primer puesto
            </p>
            <ul className="space-y-2">
              {tableWinners.map((tw) => (
                <li
                  key={tw.tableId}
                  className="flex items-center justify-between px-3 py-2 bg-muted/30 rounded text-sm"
                >
                  <span>{tw.winner}</span>
                  <span className="text-xs text-muted-foreground">{tw.tableName}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ronda de Plata */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-3">
            <Medal className="h-4 w-4" />
            <span className="font-medium">Ronda de Plata</span>
          </div>
          <div className="p-5">
            <p className="text-sm text-muted-foreground mb-4">
              Jugadores restantes redistribuidos en 5 mesas
            </p>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <div
                  key={num}
                  className="flex items-center justify-center py-3 bg-muted/30 rounded text-sm font-medium"
                >
                  M{num}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParticipantsView() {
  return (
    <div>
      <h3 className="text-sm uppercase tracking-[0.15em] text-muted-foreground mb-6">Distribucion por Mesas</h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lobaTables.map((table) => (
          <div key={table.id} className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <span className="font-medium">{table.name}</span>
              <span className="text-xs text-muted-foreground">{table.players.length} jugadores</span>
            </div>
            <ul className="divide-y divide-border">
              {table.players.map((player) => (
                <li key={player.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span>{player.name}</span>
                  <span className="text-muted-foreground text-xs tabular-nums">{player.seniority}a</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

const tabs = [
  { id: "reglamento", label: "Reglamento" },
  { id: "participantes", label: "Participantes" },
  { id: "estado", label: "Estado Mesas" },
  { id: "clasificacion", label: "Clasificacion" },
];

export default function LobaPage() {
  const [activeTab, setActiveTab] = useState("estado");

  return (
    <div className="min-h-screen bg-background">
      <DisciplineHeader name="Loba" icon="🃏" />

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
        {activeTab === "participantes" && <ParticipantsView />}
        {activeTab === "estado" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lobaTables.map((table) => (
              <LobaTableCard key={table.id} table={table} />
            ))}
          </div>
        )}
        {activeTab === "clasificacion" && <TournamentFlow />}
      </main>
    </div>
  );
}
