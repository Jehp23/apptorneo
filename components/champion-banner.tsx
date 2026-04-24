"use client"

import { Trophy } from "lucide-react"

interface ChampionBannerProps {
  disciplineName: string
  championName: string
  score1: number
  score2: number
  runnerUpName: string
}

export function ChampionBanner({ disciplineName, championName, score1, score2, runnerUpName }: ChampionBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 p-5 shadow-sm">
      {/* Accent top bar */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-300/0 via-amber-400 to-amber-300/0" />

      <div className="flex items-start gap-4">
        <div className="shrink-0 rounded-xl bg-amber-400/20 p-3">
          <Trophy className="h-6 w-6 text-amber-600" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
            {disciplineName} · Campeón
          </p>
          <p className="text-xl font-black text-amber-900 leading-tight">{championName}</p>
          <p className="mt-1 text-sm text-amber-700/70">
            Final: <span className="font-semibold">{score1} – {score2}</span> vs {runnerUpName}
          </p>
        </div>
      </div>
    </div>
  )
}
