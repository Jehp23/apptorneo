const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  const tournament = await prisma.tournament.create({
    data: {
      name: "Torneo Interno 2025",
      location: "Sanatorio El Carmen",
      year: 2025,
      status: "active",
    },
  })

  const discipline = await prisma.discipline.create({
    data: {
      name: "Futbol 5",
      slug: "futbol-5",
      format: "Grupos + Eliminatorias",
      teamsCount: 6,
      playersCount: 30,
      details: "Fase de grupos con dos grupos de tres equipos, luego semifinales y final.",
      tournamentId: tournament.id,
      teams: {
        create: [
          {
            name: "Los Cirujanos",
            type: "TEAM",
            group: "A",
            players: {
              create: [
                { name: "Carlos García", seniority: 12 },
                { name: "Juan Pérez", seniority: 8 },
                { name: "Miguel Torres", seniority: 5 },
                { name: "Diego López", seniority: 3 },
                { name: "Andrés Martín", seniority: 7 },
                { name: "Pablo Ruiz", seniority: 2 },
              ],
            },
          },
          {
            name: "Enfermería FC",
            type: "TEAM",
            group: "A",
            players: {
              create: [
                { name: "Roberto Silva", seniority: 10 },
                { name: "Fernando Díaz", seniority: 6 },
                { name: "Alejandro Gómez", seniority: 4 },
                { name: "Lucas Fernández", seniority: 9 },
                { name: "Matías Rodríguez", seniority: 1 },
                { name: "Sebastián Castro", seniority: 11 },
              ],
            },
          },
          {
            name: "Administración United",
            type: "TEAM",
            group: "A",
            players: {
              create: [
                { name: "Ricardo Morales", seniority: 15 },
                { name: "Javier Herrera", seniority: 7 },
                { name: "Nicolás Vargas", seniority: 3 },
                { name: "Eduardo Ramírez", seniority: 5 },
                { name: "Gustavo Medina", seniority: 8 },
                { name: "Mauricio Flores", seniority: 2 },
              ],
            },
          },
          {
            name: "Urgencias FC",
            type: "TEAM",
            group: "B",
            players: {
              create: [
                { name: "Cristian Vega", seniority: 6 },
                { name: "Sergio Ortiz", seniority: 4 },
                { name: "Daniel Soto", seniority: 9 },
                { name: "Adrián Navarro", seniority: 2 },
                { name: "Emilio Ríos", seniority: 7 },
                { name: "Gonzalo Mendoza", seniority: 5 },
              ],
            },
          },
          {
            name: "Laboratorio Stars",
            type: "TEAM",
            group: "B",
            players: {
              create: [
                { name: "Tomás Guerrero", seniority: 11 },
                { name: "Ramiro Campos", seniority: 3 },
                { name: "Ignacio Reyes", seniority: 8 },
                { name: "Francisco Molina", seniority: 6 },
                { name: "Bruno Delgado", seniority: 4 },
                { name: "Martín Aguilar", seniority: 1 },
              ],
            },
          },
          {
            name: "Farmacia Athletic",
            type: "TEAM",
            group: "B",
            players: {
              create: [
                { name: "Héctor Sandoval", seniority: 9 },
                { name: "Raúl Cabrera", seniority: 5 },
                { name: "Óscar Paredes", seniority: 7 },
                { name: "Julio Espinoza", seniority: 2 },
                { name: "Alberto Cruz", seniority: 10 },
                { name: "Leandro Peña", seniority: 4 },
              ],
            },
          },
        ],
      },
    },
  })

  const teams = await prisma.team.findMany({
    where: { disciplineId: discipline.id },
  })

  const idByName = teams.reduce((acc, team) => {
    acc[team.name] = team.id
    return acc
  }, {})

  await prisma.match.createMany({
    data: [
      { disciplineId: discipline.id, team1Id: idByName["Los Cirujanos"], team2Id: idByName["Enfermería FC"], score1: 3, score2: 1, played: true },
      { disciplineId: discipline.id, team1Id: idByName["Enfermería FC"], team2Id: idByName["Administración United"], score1: 2, score2: 2, played: true },
      { disciplineId: discipline.id, team1Id: idByName["Los Cirujanos"], team2Id: idByName["Administración United"], played: false },
      { disciplineId: discipline.id, team1Id: idByName["Urgencias FC"], team2Id: idByName["Laboratorio Stars"], score1: 0, score2: 2, played: true },
      { disciplineId: discipline.id, team1Id: idByName["Laboratorio Stars"], team2Id: idByName["Farmacia Athletic"], played: false },
      { disciplineId: discipline.id, team1Id: idByName["Urgencias FC"], team2Id: idByName["Farmacia Athletic"], played: false },
    ],
    skipDuplicates: true,
  })

  console.log("Seed completado: torneo y disciplina Futbol 5 creados.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
