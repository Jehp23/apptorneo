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
  isEditable?: boolean
}

export function LobaTableView({ tables, onWinnerSelect, isEditable = true }: LobaTableViewProps) {
  return (
    <div className="space-y-6">
      {tables.map((table) => (
        <div
          key={table.id}
          className={`rounded-2xl border ${
            table.isFinal
              ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20"
              : "border-border bg-card"
          } p-6`}
        >
          <div className="mb-4 flex items-center gap-3">
            {table.isFinal && <Trophy className="h-5 w-5 text-primary" />}
            <h3 className={`font-serif font-semibold ${table.isFinal ? "text-primary text-lg" : "text-foreground"}`}>
              {table.name}
            </h3>
            {table.winnerId && (
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                Ganador definido
              </span>
            )}
          </div>

          <div className="space-y-2">
            {table.teams.map((team) => (
              <button
                key={team.id}
                onClick={() => isEditable && onWinnerSelect(table.id, team.id)}
                disabled={!isEditable}
                className={`w-full flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all ${
                  table.winnerId === team.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground hover:border-primary/40"
                } ${!isEditable ? "cursor-not-allowed opacity-70" : ""}`}
              >
                <span className="font-medium">{team.name}</span>
                {table.winnerId === team.id && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {!isEditable && !table.winnerId && (
            <p className="mt-3 text-sm text-muted-foreground">Sin ganador definido</p>
          )}
        </div>
      ))}
    </div>
  )
}
