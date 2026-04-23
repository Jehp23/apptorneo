import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { isValidAdminToken } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { AdminHomeView } from "@/components/admin/admin-home-view"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_session")?.value
  if (!isValidAdminToken(token)) redirect("/admin/login")

  const tournament = await prisma.tournament.findFirst({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  })

  const disciplines = tournament
    ? await prisma.discipline.findMany({
        where: { tournamentId: tournament.id },
        include: {
          teams: { include: { players: { select: { id: true } } } },
          matches: { select: { id: true, played: true } },
        },
        orderBy: { createdAt: "asc" },
      })
    : []

  return (
    <AdminHomeView
      tournament={tournament}
      initialDisciplines={disciplines.map((d) => ({
        id:           d.id,
        name:         d.name,
        slug:         d.slug,
        format:       d.format,
        tournamentId: d.tournamentId,
        teams:        d.teams.map((t) => ({ id: t.id, players: t.players })),
        matches:      d.matches,
      }))}
    />
  )
}
