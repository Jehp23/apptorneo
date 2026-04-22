"use client"

import { useState } from "react"
import { CircleDot, Trophy, ArrowRight } from "lucide-react"
import { DisciplineHeader } from "@/components/discipline-header"
import { PairParticipantsList } from "@/components/participants-list"
import { Regulations } from "@/components/regulations"
import { PremiumTabs } from "@/components/premium-tabs"
import { InfoPanel } from "@/components/info-panel"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { sapoPairs } from "@/lib/data"

const regulations = [
  {
    title: "Formato del Torneo",
    items: [
      "15 parejas (30 jugadores)",
      "Fase 1: Clasificacion por puntaje",
      "Fase 2: Eliminacion directa (Top 8)",
    ],
  },
  {
    title: "Fase de Clasificacion",
    items: [
      "2 rondas de tiros por pareja",
      "Se suma puntaje total",
      "Top 8 avanzan a cuartos",
    ],
  },
  {
    title: "Fase Eliminatoria",
    items: ["Cuartos, Semifinales, Final", "Eliminacion directa"],
  },
  {
    title: "Desempate",
    items: ["5 tiros adicionales por equipo", "Repetir hasta ganador"],
  },
]

const sortedPairs = [...sapoPairs].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
const qualifiedPairs = sortedPairs.slice(0, 8)

interface BracketMatchData {
  id: string
  round: string
  team1: string
  team2: string
  played: boolean
  winner?: string
}

const bracketMatches: BracketMatchData[] = [
  { id: "qf1", round: "Cuartos", team1: qualifiedPairs[0]?.name || "", team2: qualifiedPairs[7]?.name || "", played: false },
  { id: "qf2", round: "Cuartos", team1: qualifiedPairs[1]?.name || "", team2: qualifiedPairs[6]?.name || "", played: false },
  { id: "qf3", round: "Cuartos", team1: qualifiedPairs[2]?.name || "", team2: qualifiedPairs[5]?.name || "", played: false },
  { id: "qf4", round: "Cuartos", team1: qualifiedPairs[3]?.name || "", team2: qualifiedPairs[4]?.name || "", played: false },
  { id: "sf1", round: "Semi", team1: "Ganador QF1", team2: "Ganador QF2", played: false },
  { id: "sf2", round: "Semi", team1: "Ganador QF3", team2: "Ganador QF4", played: false },
  { id: "f1", round: "Final", team1: "Ganador SF1", team2: "Ganador SF2", played: false },
]

function RankingTable() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-serif font-semibold text-foreground">Ranking de Clasificacion</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-12 text-center text-xs font-medium text-muted-foreground">#</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Pareja</TableHead>
              <TableHead className="w-16 text-center text-xs font-medium text-muted-foreground">R1</TableHead>
              <TableHead className="w-16 text-center text-xs font-medium text-muted-foreground">R2</TableHead>
              <TableHead className="w-20 text-center text-xs font-semibold text-foreground">Total</TableHead>
              <TableHead className="w-24 text-center text-xs font-medium text-muted-foreground">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPairs.map((pair, index) => {
              const isQualified = index < 8
              return (
                <TableRow
                  key={pair.id}
                  className={`border-b border-border last:border-0 transition-colors ${
                    index % 2 === 1 ? "bg-muted/20" : ""
                  } ${isQualified ? "bg-primary/5" : ""}`}
                >
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                        isQualified ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{pair.name}</TableCell>
                  <TableCell className="text-center font-mono text-sm text-muted-foreground">
                    {pair.round1Score}
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm text-muted-foreground">
                    {pair.round2Score}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-foreground">{pair.totalScore}</TableCell>
                  <TableCell className="text-center">
                    {isQualified ? (
                      <span className="text-xs font-medium text-accent">Clasificado</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Eliminado</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function BracketView() {
  const quarterfinals = bracketMatches.filter((m) => m.round === "Cuartos")
  const semifinals = bracketMatches.filter((m) => m.round === "Semi")
  const final = bracketMatches.find((m) => m.round === "Final")

  return (
    <div className="space-y-8">
      {/* Qualified teams */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-serif font-semibold text-foreground">Clasificados</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {qualifiedPairs.map((pair, index) => (
            <div
              key={pair.id}
              className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-lg"
            >
              <span className="text-sm text-muted-foreground font-mono">#{index + 1}</span>
              <span className="font-medium text-sm text-foreground truncate mx-2 flex-1">{pair.name}</span>
              <span className="text-xs text-muted-foreground font-mono">{pair.totalScore}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bracket visualization */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-serif font-semibold text-foreground mb-6">Cuadro Eliminatorio</h3>
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-4 overflow-x-auto pb-4">
          {/* Quarterfinals */}
          <div className="flex flex-col gap-3 min-w-[200px]">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Cuartos de Final</p>
            <div className="flex flex-col gap-3">
              {quarterfinals.map((match) => (
                <div key={match.id} className="border border-border rounded-xl overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-border bg-muted/30">
                    <span className="text-xs text-muted-foreground font-medium">{match.id.toUpperCase()}</span>
                  </div>
                  <div className="divide-y divide-border">
                    <div className="px-3 py-2.5">
                      <span className="text-sm font-medium text-foreground">{match.team1}</span>
                    </div>
                    <div className="px-3 py-2.5 bg-muted/20">
                      <span className="text-sm font-medium text-foreground">{match.team2}</span>
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
          <div className="flex flex-col gap-3 min-w-[200px]">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Semifinales</p>
            <div className="flex flex-col gap-3 pt-10">
              {semifinals.map((match) => (
                <div key={match.id} className="border border-border rounded-xl overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-border bg-muted/30">
                    <span className="text-xs text-muted-foreground font-medium">{match.id.toUpperCase()}</span>
                  </div>
                  <div className="divide-y divide-border">
                    <div className="px-3 py-2.5">
                      <span className="text-sm text-muted-foreground">{match.team1}</span>
                    </div>
                    <div className="px-3 py-2.5 bg-muted/20">
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
          <div className="flex flex-col gap-3 min-w-[200px]">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Final</p>
            <div className="pt-20">
              {final && (
                <div className="border-2 border-primary/20 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 border-b border-border bg-primary/10">
                    <span className="text-xs font-semibold text-primary">FINAL</span>
                  </div>
                  <div className="divide-y divide-border">
                    <div className="px-3 py-3">
                      <span className="text-sm text-muted-foreground">{final.team1}</span>
                    </div>
                    <div className="px-3 py-3 bg-muted/20">
                      <span className="text-sm text-muted-foreground">{final.team2}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const tabs = [
  { id: "ranking", label: "Ranking" },
  { id: "eliminatoria", label: "Eliminatoria" },
  { id: "participantes", label: "Parejas" },
  { id: "reglamento", label: "Reglamento" },
]

export default function SapoPage() {
  const [activeTab, setActiveTab] = useState("ranking")

  const formattedPairs = sapoPairs.map((pair) => ({
    id: pair.id,
    name: pair.name,
    player1: pair.player1,
    player2: pair.player2,
  }))

  return (
    <div className="p-8">
      <DisciplineHeader name="Sapo" Icon={CircleDot} description="15 parejas - Clasificacion + eliminatoria" />

      <div className="flex gap-8">
        <div className="flex-1 min-w-0">
          <PremiumTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "reglamento" && <Regulations sections={regulations} />}

          {activeTab === "participantes" && (
            <PairParticipantsList title="Parejas Participantes" pairs={formattedPairs} />
          )}

          {activeTab === "ranking" && <RankingTable />}

          {activeTab === "eliminatoria" && <BracketView />}
        </div>

        <div className="hidden xl:block w-72 flex-shrink-0">
          <InfoPanel teams={15} players={30} format="Ranking + Eliminatoria" classification="Top 8 avanzan" />
        </div>
      </div>
    </div>
  )
}
