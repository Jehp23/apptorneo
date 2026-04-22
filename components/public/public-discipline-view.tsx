"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowLeft, Trophy } from "lucide-react"

import { DisciplineHeader } from "@/components/discipline-header"
import { FixtureList, type FixtureMatch } from "@/components/fixture-list"
import { InfoPanel } from "@/components/info-panel"
import { ParticipantsList } from "@/components/participants-list"
import { PremiumTabs } from "@/components/premium-tabs"
import { StandingsTable, type StandingRow } from "@/components/standings-table"

interface DisciplinePlayer {
  id: string
  name: string
  seniority?: number | null
}

interface DisciplineTeam {
  id: string
  name: string
  group?: string | null
  players: DisciplinePlayer[]
}

interface DisciplineMatch {
  id: string
  team1?: { id: string; name: string } | null
  team2?: { id: string; name: string } | null
  score1?: number | null
  score2?: number | null
  played: boolean
  stage?: string | null
  date?: string | null
}

export interface PublicDisciplineData {
  id: string
  name: string
  slug: string
  format?: string | null
  playersCount?: number | null
  teamsCount?: number | null
  details?: string | null
  teams: DisciplineTeam[]
  matches: DisciplineMatch[]
}

function calculateStandings(teamIds: string[], matches: DisciplineMatch[], teams: DisciplineTeam[]): StandingRow[] {
  const stats: Record<string, StandingRow> = {}

  teamIds.forEach((teamId, index) => {
    const team = teams.find((item) => item.id === teamId)
    stats[teamId] = {
      position: index + 1,
      teamName: team?.name || teamId,
      pj: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      gf: 0,
      gc: 0,
      dg: 0,
      pts: 0,
    }
  })

  matches
    .filter(
      (match) =>
        match.played &&
        match.team1 &&
        match.team2 &&
        teamIds.includes(match.team1.id) &&
        teamIds.includes(match.team2.id)
    )
    .forEach((match) => {
      const t1 = stats[match.team1!.id]
      const t2 = stats[match.team2!.id]
      const score1 = match.score1 || 0
      const score2 = match.score2 || 0

      t1.pj += 1
      t2.pj += 1
      t1.gf += score1
      t1.gc += score2
      t2.gf += score2
      t2.gc += score1

      if (score1 > score2) {
        t1.pg += 1
        t1.pts += 3
        t2.pp += 1
      } else if (score1 < score2) {
        t2.pg += 1
        t2.pts += 3
        t1.pp += 1
      } else {
        t1.pe += 1
        t2.pe += 1
        t1.pts += 1
        t2.pts += 1
      }

      t1.dg = t1.gf - t1.gc
      t2.dg = t2.gf - t2.gc
    })

  return Object.values(stats)
    .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf)
    .map((row, index) => ({ ...row, position: index + 1 }))
}

function groupTeams(teams: DisciplineTeam[]) {
  const groups = teams.reduce<Record<string, string[]>>((acc, team) => {
    const key = team.group || "General"
    acc[key] = acc[key] ?? []
    acc[key].push(team.id)
    return acc
  }, {})

  return Object.entries(groups)
}

function getFixtureMatches(matches: DisciplineMatch[]): FixtureMatch[] {
  return matches.map((match, index) => ({
    id: match.id,
    team1: match.team1?.name || "Por definir",
    team2: match.team2?.name || "Por definir",
    score1: match.score1 ?? undefined,
    score2: match.score2 ?? undefined,
    played: match.played,
    matchNumber: index + 1,
  }))
}

const tabs = [
  { id: "posiciones", label: "Posiciones" },
  { id: "fixture", label: "Fixture" },
  { id: "participantes", label: "Participantes" },
  { id: "info", label: "Info" },
]

export function PublicDisciplineView({ discipline }: { discipline: PublicDisciplineData }) {
  const [activeTab, setActiveTab] = useState("posiciones")

  const groupedStandings = useMemo(
    () =>
      groupTeams(discipline.teams).map(([groupName, teamIds]) => ({
        groupName,
        standings: calculateStandings(teamIds, discipline.matches, discipline.teams),
      })),
    [discipline]
  )

  const fixtures = useMemo(
    () =>
      groupTeams(discipline.teams).map(([groupName, teamIds]) => ({
        groupName,
        matches: getFixtureMatches(
          discipline.matches.filter(
            (match) =>
              match.team1 &&
              match.team2 &&
              teamIds.includes(match.team1.id) &&
              teamIds.includes(match.team2.id)
          )
        ),
      })),
    [discipline]
  )

  const upcomingMatches = useMemo(
    () =>
      discipline.matches
        .filter((match) => !match.played)
        .slice(0, 4)
        .map((match) => ({
          team1: match.team1?.name || "Por definir",
          team2: match.team2?.name || "Por definir",
          date: match.date || undefined,
        })),
    [discipline]
  )

  return (
    <div className="p-8">
      <Link href="/torneo" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Volver al torneo
      </Link>

      <DisciplineHeader
        name={discipline.name}
        Icon={Trophy}
        description={discipline.format || "Seguimiento público del torneo"}
      />

      <div className="flex gap-8">
        <div className="min-w-0 flex-1">
          <PremiumTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "posiciones" && (
            <div className="grid gap-6 lg:grid-cols-2">
              {groupedStandings.map((group) => (
                <StandingsTable key={group.groupName} title={group.groupName} standings={group.standings} highlightTop={2} />
              ))}
            </div>
          )}

          {activeTab === "fixture" && (
            <div className="grid gap-6 lg:grid-cols-2">
              {fixtures.map((group) => (
                <FixtureList key={group.groupName} title={group.groupName} matches={group.matches} />
              ))}
            </div>
          )}

          {activeTab === "participantes" && <ParticipantsList title="Participantes inscriptos" teams={discipline.teams} />}

          {activeTab === "info" && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">Información general</h2>
              <p className="mt-3 whitespace-pre-line text-muted-foreground">
                {discipline.details || "Todavía no hay detalles cargados para esta disciplina."}
              </p>
            </div>
          )}
        </div>

        <div className="hidden w-80 flex-shrink-0 xl:block">
          <InfoPanel
            teams={discipline.teams.length}
            players={discipline.teams.reduce((acc, team) => acc + team.players.length, 0)}
            format={discipline.format || "Formato sin definir"}
            classification="Top según puntos y diferencia"
            upcomingMatches={upcomingMatches}
          />
        </div>
      </div>
    </div>
  )
}
