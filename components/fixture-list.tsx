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

function MatchRow({ match, index }: { match: FixtureMatch; index: number }) {
  const s1 = Number(match.score1)
  const s2 = Number(match.score2)
  const team1Wins = match.played && s1 > s2
  const team2Wins = match.played && s2 > s1

  return (
    <div className={`grid grid-cols-[1fr_80px_1fr] items-center gap-2 px-4 py-3.5 transition-colors hover:bg-primary/[0.03] ${
      index % 2 === 1 ? "bg-muted/30" : ""
    }`}>
      {/* Equipo 1 */}
      <div className="flex items-center justify-end gap-2">
        <span className={`text-sm text-right leading-snug ${
          team1Wins
            ? "font-bold text-foreground"
            : match.played
            ? "font-medium text-muted-foreground"
            : "font-medium text-foreground"
        }`}>
          {match.team1}
        </span>
        {team1Wins && (
          <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-primary" />
        )}
      </div>

      {/* Marcador */}
      <div className="flex items-center justify-center">
        {match.played ? (
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 shadow-sm">
            <span className={`w-5 text-center font-mono font-bold text-sm leading-none ${team1Wins ? "text-primary" : "text-foreground"}`}>
              {match.score1}
            </span>
            <span className="text-muted-foreground/40 text-xs leading-none">–</span>
            <span className={`w-5 text-center font-mono font-bold text-sm leading-none ${team2Wins ? "text-primary" : "text-foreground"}`}>
              {match.score2}
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
            vs
          </span>
        )}
      </div>

      {/* Equipo 2 */}
      <div className="flex items-center justify-start gap-2">
        {team2Wins && (
          <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-primary" />
        )}
        <span className={`text-sm text-left leading-snug ${
          team2Wins
            ? "font-bold text-foreground"
            : match.played
            ? "font-medium text-muted-foreground"
            : "font-medium text-foreground"
        }`}>
          {match.team2}
        </span>
      </div>
    </div>
  )
}

export function FixtureList({ title, matches }: FixtureListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">{matches.length} partidos</span>
      </div>

      {/* Header de columnas */}
      <div className="grid grid-cols-[1fr_80px_1fr] border-b border-border/50 bg-muted/20 px-4 py-2">
        <span className="text-right text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">Local</span>
        <span className="text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">Res.</span>
        <span className="text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">Visitante</span>
      </div>

      <div className="divide-y divide-border/50">
        {matches.map((match, index) => (
          <MatchRow key={match.id} match={match} index={index} />
        ))}
      </div>
    </div>
  )
}
