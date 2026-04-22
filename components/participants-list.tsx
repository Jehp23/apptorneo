"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Player, Team } from "@/lib/data";

interface ParticipantsListProps {
  title: string;
  teams: Team[];
}

export function ParticipantsList({ title, teams }: ParticipantsListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                {team.name}
                <Badge variant="secondary" className="font-normal">
                  {team.players.length} jugadores
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {team.players.map((player) => (
                  <li key={player.id} className="flex items-center justify-between text-sm">
                    <span>{player.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {player.seniority} años
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface PairParticipantsListProps {
  title: string;
  pairs: Array<{
    id: string;
    name: string;
    player1: Player;
    player2: Player;
  }>;
}

export function PairParticipantsList({ title, pairs }: PairParticipantsListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pairs.map((pair) => (
          <Card key={pair.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{pair.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                <li className="flex items-center justify-between text-sm">
                  <span>{pair.player1.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {pair.player1.seniority} años
                  </span>
                </li>
                <li className="flex items-center justify-between text-sm">
                  <span>{pair.player2.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {pair.player2.seniority} años
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
