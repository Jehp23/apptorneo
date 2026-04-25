import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Crear torneo si no existe
  const tournament = await prisma.tournament.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "Torneo Sanatorio El Carmen",
      location: "Predio GYT",
      year: 2026,
      status: "active",
    },
  })

  console.log("Torneo creado/actualizado:", tournament)

  // Crear disciplinas
  const disciplines = [
    {
      name: "Fútbol 5",
      slug: "futbol-5",
      format: "6 equipos de 6 personas, 2 zonas de 3, fase eliminatoria",
      teamsCount: 6,
      playersCount: 36,
      details: "Fase de grupos: 2 zonas de 3 equipos. Los 2 primeros de cada zona clasifican a semifinales. Criterio: 3 puntos victoria, 1 empate, 0 derrota. Desempate: duelo directo, diferencia de goles, goles a favor, antigüedad.",
    },
    {
      name: "Pádel",
      slug: "padel",
      format: "12 jugadores (10M + 2F), 2 zonas de 3 equipos",
      teamsCount: 6,
      playersCount: 12,
      details: "Fase preliminar: 2 zonas de 3 equipos, clasifican 2 mejores de cada zona. Fase eliminatoria: semifinales y final. Criterio: 1 punto victoria, diferencia de games.",
    },
    {
      name: "Loba",
      slug: "loba",
      format: "40 participantes, 6 mesas (4 de 7, 2 de 6)",
      teamsCount: 40,
      playersCount: 40,
      details: "Se juega al que menos punto tiene. 100 puntos sigue jugando, 101 puntos afuera. Ganadores de cada mesa a definición por campeón. Perdedores a mesas de consuelo.",
    },
    {
      name: "Truco",
      slug: "truco",
      format: "16 personas, 2 zonas de 4 parejas",
      teamsCount: 8,
      playersCount: 16,
      details: "2 zonas de 4 parejas, todos contra todos. Clasifican 2 primeros de cada zona a semifinales. A 30 puntos (15 malas - 15 buenas). Sin flor.",
    },
    {
      name: "Metegol",
      slug: "metegol",
      format: "36 participantes, 6 zonas de 3 equipos",
      teamsCount: 36,
      playersCount: 36,
      details: "6 zonas de 3 equipos. Mejores de cada zona a hexagonal final. Mejor de 3 partidos a 7 goles. Prohibido remolino.",
    },
    {
      name: "Sapo",
      slug: "sapo",
      format: "32 personas (16 parejas)",
      teamsCount: 16,
      playersCount: 32,
      details: "Fase preeliminar: 2 rondas por pareja, 8 mejores parejas clasifican. Fase eliminatoria: mata-mata desde 4tos. Desempate: 5 tiros.",
    },
  ]

  for (const disc of disciplines) {
    await prisma.discipline.upsert({
      where: { slug: disc.slug },
      update: {
        name: disc.name,
        format: disc.format,
        teamsCount: disc.teamsCount,
        playersCount: disc.playersCount,
        details: disc.details,
      },
      create: {
        ...disc,
        tournamentId: tournament.id,
      },
    })
    console.log(`Disciplina creada/actualizada: ${disc.name}`)
  }

  // Crear equipos de Fútbol 5
  const futbolTeams = [
    {
      name: "Los Guardianes del Carmen",
      group: "Zona 1",
      players: [
        "Alejandro Abdala",
        "Bruno del Campo",
        "Claudio Vasquez",
        "Luis Miguel Chungara",
        "Rodrigo Morelli",
        "Nicolás Igarzabal",
      ],
    },
    {
      name: "El Sana",
      group: "Zona 1",
      players: [
        "Ariel Quipildor",
        "Dario Ortiz",
        "Sebastián Ruiz",
        "Hernán Barboza",
        "Néstor Román Barrionuevo",
        "Carlos Cesar Diaz",
      ],
    },
    {
      name: "Sportivo El Carmen",
      group: "Zona 2",
      players: [
        "Chemin Benjamin",
        "Lopez Franco",
        "Diego Robles",
        "Julián González",
        "Daniel Villalba",
        "Miguel Ríos",
        "Ezequiel Gaston Yapura",
      ],
    },
    {
      name: "El Ganador",
      group: "Zona 2",
      players: [
        "Dardo Horacio Castro",
        "Carlos Alberto Quintero",
        "Facundo Nicolas Medina",
        "Jurado Jonathan",
        "Marcelo Fuenzalida",
        "Luis María Alvarez",
      ],
    },
    {
      name: "La Cruz Verde",
      group: "Zona 1",
      players: [
        "Fernando Torres Riquelme",
        "Jose Antonio Lopez",
        "Nicolás Martinez",
        "Pablo Rafael Bautista",
        "Rubn Yapura",
        "Bernardo Lajad",
      ],
    },
    {
      name: "Código Rojo",
      group: "Zona 2",
      players: [
        "Jose Humberto Lopez",
        "Franco Alejandro Diaz",
        "Vale Diego",
        "Jurge Damian Espinillo",
        "Sebastián Vale",
        "Ariel Gomez",
      ],
    },
  ]

  const futbolDiscipline = await prisma.discipline.findUnique({
    where: { slug: "futbol-5" },
  })

  if (futbolDiscipline) {
    for (const teamData of futbolTeams) {
      const team = await prisma.team.upsert({
        where: { id: `${futbolDiscipline.slug}-${teamData.name.toLowerCase().replace(/\s+/g, "-")}` },
        update: {},
        create: {
          id: `${futbolDiscipline.slug}-${teamData.name.toLowerCase().replace(/\s+/g, "-")}`,
          name: teamData.name,
          type: "TEAM",
          group: teamData.group,
          disciplineId: futbolDiscipline.id,
        },
      })

      for (const playerName of teamData.players) {
        await prisma.player.upsert({
          where: { id: `${team.id}-${playerName.toLowerCase().replace(/\s+/g, "-")}` },
          update: {},
          create: {
            id: `${team.id}-${playerName.toLowerCase().replace(/\s+/g, "-")}`,
            name: playerName,
            teamId: team.id,
          },
        })
      }
      console.log(`Equipo creado: ${team.name}`)
    }
  }

  // Crear parejas de Pádel
  const padelPairs = [
    {
      name: "Código Rojo",
      players: ["Alejandro Abdala", "Ingrid Paola Moya"],
    },
    {
      name: "Sportivo El Carmen",
      players: ["Chemin Benjamin", "Nicolás Igarzabal"],
    },
    {
      name: "Los Guardianes del Carmen",
      players: ["Dardo Horacio Castro", "Valeria Luciana Romero"],
    },
    {
      name: "Cruz Verde",
      players: ["Facundo Nicolas Medina", "Bernardo Lajad"],
    },
    {
      name: "El Ganador",
      players: ["Julián González", "Sebastián Vale"],
    },
    {
      name: "El Sana",
      players: ["Luis Miguel Chungara", "Juan Carlos Rivero"],
    },
  ]

  const padelDiscipline = await prisma.discipline.findUnique({
    where: { slug: "padel" },
  })

  if (padelDiscipline) {
    for (const pairData of padelPairs) {
      const team = await prisma.team.upsert({
        where: { id: `${padelDiscipline.slug}-${pairData.name.toLowerCase().replace(/\s+/g, "-")}` },
        update: {},
        create: {
          id: `${padelDiscipline.slug}-${pairData.name.toLowerCase().replace(/\s+/g, "-")}`,
          name: pairData.name,
          type: "PAIR",
          group: "Zona 1",
          disciplineId: padelDiscipline.id,
        },
      })

      for (const playerName of pairData.players) {
        await prisma.player.upsert({
          where: { id: `${team.id}-${playerName.toLowerCase().replace(/\s+/g, "-")}` },
          update: {},
          create: {
            id: `${team.id}-${playerName.toLowerCase().replace(/\s+/g, "-")}`,
            name: playerName,
            teamId: team.id,
          },
        })
      }
      console.log(`Pareja creada: ${team.name}`)
    }
  }

  console.log("Datos cargados exitosamente")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
