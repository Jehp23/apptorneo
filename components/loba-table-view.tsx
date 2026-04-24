"use client"

import { useState } from "react"
import { Trophy } from "lucide-react"

export interface LobaTable {
  id: string
  name: string
  teams: Array<{ id: string; name: string; seed?: number | null }>
  winnerId?: string | null
  isFinal?: boolean
}

interface LobaTableViewProps {
  tables: LobaTable[]
  onWinnerSelect: (tableId: string, winnerId: string) => void
  onPointsUpdate?: (teamId: string, points: number) => void
  isEditable?: boolean
}

function PointsInput({
  teamId,
  currentPoints,
  onSave,
}: {
  teamId: string
  currentPoints: number | null
  onSave: (teamId: string, points: number) => void
}) {
  const [value, setValue] = useState(currentPoints !== null && currentPoints !== -1 ? String(currentPoints) : "")
  const [editing, setEditing] = useState(false)

  function commit() {
    const parsed = parseInt(value, 10)
    if (!isNaN(parsed) && parsed >= 0) {
      onSave(teamId, parsed)
    }
    setEditing(false)
  }

  if (!editing) {
    const pts = currentPoints !== null && currentPoints !== -1 ? currentPoints : null
    return (
      <button
        onClick={() => setEditing(true)}
        className={`min-w-[52px] rounded-lg border px-2 py-1 text-center text-sm font-mono font-bold transition-colors ${
          pts === null
            ? "border-dashed border-border text-muted-foreground/40 hover:border-primary/40"
            : pts >= 100
            ? "border-destructive/30 bg-destructive/5 text-destructive"
            : "border-border bg-muted/30 text-foreground hover:border-primary/40"
        }`}
      >
        {pts === null ? "—" : pts}
      </button>
    )
  }

  return (
    <input
      autoFocus
      type="number"
      min={0}
      max={200}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false) }}
      className="w-16 rounded-lg border-2 border-primary bg-background px-2 py-1 text-center text-sm font-mono font-bold outline-none"
    />
  )
}

export function LobaTableView({
  tables,
  onWinnerSelect,
  onPointsUpdate,
  isEditable = true,
}: LobaTableViewProps) {
  return (
    <div className="space-y-4">
      {tables.map((table) => {
        // Sort ascending by points (null = no points yet, go last; -1 = winner, go first)
        const sortedTeams = [...table.teams].sort((a, b) => {
          if (a.seed === -1) return -1
          if (b.seed === -1) return 1
          const pa = a.seed !== null && a.seed >= 0 ? a.seed : 9999
          const pb = b.seed !== null && b.seed >= 0 ? b.seed : 9999
          return pa - pb
        })

        const activePlayers = sortedTeams.filter(t => t.seed === null || (t.seed >= 0 && t.seed < 100) || t.seed === -1)
        const allEliminated = sortedTeams.filter(t => t.seed !== null && t.seed >= 100)

        return (
          <div
            key={table.id}
            className={`overflow-hidden rounded-xl border ${
              table.isFinal
                ? "border-primary/40 bg-primary/5"
                : "border-border bg-card"
            } shadow-sm`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                {table.isFinal && <Trophy className="h-4 w-4 text-primary" />}
                <h3 className={`font-semibold text-sm ${table.isFinal ? "text-primary" : "text-foreground"}`}>
                  {table.name}
                </h3>
                {table.winnerId && (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                    Ganador definido
                  </span>
                )}
              </div>
              {onPointsUpdate && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                  Puntos ↑ menos gana
                </span>
              )}
            </div>

            {/* Column header */}
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-border/50 bg-muted/20 px-4 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Jugador</span>
              {onPointsUpdate && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-center w-14">Pts</span>
              )}
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-center w-16">Ganador</span>
            </div>

            {/* Players */}
            <div className="divide-y divide-border/40">
              {sortedTeams.map((team) => {
                const pts = team.seed !== null && team.seed >= 0 ? team.seed : null
                const isWinner = team.seed === -1
                const isEliminated = pts !== null && pts >= 100

                return (
                  <div
                    key={team.id}
                    className={`grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3 transition-colors ${
                      isEliminated ? "bg-destructive/5" : isWinner ? "bg-emerald-500/5" : ""
                    }`}
                  >
                    {/* Name */}
                    <span className={`text-sm font-medium leading-snug ${
                      isEliminated
                        ? "line-through text-destructive/70"
                        : isWinner
                        ? "text-emerald-700 font-bold"
                        : "text-foreground"
                    }`}>
                      {team.name}
                      {isEliminated && (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-destructive/70">Eliminado</span>
                      )}
                    </span>

                    {/* Points input */}
                    {onPointsUpdate ? (
                      <div className="w-14 flex justify-center">
                        {!isWinner ? (
                          <PointsInput
                            teamId={team.id}
                            currentPoints={team.seed ?? null}
                            onSave={onPointsUpdate}
                          />
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold">—</span>
                        )}
                      </div>
                    ) : (
                      pts !== null && (
                        <span className={`w-14 text-center font-mono text-sm font-bold ${isEliminated ? "text-destructive" : "text-foreground"}`}>
                          {pts}
                        </span>
                      )
                    )}

                    {/* Winner button */}
                    <div className="w-16 flex justify-center">
                      {!isEliminated && isEditable ? (
                        <button
                          onClick={() => !isWinner && onWinnerSelect(table.id, team.id)}
                          className={`rounded-lg px-2 py-1 text-xs font-semibold transition-all ${
                            isWinner
                              ? "bg-emerald-500/20 text-emerald-700 cursor-default"
                              : "border border-border text-muted-foreground hover:border-emerald-400 hover:text-emerald-600"
                          }`}
                        >
                          {isWinner ? "✓" : "Pasar"}
                        </button>
                      ) : isWinner ? (
                        <span className="text-xs font-semibold text-emerald-600">✓</span>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>

            {!isEditable && !table.winnerId && activePlayers.length === 0 && (
              <p className="px-4 py-3 text-sm text-muted-foreground">Sin ganador definido</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
