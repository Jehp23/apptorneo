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
          <div className="space-y-3">
            {upcomingMatches.map((match, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-foreground">{match.team1}</span>
                  <span className="text-muted-foreground">vs</span>
                  <span className="font-medium text-foreground">{match.team2}</span>
                </div>
                {match.date && (
                  <span className="text-xs text-muted-foreground">{match.date}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
