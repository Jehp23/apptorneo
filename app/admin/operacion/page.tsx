import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"

export default async function OperacionPage() {
  const tournament = await prisma.tournament.findFirst({
    where: { status: "active" },
    include: {
      disciplines: {
        include: {
          _count: { select: { teams: true, matches: true } },
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

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Modo operación</p>
            <h1 className="text-3xl font-bold text-foreground">{tournament.name}</h1>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Panel
            </Link>
          </Button>
        </header>

        <p className="text-lg text-muted-foreground">Elegí un deporte para administrarlo:</p>

        {tournament.disciplines.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border p-10 text-center">
            <p className="text-xl text-muted-foreground">Este torneo no tiene disciplinas todavía.</p>
            <p className="mt-2 text-base text-muted-foreground">
              Agregalas desde el panel de administración.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tournament.disciplines.map((discipline) => (
              <Link
                key={discipline.id}
                href={`/admin/operacion/${discipline.slug}`}
                className="flex items-center justify-between rounded-3xl border-2 border-border bg-card p-6 transition-colors hover:border-primary hover:bg-primary/5"
              >
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{discipline.name}</h2>
                  <p className="mt-1 text-base text-muted-foreground">
                    {discipline._count.teams} inscritos · {discipline._count.matches} partidos
                  </p>
                </div>
                <ChevronRight className="h-6 w-6 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
