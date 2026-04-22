"use client"

import { useState } from "react"
import { Spade, ArrowDown, Trophy, Medal } from "lucide-react"
import { DisciplineHeader } from "@/components/discipline-header"
import { Regulations } from "@/components/regulations"
import { PremiumTabs } from "@/components/premium-tabs"
import { InfoPanel } from "@/components/info-panel"
import { lobaTables } from "@/lib/data"

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
      "El jugador que alcanza 101+ puntos queda eliminado",
      "Ganador: ultimo jugador en pie",
    ],
  },
  {
    title: "Estructura de Rondas",
    items: [
      "Ronda Inicial: 6 mesas simultaneas",
      "Ganadores avanzan a Ronda de Oro",
      "Restantes van a Ronda de Plata (5 mesas)",
    ],
  },
  {
    title: "Premiacion",
    items: [
      "1er Puesto: Ganador Ronda de Oro",
      "2do al 6to: Posiciones en Ronda de Oro",
      "Ronda de Plata: Premios consolacion",
    ],
  },
]

function LobaTableCard({ table }: { table: (typeof lobaTables)[0] }) {
  const sortedPlayers = [...table.players].sort((a, b) => a.points - b.points)

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <span className="font-semibold text-foreground">{table.name}</span>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
          {table.players.length} jugadores
        </span>
      </div>
      <ul className="divide-y divide-border">
        {sortedPlayers.map((player, index) => (
          <li
            key={player.id}
            className={`flex items-center justify-between px-4 py-2.5 text-sm ${
              player.eliminated
                ? "text-muted-foreground line-through bg-destructive/5"
                : index === 0
                  ? "bg-accent/10"
                  : index % 2 === 1
                    ? "bg-muted/20"
                    : ""
            }`}
          >
            <span className="flex items-center gap-2">
              {index === 0 && !player.eliminated && (
                <span className="h-2 w-2 rounded-full bg-accent" />
              )}
              <span className="text-foreground">{player.name}</span>
            </span>
            <span
              className={`font-mono text-sm ${
                player.points >= 90 ? "text-destructive font-semibold" : "text-muted-foreground"
              }`}
            >
              {player.points}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TournamentFlow() {
  const tableWinners = lobaTables.map((table) => {
    const activePlayers = table.players.filter((p) => !p.eliminated)
    const winner = activePlayers.sort((a, b) => a.points - b.points)[0]
    return {
      tableId: table.id,
      tableName: table.name,
      winner: winner?.name || "En progreso",
      points: winner?.points || 0,
    }
  })

  return (
    <div className="space-y-8">
      {/* Phase 1 */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            1
          </span>
          <h3 className="font-serif font-semibold text-foreground">Ronda Inicial</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {tableWinners.map((tw) => (
            <div
              key={tw.tableId}
              className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-lg"
            >
              <span className="text-sm text-muted-foreground">{tw.tableName}</span>
              <span className="font-medium text-foreground">{tw.winner}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <ArrowDown className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* Phase 2 - Split */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Ronda de Oro */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-primary/10 flex items-center gap-3">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="font-serif font-semibold text-foreground">Ronda de Oro</span>
          </div>
          <div className="p-5">
            <p className="text-sm text-muted-foreground mb-4">
              6 ganadores compiten por el primer puesto
            </p>
            <ul className="space-y-2">
              {tableWinners.map((tw) => (
                <li
                  key={tw.tableId}
                  className="flex items-center justify-between px-3 py-2 bg-muted/30 rounded-lg text-sm"
                >
                  <span className="text-foreground">{tw.winner}</span>
                  <span className="text-xs text-muted-foreground">{tw.tableName}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ronda de Plata */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-3">
            <Medal className="h-5 w-5 text-muted-foreground" />
            <span className="font-serif font-semibold text-foreground">Ronda de Plata</span>
          </div>
          <div className="p-5">
            <p className="text-sm text-muted-foreground mb-4">
              Jugadores restantes en 5 mesas
            </p>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <div
                  key={num}
                  className="flex items-center justify-center py-3 bg-muted/30 rounded-lg text-sm font-medium text-foreground"
                >
                  M{num}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ParticipantsView() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {lobaTables.map((table) => (
        <div key={table.id} className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <span className="font-semibold text-foreground">{table.name}</span>
            <span className="text-xs text-muted-foreground">{table.players.length} jug.</span>
          </div>
          <ul className="divide-y divide-border">
            {table.players.map((player, index) => (
              <li
                key={player.id}
                className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                  index % 2 === 1 ? "bg-muted/20" : ""
                }`}
              >
                <span className="text-foreground">{player.name}</span>
                <span className="text-muted-foreground text-xs font-mono">{player.seniority}a</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

const tabs = [
  { id: "estado", label: "Estado Mesas" },
  { id: "clasificacion", label: "Clasificacion" },
  { id: "participantes", label: "Participantes" },
  { id: "reglamento", label: "Reglamento" },
]

export default function LobaPage() {
  const [activeTab, setActiveTab] = useState("estado")

  return (
    <div className="p-8">
      <DisciplineHeader name="Loba" Icon={Spade} description="38 jugadores - 6 mesas - Eliminacion 101 pts" />

      <div className="flex gap-8">
        <div className="flex-1 min-w-0">
          <PremiumTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "reglamento" && <Regulations sections={regulations} />}
          {activeTab === "participantes" && <ParticipantsView />}
          {activeTab === "estado" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lobaTables.map((table) => (
                <LobaTableCard key={table.id} table={table} />
              ))}
            </div>
          )}
          {activeTab === "clasificacion" && <TournamentFlow />}
        </div>

        <div className="hidden xl:block w-72 flex-shrink-0">
          <InfoPanel teams={6} players={38} format="Mesas + Rondas" classification="6 a Ronda de Oro" />
        </div>
      </div>
    </div>
  )
}
