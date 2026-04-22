"use client";

export interface FixtureMatch {
  id: string;
  team1: string;
  team2: string;
  score1?: number | string;
  score2?: number | string;
  played: boolean;
  matchNumber?: number;
}

interface FixtureListProps {
  title: string;
  matches: FixtureMatch[];
}

export function FixtureList({ title, matches }: FixtureListProps) {
  return (
    <div>
      <h3 className="text-sm uppercase tracking-[0.15em] text-muted-foreground mb-6">{title}</h3>
      <div className="border border-border rounded-lg divide-y divide-border">
        {matches.map((match, index) => (
          <div 
            key={match.id}
            className="flex items-center py-4 px-5"
          >
            <span className="text-xs text-muted-foreground tabular-nums w-8">
              {match.matchNumber || index + 1}
            </span>
            <div className="flex-1 flex items-center justify-center gap-4">
              <span className="flex-1 text-right font-medium truncate">{match.team1}</span>
              {match.played ? (
                <div className="flex items-center gap-2 min-w-[72px] justify-center">
                  <span className="font-semibold tabular-nums">{match.score1}</span>
                  <span className="text-muted-foreground">:</span>
                  <span className="font-semibold tabular-nums">{match.score2}</span>
                </div>
              ) : (
                <span className="min-w-[72px] text-center text-xs text-muted-foreground">
                  vs
                </span>
              )}
              <span className="flex-1 text-left font-medium truncate">{match.team2}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
