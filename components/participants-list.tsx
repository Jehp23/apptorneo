"use client"

import type { Player, Team } from "@/lib/data"
import { Users } from "lucide-react"

interface ParticipantsListProps {
  title: string
  teams: Team[]
}

export function ParticipantsList({ title, teams }: ParticipantsListProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Users className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-serif font-semibold text-foreground">{title}</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <div key={team.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <span className="font-semibold text-foreground">{team.name}</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                {team.players.length} jugadores
              </span>
            </div>
            <ul className="divide-y divide-border">
              {team.players.map((player, index) => (
                <li
                  key={player.id}
                  className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                    index % 2 === 1 ? "bg-muted/20" : ""
                  }`}
                >
                  <span className="text-foreground">{player.name}</span>
                  <span className="text-muted-foreground text-xs font-mono">
                    {player.seniority} años
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

interface PairParticipantsListProps {
  title: string
  pairs: Array<{
    id: string
    name: string
    player1: Player
    player2: Player
  }>
}

export function PairParticipantsList({ title, pairs }: PairParticipantsListProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Users className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-serif font-semibold text-foreground">{title}</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pairs.map((pair, pairIndex) => (
          <div key={pair.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <span className="font-semibold text-foreground">{pair.name}</span>
            </div>
            <ul className="divide-y divide-border">
              <li className={`flex items-center justify-between px-4 py-2.5 text-sm`}>
                <span className="text-foreground">{pair.player1.name}</span>
                <span className="text-muted-foreground text-xs font-mono">{pair.player1.seniority}a</span>
              </li>
              <li className="flex items-center justify-between px-4 py-2.5 text-sm bg-muted/20">
                <span className="text-foreground">{pair.player2.name}</span>
                <span className="text-muted-foreground text-xs font-mono">{pair.player2.seniority}a</span>
              </li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
