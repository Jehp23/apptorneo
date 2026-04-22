"use client";

import type { Player, Team } from "@/lib/data";

interface ParticipantsListProps {
  title: string;
  teams: Team[];
}

export function ParticipantsList({ title, teams }: ParticipantsListProps) {
  return (
    <div>
      <h3 className="text-sm uppercase tracking-[0.15em] text-muted-foreground mb-6">{title}</h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <div key={team.id} className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <span className="font-medium">{team.name}</span>
              <span className="text-xs text-muted-foreground">{team.players.length} jugadores</span>
            </div>
            <ul className="divide-y divide-border">
              {team.players.map((player) => (
                <li key={player.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span>{player.name}</span>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {player.seniority}a
                  </span>
                </li>
              ))}
            </ul>
          </div>
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
    <div>
      <h3 className="text-sm uppercase tracking-[0.15em] text-muted-foreground mb-6">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pairs.map((pair) => (
          <div key={pair.id} className="border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <span className="font-medium">{pair.name}</span>
            </div>
            <ul className="divide-y divide-border">
              <li className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span>{pair.player1.name}</span>
                <span className="text-muted-foreground text-xs tabular-nums">{pair.player1.seniority}a</span>
              </li>
              <li className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span>{pair.player2.name}</span>
                <span className="text-muted-foreground text-xs tabular-nums">{pair.player2.seniority}a</span>
              </li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
