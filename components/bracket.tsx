"use client";

export interface BracketMatch {
  id: string;
  team1: string;
  team2: string;
  score1?: number | string;
  score2?: number | string;
  played: boolean;
  winner?: string;
}

interface BracketProps {
  title: string;
  semifinals: BracketMatch[];
  final?: BracketMatch;
  thirdPlace?: BracketMatch;
}

function BracketMatchCard({ match, label }: { match: BracketMatch; label: string }) {
  const isWinner1 = match.winner === match.team1;
  const isWinner2 = match.winner === match.team2;

  return (
    <div className="border border-border rounded-lg overflow-hidden min-w-[200px]">
      <div className="px-4 py-2 border-b border-border bg-muted/30">
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="divide-y divide-border">
        <div className={`flex items-center justify-between px-4 py-3 ${isWinner1 ? "bg-foreground/5" : ""}`}>
          <span className={`text-sm ${isWinner1 ? "font-semibold" : "font-medium"}`}>
            {match.team1 || "Por definir"}
          </span>
          {match.played && (
            <span className={`tabular-nums ${isWinner1 ? "font-semibold" : "text-muted-foreground"}`}>
              {match.score1}
            </span>
          )}
        </div>
        <div className={`flex items-center justify-between px-4 py-3 ${isWinner2 ? "bg-foreground/5" : ""}`}>
          <span className={`text-sm ${isWinner2 ? "font-semibold" : "font-medium"}`}>
            {match.team2 || "Por definir"}
          </span>
          {match.played && (
            <span className={`tabular-nums ${isWinner2 ? "font-semibold" : "text-muted-foreground"}`}>
              {match.score2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function Bracket({ title, semifinals, final, thirdPlace }: BracketProps) {
  return (
    <div>
      <h3 className="text-sm uppercase tracking-[0.15em] text-muted-foreground mb-6">{title}</h3>
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12 overflow-x-auto pb-4">
        {/* Semifinals */}
        <div className="flex flex-col gap-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Semifinales</p>
          <div className="flex flex-col gap-6">
            {semifinals.map((match, index) => (
              <BracketMatchCard key={match.id} match={match} label={`Semi ${index + 1}`} />
            ))}
          </div>
        </div>

        {/* Connector */}
        <div className="hidden lg:flex items-center self-center">
          <div className="w-12 h-px bg-border" />
        </div>

        {/* Final */}
        <div className="flex flex-col gap-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Final</p>
          {final ? (
            <BracketMatchCard match={final} label="Final" />
          ) : (
            <div className="border border-dashed border-border rounded-lg px-4 py-8 min-w-[200px] text-center">
              <span className="text-sm text-muted-foreground">Por definir</span>
            </div>
          )}
        </div>

        {/* Third Place */}
        {thirdPlace !== undefined && (
          <>
            <div className="hidden lg:flex items-center self-center">
              <div className="w-8 h-px bg-border" />
            </div>
            <div className="flex flex-col gap-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">3er Puesto</p>
              {thirdPlace ? (
                <BracketMatchCard match={thirdPlace} label="3er Puesto" />
              ) : (
                <div className="border border-dashed border-border rounded-lg px-4 py-8 min-w-[200px] text-center">
                  <span className="text-sm text-muted-foreground">Por definir</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
