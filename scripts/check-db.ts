import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Verificando base de datos...")
  
  const tournament = await prisma.tournament.findFirst()
  console.log("Torneo:", tournament?.name || "No encontrado")
  
  const disciplines = await prisma.discipline.findMany({
    include: {
      teams: true,
    },
  })
  console.log(`Disciplinas: ${disciplines.length}`)
  disciplines.forEach(d => console.log(`  - ${d.name}: ${d.teams.length} equipos`))
  
  const teams = await prisma.team.findMany()
  console.log(`Total equipos: ${teams.length}`)
  
  const players = await prisma.player.findMany()
  console.log(`Total jugadores: ${players.length}`)
  
  const matches = await prisma.match.findMany()
  console.log(`Total partidos: ${matches.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
