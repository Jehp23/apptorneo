"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"

interface Scorer { name: string; goals: number }

interface ScorersTableProps {
  slug: string
  isAdmin?: boolean
}

export function ScorersTable({ slug, isAdmin = false }: ScorersTableProps) {
  const [scorers, setScorers] = useState<Scorer[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [newGoals, setNewGoals] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/disciplines/${slug}/scorers`)
      .then(r => r.json())
      .then(d => { setScorers(d.scorers ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  async function save(updated: Scorer[]) {
    setSaving(true)
    const res = await fetch(`/api/admin/disciplines/${slug}/scorers`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scorers: updated }),
    })
    if (res.ok) setScorers(updated)
    setSaving(false)
  }

  function handleAdd() {
    const name = newName.trim()
    const goals = parseInt(newGoals, 10)
    if (!name || isNaN(goals) || goals < 0) return
    const updated = [...scorers, { name, goals }].sort((a, b) => b.goals - a.goals)
    save(updated)
    setNewName("")
    setNewGoals("")
  }

  function handleDelete(index: number) {
    save(scorers.filter((_, i) => i !== index))
  }

  function handleGoalsChange(index: number, goals: number) {
    const updated = scorers.map((s, i) => i === index ? { ...s, goals } : s).sort((a, b) => b.goals - a.goals)
    save(updated)
  }

  if (loading) return null
  if (!isAdmin && scorers.length === 0) return null

  const sorted = [...scorers].sort((a, b) => b.goals - a.goals)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Goleadores</h3>
        {saving && <span className="text-xs text-muted-foreground">Guardando…</span>}
      </div>

      {sorted.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">Sin goleadores cargados.</p>
      ) : (
        <div className="divide-y divide-border/50">
          {sorted.map((scorer, i) => (
            <div key={i} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-4 py-2.5">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                i === 0 ? "bg-amber-400/20 text-amber-700" :
                i === 1 ? "bg-muted text-muted-foreground" :
                i === 2 ? "bg-orange-400/20 text-orange-700" :
                "text-muted-foreground"
              }`}>{i + 1}</span>
              <span className="text-sm font-medium text-foreground">{scorer.name}</span>
              {isAdmin ? (
                <input
                  type="number"
                  min={0}
                  value={scorer.goals}
                  onChange={(e) => handleGoalsChange(i, parseInt(e.target.value, 10))}
                  className="w-14 rounded-lg border border-border bg-background px-2 py-1 text-center text-sm font-mono font-bold outline-none focus:border-primary"
                />
              ) : (
                <span className="font-mono font-bold text-sm text-foreground">{scorer.goals}</span>
              )}
              {isAdmin ? (
                <button onClick={() => handleDelete(i)} className="text-muted-foreground/40 hover:text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <span className="text-xs text-muted-foreground">goles</span>
              )}
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="border-t border-border px-4 py-3">
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Nombre del jugador"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <input
              type="number"
              min={0}
              value={newGoals}
              onChange={(e) => setNewGoals(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Goles"
              className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary text-center"
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim() || !newGoals}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
