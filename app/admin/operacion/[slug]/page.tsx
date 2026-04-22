import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

import { DisciplineOperacion } from "@/components/admin/discipline-operacion"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"

export default async function DisciplineOperacionPage({
  params,
}: {
  params: { slug: string }
}) {
  const discipline = await prisma.discipline.findUnique({
    where: { slug: params.slug },
    include: {
      teams: {
        include: { players: true },
        orderBy: { createdAt: "asc" },
      },
      matches: {
        include: {
          team1: { select: { id: true, name: true } },
          team2: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!discipline) notFound()

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-8">
      <div className="mx-auto max-w-lg space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">{discipline.name}</h1>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/operacion" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Atrás
            </Link>
          </Button>
        </div>

        <DisciplineOperacion
          disciplineSlug={discipline.slug}
          teamsCount={discipline.teamsCount}
          initialTeams={discipline.teams.map((t) => ({
            id: t.id,
            name: t.name,
            players: t.players.map((p) => ({ id: p.id, name: p.name })),
          }))}
          initialMatches={discipline.matches.map((m) => ({
            id: m.id,
            score1: m.score1,
            score2: m.score2,
            played: m.played,
            stage: m.stage,
            team1: m.team1,
            team2: m.team2,
          }))}
        />
      </div>
    </div>
  )
}
