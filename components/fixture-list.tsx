"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {matches.map((match, index) => (
          <div 
            key={match.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              match.played ? "bg-muted/30" : "bg-background"
            }`}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono">#{match.matchNumber || index + 1}</span>
            </div>
            <div className="flex items-center gap-3 flex-1 justify-center">
              <span className="font-medium text-right flex-1 truncate">{match.team1}</span>
              {match.played ? (
                <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-md min-w-[80px] justify-center">
                  <span className="font-bold text-lg">{match.score1}</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="font-bold text-lg">{match.score2}</span>
                </div>
              ) : (
                <Badge variant="outline" className="min-w-[80px] justify-center">
                  Pendiente
                </Badge>
              )}
              <span className="font-medium text-left flex-1 truncate">{match.team2}</span>
            </div>
            <div className="w-8" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
