import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"

export default async function OperacionPage() {
  const tournament = await prisma.tournament.findFirst({
    where: { status: "active" },
    include: {
      disciplines: { orderBy: { name: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  })

  if (!tournament) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="space-y-4 text-center">
          <p className="text-xl text-muted-foreground">Sin torneo activo.</p>
          <Button asChild variant="outline">
            <Link href="/admin">← Panel</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-8">
      <div className="mx-auto max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">{tournament.name}</h1>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Panel
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          {tournament.disciplines.map((discipline) => (
            <Link
              key={discipline.id}
              href={`/admin/operacion/${discipline.slug}`}
              className="flex items-center justify-between rounded-3xl border-2 border-border bg-card px-6 py-5 transition-colors hover:border-primary hover:bg-primary/5"
            >
              <span className="text-2xl font-bold text-foreground">{discipline.name}</span>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
