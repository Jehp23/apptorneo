"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="bg-card border rounded-lg overflow-hidden">
      <div className="bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
        {label}
      </div>
      <div className="divide-y">
        <div className={`flex items-center justify-between p-2 ${isWinner1 ? "bg-green-50" : ""}`}>
          <span className={`font-medium text-sm ${isWinner1 ? "text-green-700" : ""}`}>
            {match.team1 || "Por definir"}
          </span>
          {match.played && (
            <span className={`font-bold ${isWinner1 ? "text-green-700" : ""}`}>
              {match.score1}
            </span>
          )}
        </div>
        <div className={`flex items-center justify-between p-2 ${isWinner2 ? "bg-green-50" : ""}`}>
          <span className={`font-medium text-sm ${isWinner2 ? "text-green-700" : ""}`}>
            {match.team2 || "Por definir"}
          </span>
          {match.played && (
            <span className={`font-bold ${isWinner2 ? "text-green-700" : ""}`}>
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12">
          {/* Semifinals */}
          <div className="flex flex-col gap-4 w-full lg:w-auto">
            <h4 className="text-sm font-semibold text-center text-muted-foreground">Semifinales</h4>
            <div className="flex flex-col gap-8">
              {semifinals.map((match, index) => (
                <BracketMatchCard key={match.id} match={match} label={`Semi ${index + 1}`} />
              ))}
            </div>
          </div>

          {/* Connector */}
          <div className="hidden lg:block h-24 w-12 border-r-2 border-t-2 border-b-2 border-border rounded-r-lg" />

          {/* Final */}
          <div className="flex flex-col gap-4 w-full lg:w-auto">
            <h4 className="text-sm font-semibold text-center text-muted-foreground">Final</h4>
            {final ? (
              <BracketMatchCard match={final} label="Final" />
            ) : (
              <div className="bg-muted/30 border border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">
                Por definir
              </div>
            )}
          </div>

          {/* Third Place */}
          {thirdPlace !== undefined && (
            <>
              <div className="hidden lg:block w-12" />
              <div className="flex flex-col gap-4 w-full lg:w-auto">
                <h4 className="text-sm font-semibold text-center text-muted-foreground">3er Puesto</h4>
                {thirdPlace ? (
                  <BracketMatchCard match={thirdPlace} label="3er Puesto" />
                ) : (
                  <div className="bg-muted/30 border border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">
                    Por definir
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
