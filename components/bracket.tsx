"use client"

import { Trophy } from "lucide-react"

export interface BracketMatch {
  id: string
  team1: string
  team2: string
  score1?: number | string
  score2?: number | string
  played: boolean
  winner?: string
}

interface BracketProps {
  title: string
  semifinals: BracketMatch[]
  final?: BracketMatch
  thirdPlace?: BracketMatch
}

function BracketMatchCard({ match, label, isFinal = false }: { match: BracketMatch; label: string; isFinal?: boolean }) {
  const isWinner1 = match.winner === match.team1
  const isWinner2 = match.winner === match.team2

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden min-w-[220px] ${isFinal ? "ring-2 ring-primary/20" : ""}`}>
      <div className={`px-4 py-2.5 border-b border-border ${isFinal ? "bg-primary/10" : "bg-muted/30"}`}>
        <span className={`text-xs font-medium ${isFinal ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
      </div>
      <div className="divide-y divide-border">
        <div className={`flex items-center justify-between px-4 py-3.5 transition-colors ${isWinner1 ? "bg-accent/10" : ""}`}>
          <span className={`text-sm ${isWinner1 ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
            {match.team1 || "Por definir"}
          </span>
          {match.played && (
            <span className={`font-mono text-sm ${isWinner1 ? "font-semibold text-accent" : "text-muted-foreground"}`}>
              {match.score1}
            </span>
          )}
        </div>
        <div className={`flex items-center justify-between px-4 py-3.5 transition-colors ${isWinner2 ? "bg-accent/10" : ""}`}>
          <span className={`text-sm ${isWinner2 ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
            {match.team2 || "Por definir"}
          </span>
          {match.played && (
            <span className={`font-mono text-sm ${isWinner2 ? "font-semibold text-accent" : "text-muted-foreground"}`}>
              {match.score2}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function Bracket({ title, semifinals, final, thirdPlace }: BracketProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-serif font-semibold text-foreground">{title}</h3>
      </div>
      
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8 overflow-x-auto pb-4">
        {/* Semifinals */}
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Semifinales</p>
          <div className="flex flex-col gap-4">
            {semifinals.map((match, index) => (
              <BracketMatchCard key={match.id} match={match} label={`Semifinal ${index + 1}`} />
            ))}
          </div>
        </div>

        {/* Connector */}
        <div className="hidden lg:flex items-center self-center">
          <div className="w-8 h-px bg-border" />
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-8 h-px bg-border" />
        </div>

        {/* Final */}
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Final</p>
          {final ? (
            <BracketMatchCard match={final} label="Final" isFinal />
          ) : (
            <div className="bg-muted/30 border-2 border-dashed border-border rounded-xl px-4 py-10 min-w-[220px] text-center">
              <span className="text-sm text-muted-foreground">Por definir</span>
            </div>
          )}
        </div>

        {/* Third Place */}
        {thirdPlace !== undefined && (
          <>
            <div className="hidden lg:flex items-center self-center">
              <div className="w-6 h-px bg-border" />
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">3er Puesto</p>
              {thirdPlace ? (
                <BracketMatchCard match={thirdPlace} label="3er Puesto" />
              ) : (
                <div className="bg-muted/30 border-2 border-dashed border-border rounded-xl px-4 py-10 min-w-[220px] text-center">
                  <span className="text-sm text-muted-foreground">Por definir</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
