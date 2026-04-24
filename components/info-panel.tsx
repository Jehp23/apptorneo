"use client"

import { Users, Trophy, Calendar, Target } from "lucide-react"

interface InfoItem {
  label: string
  value: string | number
}

interface UpcomingMatch {
  team1: string
  team2: string
  date?: string
}

interface InfoPanelProps {
  teams: number
  players: number
  format: string
  classification: string
  upcomingMatches?: UpcomingMatch[]
}

export function InfoPanel({ teams, players, format, classification, upcomingMatches }: InfoPanelProps) {
  const items: InfoItem[] = [
    { label: "Equipos", value: teams },
    { label: "Jugadores", value: players },
    { label: "Formato", value: format },
    { label: "Clasificacion", value: classification },
  ]

  return (
    <div className="space-y-4">
      {/* Stats Card */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-serif font-semibold text-sm text-foreground mb-4">Informacion</h3>
        <div className="grid grid-cols-2 gap-4">
          {items.map((item, index) => (
            <div key={index} className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-lg font-semibold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Matches */}
      {upcomingMatches && upcomingMatches.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="font-serif font-semibold text-sm text-foreground">Proximos Partidos</h3>
          </div>
          <div className="divide-y divide-border/50">
            {upcomingMatches.map((match, index) => (
              <div key={index} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2.5">
                <span className="text-sm font-medium text-foreground text-right leading-snug">{match.team1}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">vs</span>
                <span className="text-sm font-medium text-foreground text-left leading-snug">{match.team2}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
