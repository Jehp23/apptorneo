// examples/api-usage.ts
// Ejemplos de cómo consumir los endpoints desde React

// ============================================
// OBTENER DATOS DE LECTURA (Públicos)
// ============================================

// Traer una disciplina con todos sus datos
export async function getDiscipline(slug: string) {
  const res = await fetch(`/api/disciplines/${slug}`)
  if (!res.ok) throw new Error("Disciplina no encontrada")
  return res.json()
}

// Traer todos los partidos de una disciplina
export async function getDisciplineMatches(slug: string) {
  const res = await fetch(`/api/disciplines/${slug}/matches`)
  if (!res.ok) throw new Error("No se pudieron cargar los partidos")
  return res.json()
}

// Traer todos los torneos
export async function getTournaments() {
  const res = await fetch("/api/tournaments")
  if (!res.ok) throw new Error("No se pudieron cargar los torneos")
  return res.json()
}

// ============================================
// ACTUALIZAR RESULTADOS (Admin)
// ============================================

// Actualizar un partido
export async function updateMatch(
  matchId: string,
  data: {
    score1?: number
    score2?: number
    played?: boolean
    date?: string
  }
) {
  const res = await fetch(`/api/admin/matches/${matchId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("No se pudo actualizar el partido")
  return res.json()
}

// Ejemplo de uso en un componente:
// function AdminMatchCard({ match }) {
//   const handleUpdateScore = async () => {
//     await updateMatch(match.id, {
//       score1: 3,
//       score2: 1,
//       played: true,
//     })
//     // Revalidar datos
//     window.location.reload()
//   }
//
//   return <button onClick={handleUpdateScore}>Guardar Resultado</button>
// }

// ============================================
// CREAR EQUIPOS Y JUGADORES (Admin)
// ============================================

// Crear un equipo con jugadores en una disciplina
export async function createTeam(
  disciplineSlug: string,
  data: {
    name: string
    type?: "TEAM" | "PAIR" | "SINGLE"
    group?: string
    players?: Array<{
      name: string
      seniority?: number
    }>
  }
) {
  const res = await fetch(`/api/admin/disciplines/${disciplineSlug}/teams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("No se pudo crear el equipo")
  return res.json()
}

// Ejemplo:
// const newTeam = await createTeam("futbol-5", {
//   name: "Los Cirujanos",
//   group: "A",
//   players: [
//     { name: "Carlos García", seniority: 12 },
//     { name: "Juan Pérez", seniority: 8 },
//   ]
// })

// ============================================
// CREAR TORNEOS (Admin)
// ============================================

// Crear un torneo con disciplinas
export async function createTournament(data: {
  name: string
  location: string
  year?: number
  disciplines?: Array<{
    name: string
    slug: string
    format?: string
    teamsCount?: number
    playersCount?: number
  }>
}) {
  const res = await fetch("/api/tournaments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("No se pudo crear el torneo")
  return res.json()
}

// ============================================
// USAR EN COMPONENTES REACT
// ============================================

// Ejemplo completo con useEffect:
// import { useEffect, useState } from "react"
//
// export function DisciplineView({ slug }: { slug: string }) {
//   const [discipline, setDiscipline] = useState(null)
//   const [loading, setLoading] = useState(true)
//
//   useEffect(() => {
//     getDiscipline(slug)
//       .then(setDiscipline)
//       .catch(console.error)
//       .finally(() => setLoading(false))
//   }, [slug])
//
//   if (loading) return <div>Cargando...</div>
//   if (!discipline) return <div>No encontrado</div>
//
//   return (
//     <div>
//       <h1>{discipline.name}</h1>
//       <p>{discipline.teams.length} equipos</p>
//       {/* Renderizar datos */}
//     </div>
//   )
// }
