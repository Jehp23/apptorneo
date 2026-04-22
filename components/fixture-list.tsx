"use client"

export interface FixtureMatch {
  id: string
  team1: string
  team2: string
  score1?: number | string
  score2?: number | string
  played: boolean
  matchNumber?: number
}

interface FixtureListProps {
  title: string
  matches: FixtureMatch[]
}

export function FixtureList({ title, matches }: FixtureListProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-serif font-semibold text-foreground">{title}</h3>
      </div>
      <div className="divide-y divide-border">
        {matches.map((match, index) => (
          <div
            key={match.id}
            className={`flex items-center py-4 px-5 transition-colors hover:bg-muted/30 ${
              index % 2 === 1 ? "bg-muted/20" : ""
            }`}
          >
            <span className="text-xs text-muted-foreground font-mono w-8">
              {String(match.matchNumber || index + 1).padStart(2, "0")}
            </span>
            <div className="flex-1 flex items-center justify-center gap-4">
              <span className="flex-1 text-right font-medium text-foreground truncate">
                {match.team1}
              </span>
              {match.played ? (
                <div className="flex items-center gap-3 min-w-[80px] justify-center bg-muted/50 rounded-lg px-3 py-1.5">
                  <span className="font-semibold font-mono text-foreground">{match.score1}</span>
                  <span className="text-muted-foreground text-xs">-</span>
                  <span className="font-semibold font-mono text-foreground">{match.score2}</span>
                </div>
              ) : (
                <span className="min-w-[80px] text-center text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-1.5">
                  Pendiente
                </span>
              )}
              <span className="flex-1 text-left font-medium text-foreground truncate">
                {match.team2}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
