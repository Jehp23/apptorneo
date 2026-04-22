"use client"

import { useMemo, useState } from "react"
import { Calendar, Plus, Save, Shield, Swords, Trophy, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type TeamType = "TEAM" | "PAIR" | "SINGLE"

interface AdminPlayer {
  id: string
  name: string
  seniority?: number | null
}

interface AdminTeam {
  id: string
  name: string
  type: TeamType
  group?: string | null
  seed?: number | null
  players: AdminPlayer[]
}

interface AdminMatch {
  id: string
  score1?: number | null
  score2?: number | null
  played: boolean
  stage?: string | null
  date?: string | null
  team1?: { id: string; name: string } | null
  team2?: { id: string; name: string } | null
}

interface AdminDiscipline {
  id: string
  name: string
  slug: string
  format?: string | null
  details?: string | null
  playersCount?: number | null
  teamsCount?: number | null
  tournamentId: string
  tournamentName: string
  tournamentYear: number
  teams: AdminTeam[]
  matches: AdminMatch[]
}

interface AdminTournament {
  id: string
  name: string
  location: string
  year: number
  status: string
  disciplines: Array<{
    id: string
    name: string
    slug: string
  }>
}

interface AdminWorkbenchProps {
  initialTournaments: AdminTournament[]
  initialDisciplines: AdminDiscipline[]
}

function parsePlayersInput(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [namePart, seniorityPart] = line.split("|")
      const name = namePart?.trim()
      const seniorityValue = seniorityPart?.trim()
      return {
        name,
        seniority: seniorityValue ? Number(seniorityValue) : undefined,
      }
    })
    .filter((player) => player.name)
}

async function parseJson(response: Response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export function AdminWorkbench({ initialTournaments, initialDisciplines }: AdminWorkbenchProps) {
  const [tournaments, setTournaments] = useState(initialTournaments)
  const [disciplines, setDisciplines] = useState(initialDisciplines)
  const [activeTab, setActiveTab] = useState<"config" | "registrations" | "matches">("config")
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [submitting, setSubmitting] = useState<string | null>(null)

  const [tournamentForm, setTournamentForm] = useState({
    name: "",
    location: "",
    year: new Date().getFullYear().toString(),
    status: "active",
  })

  const defaultTournamentId = initialTournaments[0]?.id ?? ""
  const defaultDisciplineSlug = initialDisciplines[0]?.slug ?? ""

  const [disciplineForm, setDisciplineForm] = useState({
    tournamentId: defaultTournamentId,
    name: "",
    slug: "",
    format: "",
    teamsCount: "",
    playersCount: "",
    details: "",
  })

  const [registrationForm, setRegistrationForm] = useState({
    disciplineSlug: defaultDisciplineSlug,
    name: "",
    type: "TEAM" as TeamType,
    group: "",
    seed: "",
    players: "",
  })

  const [matchForm, setMatchForm] = useState({
    disciplineSlug: defaultDisciplineSlug,
    team1Id: "",
    team2Id: "",
    stage: "",
    date: "",
  })

  const selectedRegistrationDiscipline = useMemo(
    () => disciplines.find((discipline) => discipline.slug === registrationForm.disciplineSlug),
    [disciplines, registrationForm.disciplineSlug]
  )

  const selectedMatchDiscipline = useMemo(
    () => disciplines.find((discipline) => discipline.slug === matchForm.disciplineSlug),
    [disciplines, matchForm.disciplineSlug]
  )

  const sortedDisciplines = useMemo(
    () => [...disciplines].sort((a, b) => a.tournamentYear - b.tournamentYear || a.name.localeCompare(b.name)),
    [disciplines]
  )

  function showFeedback(type: "success" | "error", message: string) {
    setFeedback({ type, message })
  }

  function syncTournament(newTournament: AdminTournament) {
    setTournaments((current) => [newTournament, ...current])
  }

  function syncDiscipline(newDiscipline: AdminDiscipline) {
    setDisciplines((current) => [newDiscipline, ...current])
    setTournaments((current) =>
      current.map((tournament) =>
        tournament.id === newDiscipline.tournamentId
          ? {
              ...tournament,
              disciplines: [
                ...tournament.disciplines,
                { id: newDiscipline.id, name: newDiscipline.name, slug: newDiscipline.slug },
              ],
            }
          : tournament
      )
    )
  }

  async function handleCreateTournament(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting("tournament")
    setFeedback(null)

    const response = await fetch("/api/tournaments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: tournamentForm.name,
        location: tournamentForm.location,
        year: Number(tournamentForm.year),
        status: tournamentForm.status,
      }),
    })

    const data = await parseJson(response)

    if (!response.ok) {
      showFeedback("error", data?.error || "No se pudo crear el torneo.")
      setSubmitting(null)
      return
    }

    const newTournament: AdminTournament = {
      id: data.id,
      name: data.name,
      location: data.location,
      year: data.year,
      status: data.status,
      disciplines: [],
    }

    syncTournament(newTournament)
    setTournamentForm({ name: "", location: "", year: new Date().getFullYear().toString(), status: "active" })
    setDisciplineForm((current) => ({ ...current, tournamentId: current.tournamentId || newTournament.id }))
    showFeedback("success", "Torneo creado. Ya podés cargar disciplinas sobre esa base.")
    setSubmitting(null)
  }

  async function handleCreateDiscipline(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting("discipline")
    setFeedback(null)

    const response = await fetch("/api/disciplines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tournamentId: disciplineForm.tournamentId,
        name: disciplineForm.name,
        slug: disciplineForm.slug,
        format: disciplineForm.format,
        teamsCount: disciplineForm.teamsCount ? Number(disciplineForm.teamsCount) : undefined,
        playersCount: disciplineForm.playersCount ? Number(disciplineForm.playersCount) : undefined,
        details: disciplineForm.details,
      }),
    })

    const data = await parseJson(response)

    if (!response.ok) {
      showFeedback("error", data?.error || "No se pudo crear la disciplina.")
      setSubmitting(null)
      return
    }

    const tournament = tournaments.find((item) => item.id === disciplineForm.tournamentId)

    const newDiscipline: AdminDiscipline = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      format: data.format,
      details: data.details,
      playersCount: data.playersCount,
      teamsCount: data.teamsCount,
      tournamentId: disciplineForm.tournamentId,
      tournamentName: tournament?.name || "Torneo",
      tournamentYear: tournament?.year || new Date().getFullYear(),
      teams: [],
      matches: [],
    }

    syncDiscipline(newDiscipline)
    setDisciplineForm((current) => ({
      ...current,
      name: "",
      slug: "",
      format: "",
      teamsCount: "",
      playersCount: "",
      details: "",
    }))
    setRegistrationForm((current) => ({ ...current, disciplineSlug: current.disciplineSlug || newDiscipline.slug }))
    setMatchForm((current) => ({ ...current, disciplineSlug: current.disciplineSlug || newDiscipline.slug }))
    showFeedback("success", "Disciplina creada. Ahora sí podés empezar a inscribir y programar partidos.")
    setSubmitting(null)
  }

  async function handleCreateTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!registrationForm.disciplineSlug) {
      showFeedback("error", "Primero elegí una disciplina para inscribir participantes.")
      return
    }

    setSubmitting("team")
    setFeedback(null)

    const players = parsePlayersInput(registrationForm.players)
    const response = await fetch(`/api/admin/disciplines/${registrationForm.disciplineSlug}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: registrationForm.name,
        type: registrationForm.type,
        group: registrationForm.group || undefined,
        seed: registrationForm.seed ? Number(registrationForm.seed) : undefined,
        players,
      }),
    })

    const data = await parseJson(response)

    if (!response.ok) {
      showFeedback("error", data?.error || "No se pudo registrar el equipo o participante.")
      setSubmitting(null)
      return
    }

    setDisciplines((current) =>
      current.map((discipline) =>
        discipline.slug === registrationForm.disciplineSlug
          ? { ...discipline, teams: [...discipline.teams, data] }
          : discipline
      )
    )

    setRegistrationForm((current) => ({ ...current, name: "", group: "", seed: "", players: "" }))
    showFeedback("success", "Inscripción cargada. Ya quedó disponible para armar cruces.")
    setSubmitting(null)
  }

  async function handleCreateMatch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!matchForm.disciplineSlug) {
      showFeedback("error", "Elegí una disciplina para programar el partido.")
      return
    }

    if (!matchForm.team1Id || !matchForm.team2Id || matchForm.team1Id === matchForm.team2Id) {
      showFeedback("error", "Tenés que elegir dos equipos distintos. Conceptos primero, después código.")
      return
    }

    setSubmitting("match")
    setFeedback(null)

    const response = await fetch(`/api/disciplines/${matchForm.disciplineSlug}/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        team1Id: matchForm.team1Id,
        team2Id: matchForm.team2Id,
        stage: matchForm.stage || undefined,
        date: matchForm.date || undefined,
      }),
    })

    const data = await parseJson(response)

    if (!response.ok) {
      showFeedback("error", data?.error || "No se pudo programar el partido.")
      setSubmitting(null)
      return
    }

    const discipline = disciplines.find((item) => item.slug === matchForm.disciplineSlug)
    const team1 = discipline?.teams.find((team) => team.id === matchForm.team1Id)
    const team2 = discipline?.teams.find((team) => team.id === matchForm.team2Id)

    const newMatch: AdminMatch = {
      id: data.id,
      score1: data.score1,
      score2: data.score2,
      played: data.played,
      stage: data.stage,
      date: data.date,
      team1: team1 ? { id: team1.id, name: team1.name } : null,
      team2: team2 ? { id: team2.id, name: team2.name } : null,
    }

    setDisciplines((current) =>
      current.map((item) =>
        item.slug === matchForm.disciplineSlug
          ? { ...item, matches: [...item.matches, newMatch] }
          : item
      )
    )

    setMatchForm((current) => ({ ...current, team1Id: "", team2Id: "", stage: "", date: "" }))
    showFeedback("success", "Partido programado. Ahora administración ya lo puede seguir y cerrar.")
    setSubmitting(null)
  }

  async function handleUpdateMatch(matchId: string, values: { score1: string; score2: string; played: boolean; stage: string; date: string }) {
    setSubmitting(`match-${matchId}`)
    setFeedback(null)

    const response = await fetch(`/api/admin/matches/${matchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score1: values.score1 === "" ? null : Number(values.score1),
        score2: values.score2 === "" ? null : Number(values.score2),
        played: values.played,
        stage: values.stage || undefined,
        date: values.date || undefined,
      }),
    })

    const data = await parseJson(response)

    if (!response.ok) {
      showFeedback("error", data?.error || "No se pudo actualizar el partido.")
      setSubmitting(null)
      return
    }

    setDisciplines((current) =>
      current.map((discipline) => ({
        ...discipline,
        matches: discipline.matches.map((match) =>
          match.id === matchId
            ? {
                ...match,
                score1: data.score1,
                score2: data.score2,
                played: data.played,
                stage: data.stage,
                date: data.date,
              }
            : match
        ),
      }))
    )

    showFeedback("success", "Resultado actualizado. Así se opera un torneo de verdad.")
    setSubmitting(null)
  }

  const tournamentCount = tournaments.length
  const disciplineCount = disciplines.length
  const teamCount = disciplines.reduce((acc, discipline) => acc + discipline.teams.length, 0)
  const matchCount = disciplines.reduce((acc, discipline) => acc + discipline.matches.length, 0)

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Torneos", value: tournamentCount, icon: Trophy },
          { label: "Disciplinas", value: disciplineCount, icon: Shield },
          { label: "Inscripciones", value: teamCount, icon: Users },
          { label: "Partidos", value: matchCount, icon: Calendar },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-3xl font-semibold text-foreground">{item.value}</p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {feedback ? (
        <div
          className={
            feedback.type === "success"
              ? "rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700"
              : "rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          }
        >
          {feedback.message}
        </div>
      ) : null}

      <section className="flex flex-wrap gap-3">
        {[
          { key: "config", label: "Configuración", icon: Trophy },
          { key: "registrations", label: "Inscripciones", icon: Users },
          { key: "matches", label: "Operación", icon: Swords },
        ].map((tab) => (
          <Button
            key={tab.key}
            type="button"
            variant={activeTab === tab.key ? "default" : "outline"}
            className="gap-2"
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </section>

      {activeTab === "config" ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Crear torneo</CardTitle>
              <CardDescription>
                Arrancá por el contenedor principal. Sin torneo no hay contexto, y sin contexto el resto es caos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateTournament}>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Nombre</label>
                  <input
                    className="w-full rounded-xl border border-input bg-background px-3 py-2"
                    value={tournamentForm.name}
                    onChange={(event) => setTournamentForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Torneo interno 2025"
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Ubicación</label>
                    <input
                      className="w-full rounded-xl border border-input bg-background px-3 py-2"
                      value={tournamentForm.location}
                      onChange={(event) => setTournamentForm((current) => ({ ...current, location: event.target.value }))}
                      placeholder="Sanatorio El Carmen"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Año</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-input bg-background px-3 py-2"
                      value={tournamentForm.year}
                      onChange={(event) => setTournamentForm((current) => ({ ...current, year: event.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Estado</label>
                  <select
                    className="w-full rounded-xl border border-input bg-background px-3 py-2"
                    value={tournamentForm.status}
                    onChange={(event) => setTournamentForm((current) => ({ ...current, status: event.target.value }))}
                  >
                    <option value="active">Activo</option>
                    <option value="draft">Borrador</option>
                    <option value="completed">Finalizado</option>
                  </select>
                </div>
                <Button type="submit" className="gap-2" disabled={submitting === "tournament"}>
                  <Plus className="h-4 w-4" />
                  {submitting === "tournament" ? "Creando..." : "Crear torneo"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Crear disciplina</CardTitle>
              <CardDescription>
                Una disciplina bien definida evita después el clásico desastre de “vemos sobre la marcha”.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateDiscipline}>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Torneo</label>
                  <select
                    className="w-full rounded-xl border border-input bg-background px-3 py-2"
                    value={disciplineForm.tournamentId}
                    onChange={(event) => setDisciplineForm((current) => ({ ...current, tournamentId: event.target.value }))}
                    required
                  >
                    <option value="">Seleccioná un torneo</option>
                    {tournaments.map((tournament) => (
                      <option key={tournament.id} value={tournament.id}>
                        {tournament.name} · {tournament.year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Nombre</label>
                    <input
                      className="w-full rounded-xl border border-input bg-background px-3 py-2"
                      value={disciplineForm.name}
                      onChange={(event) => setDisciplineForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Fútbol 5"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Slug</label>
                    <input
                      className="w-full rounded-xl border border-input bg-background px-3 py-2"
                      value={disciplineForm.slug}
                      onChange={(event) => setDisciplineForm((current) => ({ ...current, slug: event.target.value }))}
                      placeholder="futbol-5"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Formato</label>
                    <input
                      className="w-full rounded-xl border border-input bg-background px-3 py-2"
                      value={disciplineForm.format}
                      onChange={(event) => setDisciplineForm((current) => ({ ...current, format: event.target.value }))}
                      placeholder="Grupos + eliminatorias"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Cupos / jugadores</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        className="w-full rounded-xl border border-input bg-background px-3 py-2"
                        value={disciplineForm.teamsCount}
                        onChange={(event) => setDisciplineForm((current) => ({ ...current, teamsCount: event.target.value }))}
                        placeholder="Equipos"
                      />
                      <input
                        type="number"
                        className="w-full rounded-xl border border-input bg-background px-3 py-2"
                        value={disciplineForm.playersCount}
                        onChange={(event) => setDisciplineForm((current) => ({ ...current, playersCount: event.target.value }))}
                        placeholder="Jugadores"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Detalle</label>
                  <textarea
                    className="min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2"
                    value={disciplineForm.details}
                    onChange={(event) => setDisciplineForm((current) => ({ ...current, details: event.target.value }))}
                    placeholder="Reglas, formato o notas operativas"
                  />
                </div>
                <Button type="submit" className="gap-2" disabled={submitting === "discipline"}>
                  <Plus className="h-4 w-4" />
                  {submitting === "discipline" ? "Creando..." : "Crear disciplina"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Torneos cargados</CardTitle>
              <CardDescription>
                Vista rápida para controlar simultaneidad: qué torneos existen y qué disciplinas cuelgan de cada uno.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tournaments.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border p-6 text-muted-foreground">
                  No hay torneos todavía.
                </p>
              ) : (
                <div className="space-y-4">
                  {tournaments.map((tournament) => (
                    <div key={tournament.id} className="rounded-2xl border border-border p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{tournament.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {tournament.location} · {tournament.year}
                          </p>
                        </div>
                        <Badge variant="outline">{tournament.status}</Badge>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {tournament.disciplines.length === 0 ? (
                          <span className="text-sm text-muted-foreground">Sin disciplinas cargadas todavía.</span>
                        ) : (
                          tournament.disciplines.map((discipline) => (
                            <Badge key={discipline.id} variant="secondary">
                              {discipline.name}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      ) : null}

      {activeTab === "registrations" ? (
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Registrar equipo / pareja / participante</CardTitle>
              <CardDescription>
                Usá esta sección para inscribir gente de verdad. Formato de jugadores: `Nombre | antigüedad` una línea por persona.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateTeam}>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Disciplina</label>
                  <select
                    className="w-full rounded-xl border border-input bg-background px-3 py-2"
                    value={registrationForm.disciplineSlug}
                    onChange={(event) => setRegistrationForm((current) => ({ ...current, disciplineSlug: event.target.value }))}
                    required
                  >
                    <option value="">Seleccioná una disciplina</option>
                    {sortedDisciplines.map((discipline) => (
                      <option key={discipline.id} value={discipline.slug}>
                        {discipline.name} · {discipline.tournamentName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Nombre del registro</label>
                    <input
                      className="w-full rounded-xl border border-input bg-background px-3 py-2"
                      value={registrationForm.name}
                      onChange={(event) => setRegistrationForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Los Cirujanos"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <select
                      className="w-full rounded-xl border border-input bg-background px-3 py-2"
                      value={registrationForm.type}
                      onChange={(event) => setRegistrationForm((current) => ({ ...current, type: event.target.value as TeamType }))}
                    >
                      <option value="TEAM">Equipo</option>
                      <option value="PAIR">Pareja</option>
                      <option value="SINGLE">Individual</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Grupo</label>
                    <input
                      className="w-full rounded-xl border border-input bg-background px-3 py-2"
                      value={registrationForm.group}
                      onChange={(event) => setRegistrationForm((current) => ({ ...current, group: event.target.value }))}
                      placeholder="A"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Seed</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-input bg-background px-3 py-2"
                      value={registrationForm.seed}
                      onChange={(event) => setRegistrationForm((current) => ({ ...current, seed: event.target.value }))}
                      placeholder="1"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Jugadores</label>
                  <textarea
                    className="min-h-40 w-full rounded-xl border border-input bg-background px-3 py-2 font-mono text-sm"
                    value={registrationForm.players}
                    onChange={(event) => setRegistrationForm((current) => ({ ...current, players: event.target.value }))}
                    placeholder={"Juan Pérez | 8\nCarlos García | 12"}
                    required
                  />
                </div>
                <Button type="submit" className="gap-2" disabled={submitting === "team"}>
                  <Plus className="h-4 w-4" />
                  {submitting === "team" ? "Registrando..." : "Registrar inscripción"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inscripciones por disciplina</CardTitle>
              <CardDescription>
                Control rápido para organización. Si acá no está claro, en la cancha va a ser peor.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedDisciplines.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border p-6 text-muted-foreground">
                  No hay disciplinas todavía.
                </p>
              ) : (
                <div className="space-y-4">
                  {sortedDisciplines.map((discipline) => (
                    <div key={discipline.id} className="rounded-2xl border border-border p-5">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{discipline.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {discipline.tournamentName} · {discipline.tournamentYear}
                          </p>
                        </div>
                        <Badge variant="secondary">{discipline.teams.length} inscripciones</Badge>
                      </div>
                      <div className="mt-4 space-y-3">
                        {discipline.teams.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Todavía no hay inscripciones en esta disciplina.</p>
                        ) : (
                          discipline.teams.map((team) => (
                            <div key={team.id} className="rounded-xl border border-border p-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-foreground">{team.name}</span>
                                <Badge variant="outline">{team.type}</Badge>
                                {team.group ? <Badge variant="secondary">Grupo {team.group}</Badge> : null}
                                {team.seed ? <Badge variant="secondary">Seed {team.seed}</Badge> : null}
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {team.players.map((player) => (
                                  <span key={player.id} className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                                    {player.name} · {player.seniority ?? "—"}a
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      ) : null}

      {activeTab === "matches" ? (
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Programar partido</CardTitle>
              <CardDescription>
                Acá armás los cruces iniciales. Después, en la misma pantalla, cargás resultados y dejás que la TV refleje el avance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateMatch}>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Disciplina</label>
                  <select
                    className="w-full rounded-xl border border-input bg-background px-3 py-2"
                    value={matchForm.disciplineSlug}
                    onChange={(event) => setMatchForm({ disciplineSlug: event.target.value, team1Id: "", team2Id: "", stage: "", date: "" })}
                    required
                  >
                    <option value="">Seleccioná una disciplina</option>
                    {sortedDisciplines.map((discipline) => (
                      <option key={discipline.id} value={discipline.slug}>
                        {discipline.name} · {discipline.tournamentName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Equipo 1</label>
                    <select
                      className="w-full rounded-xl border border-input bg-background px-3 py-2"
                      value={matchForm.team1Id}
                      onChange={(event) => setMatchForm((current) => ({ ...current, team1Id: event.target.value }))}
                      required
                    >
                      <option value="">Seleccioná</option>
                      {selectedMatchDiscipline?.teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Equipo 2</label>
                    <select
                      className="w-full rounded-xl border border-input bg-background px-3 py-2"
                      value={matchForm.team2Id}
                      onChange={(event) => setMatchForm((current) => ({ ...current, team2Id: event.target.value }))}
                      required
                    >
                      <option value="">Seleccioná</option>
                      {selectedMatchDiscipline?.teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Fase / stage</label>
                    <input
                      className="w-full rounded-xl border border-input bg-background px-3 py-2"
                      value={matchForm.stage}
                      onChange={(event) => setMatchForm((current) => ({ ...current, stage: event.target.value }))}
                      placeholder="Grupo A / Semifinal"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Fecha</label>
                    <input
                      type="datetime-local"
                      className="w-full rounded-xl border border-input bg-background px-3 py-2"
                      value={matchForm.date}
                      onChange={(event) => setMatchForm((current) => ({ ...current, date: event.target.value }))}
                    />
                  </div>
                </div>
                <Button type="submit" className="gap-2" disabled={submitting === "match"}>
                  <Plus className="h-4 w-4" />
                  {submitting === "match" ? "Programando..." : "Crear partido"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Partidos y resultados</CardTitle>
              <CardDescription>
                Operación en caliente: carga de score, estado del partido y fase. Esto después alimenta participantes y pantalla grande.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedDisciplines.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border p-6 text-muted-foreground">
                  No hay disciplinas todavía.
                </p>
              ) : (
                <div className="space-y-6">
                  {sortedDisciplines.map((discipline) => (
                    <div key={discipline.id} className="rounded-2xl border border-border p-5">
                      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{discipline.name}</h3>
                          <p className="text-sm text-muted-foreground">{discipline.tournamentName}</p>
                        </div>
                        <Badge variant="secondary">{discipline.matches.length} partidos</Badge>
                      </div>

                      {discipline.matches.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay partidos programados todavía.</p>
                      ) : (
                        <div className="space-y-4">
                          {discipline.matches.map((match) => (
                            <MatchEditor
                              key={match.id}
                              match={match}
                              saving={submitting === `match-${match.id}`}
                              onSave={handleUpdateMatch}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      ) : null}

      {selectedRegistrationDiscipline ? (
        <Card>
          <CardHeader>
            <CardTitle>Disciplina activa para inscripción</CardTitle>
            <CardDescription>
              {selectedRegistrationDiscipline.name} · {selectedRegistrationDiscipline.tournamentName} · {selectedRegistrationDiscipline.teams.length} registros cargados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}
    </div>
  )
}

function MatchEditor({
  match,
  saving,
  onSave,
}: {
  match: AdminMatch
  saving: boolean
  onSave: (matchId: string, values: { score1: string; score2: string; played: boolean; stage: string; date: string }) => Promise<void>
}) {
  const [values, setValues] = useState({
    score1: match.score1?.toString() ?? "",
    score2: match.score2?.toString() ?? "",
    played: match.played,
    stage: match.stage ?? "",
    date: match.date ? new Date(match.date).toISOString().slice(0, 16) : "",
  })

  return (
    <form
      className="rounded-xl border border-border p-4"
      onSubmit={async (event) => {
        event.preventDefault()
        await onSave(match.id, values)
      }}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-foreground">
            {match.team1?.name || "Por definir"} vs {match.team2?.name || "Por definir"}
          </p>
          <p className="text-sm text-muted-foreground">{match.stage || "Fase sin definir"}</p>
        </div>
        <Badge variant={match.played ? "default" : "outline"}>{match.played ? "Jugado" : "Pendiente"}</Badge>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-5">
        <input
          type="number"
          className="rounded-xl border border-input bg-background px-3 py-2"
          value={values.score1}
          onChange={(event) => setValues((current) => ({ ...current, score1: event.target.value }))}
          placeholder="Score 1"
        />
        <input
          type="number"
          className="rounded-xl border border-input bg-background px-3 py-2"
          value={values.score2}
          onChange={(event) => setValues((current) => ({ ...current, score2: event.target.value }))}
          placeholder="Score 2"
        />
        <input
          className="rounded-xl border border-input bg-background px-3 py-2"
          value={values.stage}
          onChange={(event) => setValues((current) => ({ ...current, stage: event.target.value }))}
          placeholder="Fase"
        />
        <input
          type="datetime-local"
          className="rounded-xl border border-input bg-background px-3 py-2"
          value={values.date}
          onChange={(event) => setValues((current) => ({ ...current, date: event.target.value }))}
        />
        <label className="flex items-center gap-2 rounded-xl border border-input px-3 py-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={values.played}
            onChange={(event) => setValues((current) => ({ ...current, played: event.target.checked }))}
          />
          Jugado
        </label>
      </div>

      <div className="mt-4 flex justify-end">
        <Button type="submit" size="sm" className="gap-2" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar resultado"}
        </Button>
      </div>
    </form>
  )
}
