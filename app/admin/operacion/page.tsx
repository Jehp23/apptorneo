import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { OperacionWorkbench } from "@/components/admin/operacion-workbench"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"

export default async function OperacionPage() {
  const tournament = await prisma.tournament.findFirst({
    where: { status: "active" },
    include: {
      disciplines: {
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
        orderBy: { name: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  if (!tournament) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="space-y-4 text-center">
          <p className="text-2xl text-muted-foreground">No hay ningún torneo activo.</p>
          <p className="text-base text-muted-foreground">
            Creá uno desde el panel y poné su estado en &quot;Activo&quot;.
          </p>
          <Button asChild>
            <Link href="/admin">Volver al panel</Link>
          </Button>
        </div>
      </div>
    )
  }

  const disciplines = tournament.disciplines.map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    teamsCount: d.teamsCount,
    format: d.format,
    teams: d.teams,
    matches: d.matches.map((m) => ({
      id: m.id,
      score1: m.score1,
      score2: m.score2,
      played: m.played,
      stage: m.stage,
      team1: m.team1,
      team2: m.team2,
    })),
  }))

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Modo operación · día del torneo</p>
            <h1 className="text-3xl font-bold text-foreground">{tournament.name}</h1>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Panel
            </Link>
          </Button>
        </header>

        {disciplines.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border p-10 text-center">
            <p className="text-xl text-muted-foreground">
              Este torneo no tiene disciplinas todavía.
            </p>
            <p className="mt-2 text-base text-muted-foreground">
              Agregalas desde el panel de administración.
            </p>
          </div>
        ) : (
          <OperacionWorkbench disciplines={disciplines} />
        )}
      </div>
    </div>
  )
}
