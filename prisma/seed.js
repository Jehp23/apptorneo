const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  console.log("🧹  Limpiando datos existentes...")

  await prisma.match.deleteMany()
  await prisma.player.deleteMany()
  await prisma.team.deleteMany()
  await prisma.discipline.deleteMany()
  await prisma.tournament.deleteMany()

  console.log("🏆  Creando torneo...")

  const torneo = await prisma.tournament.create({
    data: {
      name: "Torneo Interno El Carmen 2025",
      location: "Predio GYT",
      year: 2025,
      status: "active",
    },
  })

  // ─── FÚTBOL 5 ──────────────────────────────────────────────────────────────

  console.log("⚽  Cargando Fútbol 5...")

  const futbol = await prisma.discipline.create({
    data: {
      tournamentId: torneo.id,
      name:         "Fútbol 5",
      slug:         "futbol-5",
      format:       "2 zonas de 3 equipos · Top 2 clasifica a semifinales",
      teamsCount:   6,
      playersCount: 36,
      details:      "2 tiempos de 20 min + 10 min descanso.\nVictoria 3pts · Empate 1pt · Derrota 0.\nDesempate: duelo directo → diferencia de goles → goles a favor → goles en contra → antigüedad → sorteo.\n2 canchas (Predio GYT).",
    },
  })

  // Zona A
  const guardianes = await prisma.team.create({
    data: {
      disciplineId: futbol.id, name: "Los Guardianes del Carmen",
      type: "TEAM", group: "A",
      players: { create: [
        { name: "Alejandro Abdala" },
        { name: "Bruno del Campo" },
        { name: "Claudio Vasquez" },
        { name: "Luis Miguel Chungara" },
        { name: "Rodrigo Morelli" },
        { name: "Nicolás Igarzabal" },
      ]},
    },
  })

  const sportivo = await prisma.team.create({
    data: {
      disciplineId: futbol.id, name: "Sportivo El Carmen",
      type: "TEAM", group: "A",
      players: { create: [
        { name: "Chemin Benjamin" },
        { name: "Lopez Franco" },
        { name: "Diego Robles" },
        { name: "Julián González" },
        { name: "Daniel Villalba" },
        { name: "Miguel Ríos" },
        { name: "Ezequiel Gaston Yapura" },
      ]},
    },
  })

  const cruzVerde = await prisma.team.create({
    data: {
      disciplineId: futbol.id, name: "La Cruz Verde",
      type: "TEAM", group: "A",
      players: { create: [
        { name: "Fernando Torres Riquelme" },
        { name: "Jose Antonio Lopez" },
        { name: "Nicolás Martinez" },
        { name: "Pablo Rafael Bautista" },
        { name: "Ruben Yapura" },
        { name: "Bernardo Lajad" },
      ]},
    },
  })

  // Zona B
  const elSana = await prisma.team.create({
    data: {
      disciplineId: futbol.id, name: "El Sana",
      type: "TEAM", group: "B",
      players: { create: [
        { name: "Ariel Quipildor" },
        { name: "Dario Ortiz" },
        { name: "Sebastián Ruiz" },
        { name: "Hernán Barboza" },
        { name: "Néstor Román Barrionuevo" },
        { name: "Carlos Cesar Diaz" },
      ]},
    },
  })

  const elGanador = await prisma.team.create({
    data: {
      disciplineId: futbol.id, name: "El Ganador",
      type: "TEAM", group: "B",
      players: { create: [
        { name: "Dardo Horacio Castro" },
        { name: "Carlos Alberto Quintero" },
        { name: "Facundo Nicolas Medina" },
        { name: "Jurado Jonathan" },
        { name: "Marcelo Fuenzalida" },
        { name: "Luis María Alvarez" },
      ]},
    },
  })

  const codigoRojo = await prisma.team.create({
    data: {
      disciplineId: futbol.id, name: "Código Rojo",
      type: "TEAM", group: "B",
      players: { create: [
        { name: "Jose Humberto Lopez" },
        { name: "Franco Alejandro Diaz" },
        { name: "Vale Diego" },
        { name: "Jorge Damian Espinillo" },
        { name: "Sebastián Vale" },
        { name: "Ariel Gomez" },
      ]},
    },
  })

  // Fixture Zona A: A1 vs A2, A2 vs A3, A1 vs A3
  // Fixture Zona B: B1 vs B2, B2 vs B3, B1 vs B3
  await prisma.match.createMany({
    data: [
      { disciplineId: futbol.id, team1Id: guardianes.id, team2Id: sportivo.id,  stage: "Zona A · Turno 1", played: false },
      { disciplineId: futbol.id, team1Id: elSana.id,     team2Id: elGanador.id, stage: "Zona B · Turno 1", played: false },
      { disciplineId: futbol.id, team1Id: sportivo.id,   team2Id: cruzVerde.id, stage: "Zona A · Turno 2", played: false },
      { disciplineId: futbol.id, team1Id: elGanador.id,  team2Id: codigoRojo.id,stage: "Zona B · Turno 2", played: false },
      { disciplineId: futbol.id, team1Id: guardianes.id, team2Id: cruzVerde.id, stage: "Zona A · Turno 3", played: false },
      { disciplineId: futbol.id, team1Id: elSana.id,     team2Id: codigoRojo.id,stage: "Zona B · Turno 3", played: false },
    ],
  })

  // ─── PÁDEL ─────────────────────────────────────────────────────────────────

  console.log("🎾  Cargando Pádel...")

  const padel = await prisma.discipline.create({
    data: {
      tournamentId: torneo.id,
      name:         "Pádel",
      slug:         "padel",
      format:       "2 zonas de 3 parejas · Top 2 clasifica a semifinales",
      teamsCount:   6,
      playersCount: 12,
      details:      "Partidos a 3 Games (4 puntos) + Tie-break si necesario. Punto de oro en igualdad.\nVictoria 1pt + diferencia de games.\nDesempate: duelo directo → antigüedad → sorteo.\n2 canchas (Predio GYT).",
    },
  })

  // Zona A
  const codigoRojoPadel = await prisma.team.create({
    data: {
      disciplineId: padel.id, name: "Abdala / Moya",
      type: "PAIR", group: "A",
      players: { create: [
        { name: "Alejandro Abdala" },
        { name: "Ingrid Paola Moya" },
      ]},
    },
  })

  const guardianesPadel = await prisma.team.create({
    data: {
      disciplineId: padel.id, name: "Castro / Romero",
      type: "PAIR", group: "A",
      players: { create: [
        { name: "Dardo Horacio Castro" },
        { name: "Valeria Luciana Romero" },
      ]},
    },
  })

  const ganadorPadel = await prisma.team.create({
    data: {
      disciplineId: padel.id, name: "González / Vale",
      type: "PAIR", group: "A",
      players: { create: [
        { name: "Julián González" },
        { name: "Sebastián Vale" },
      ]},
    },
  })

  // Zona B
  const sportivoPadel = await prisma.team.create({
    data: {
      disciplineId: padel.id, name: "Chemin / Igarzabal",
      type: "PAIR", group: "B",
      players: { create: [
        { name: "Chemin Benjamin" },
        { name: "Nicolás Igarzabal" },
      ]},
    },
  })

  const cruzVerdePadel = await prisma.team.create({
    data: {
      disciplineId: padel.id, name: "Medina / Lajad",
      type: "PAIR", group: "B",
      players: { create: [
        { name: "Facundo Nicolas Medina" },
        { name: "Bernardo Lajad" },
      ]},
    },
  })

  const sanaPadel = await prisma.team.create({
    data: {
      disciplineId: padel.id, name: "Chungara / Rivero",
      type: "PAIR", group: "B",
      players: { create: [
        { name: "Luis Miguel Chungara" },
        { name: "Juan Carlos Rivero" },
      ]},
    },
  })

  // Fixture: A1 vs A2, A3 vs A2, A1 vs A3 / B1 vs B2, B3 vs B2, B1 vs B3
  await prisma.match.createMany({
    data: [
      { disciplineId: padel.id, team1Id: codigoRojoPadel.id,  team2Id: guardianesPadel.id,  stage: "Zona A · Turno 1", played: false },
      { disciplineId: padel.id, team1Id: sportivoPadel.id,    team2Id: cruzVerdePadel.id,   stage: "Zona B · Turno 1", played: false },
      { disciplineId: padel.id, team1Id: ganadorPadel.id,     team2Id: guardianesPadel.id,  stage: "Zona A · Turno 2", played: false },
      { disciplineId: padel.id, team1Id: sanaPadel.id,        team2Id: cruzVerdePadel.id,   stage: "Zona B · Turno 2", played: false },
      { disciplineId: padel.id, team1Id: codigoRojoPadel.id,  team2Id: ganadorPadel.id,     stage: "Zona A · Turno 3", played: false },
      { disciplineId: padel.id, team1Id: sportivoPadel.id,    team2Id: sanaPadel.id,        stage: "Zona B · Turno 3", played: false },
    ],
  })

  // ─── LOBA ──────────────────────────────────────────────────────────────────

  console.log("🃏  Cargando Loba...")

  await prisma.discipline.create({
    data: {
      tournamentId: torneo.id,
      name:         "Loba",
      slug:         "loba",
      format:       "6 mesas (4×6 + 2×7) · Ganadores a mesa final",
      teamsCount:   38,
      playersCount: 38,
      details:      "38 participantes.\nSe juega al que menos puntos acumule. 100 puntos = seguís jugando, 101 = afuera.\nSorteo para asignación de mesas.\nGanadores de cada mesa pasan a mesa final (6 jugadores).\nLos 32 perdedores: 5 mesas (4×6 + 2×7), ganadores reciben medalla plateada.\nGanador de mesa final: trofeo. Perdedores: medalla de oro.",
    },
  })

  // ─── TRUCO ─────────────────────────────────────────────────────────────────

  console.log("🃏  Cargando Truco...")

  await prisma.discipline.create({
    data: {
      tournamentId: torneo.id,
      name:         "Truco",
      slug:         "truco",
      format:       "2 zonas de 4 parejas · todos contra todos · Top 2 a semifinales",
      teamsCount:   8,
      playersCount: 16,
      details:      "16 personas · 8 parejas.\n2 zonas de 4 parejas, todos contra todos.\nTop 2 de cada zona a semifinales.\nPartidos a 30 puntos (15 malas + 15 buenas). Sin flor.\nVictoria 1pt · Derrota 0.\nDesempate: duelo directo → diferencia de puntos → antigüedad → sorteo.\n4 mesas.",
    },
  })

  // ─── METEGOL ───────────────────────────────────────────────────────────────

  console.log("🏓  Cargando Metegol...")

  await prisma.discipline.create({
    data: {
      tournamentId: torneo.id,
      name:         "Metegol",
      slug:         "metegol",
      format:       "6 zonas de 3 parejas · Ganadores a hexagonal final",
      teamsCount:   18,
      playersCount: 36,
      details:      "36 participantes · 18 parejas.\n6 zonas de 3 parejas, todos contra todos.\nGanador de cada zona pasa a hexagonal final (todos contra todos).\nPartidos: mejor de 3 sets a 7 goles.\nVictoria 1pt + diferencia de sets.\nDesempate: duelo directo → antigüedad → sorteo.\n2 metegoles. Prohibido el remolino.",
    },
  })

  // ─── SAPO ──────────────────────────────────────────────────────────────────

  console.log("🐸  Cargando Sapo...")

  await prisma.discipline.create({
    data: {
      tournamentId: torneo.id,
      name:         "Sapo",
      slug:         "sapo",
      format:       "15 parejas · 2 rondas clasificatorias · Top 8 a eliminatoria",
      teamsCount:   15,
      playersCount: 30,
      details:      "30 personas · 15 parejas.\nFase clasificatoria: 2 rondas por pareja. Las 8 parejas con mayor puntaje acumulado pasan.\nFase eliminatoria: mata-mata desde 4tos de final (1 ronda por cruce).\nDesempate: 1 representante por equipo · 5 tiros de desempate.\n2 saperas.",
    },
  })

  console.log("✅  Seed completado.")
  console.log(`   Torneo: ${torneo.name}`)
  console.log("   Disciplinas: Fútbol 5, Pádel, Loba, Truco, Metegol, Sapo")
  console.log("   Equipos cargados: 6 (fútbol) + 6 (pádel)")
  console.log("   Fixture cargado: 6 partidos (fútbol) + 6 partidos (pádel)")
}

main()
  .catch((error) => {
    console.error("❌  Error:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
