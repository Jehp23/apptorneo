import Link from "next/link"
import {
  Trophy,
  Target,
  Spade,
  Gamepad2,
  CircleDot,
  Users,
  LogIn,
} from "lucide-react"

const disciplines = [
  {
    name: "Futbol 5",
    href: "/futbol5",
    icon: Trophy,
    description: "6 equipos",
    participants: 30,
  },
  {
    name: "Padel",
    href: "/padel",
    icon: Target,
    description: "8 parejas",
    participants: 16,
  },
  {
    name: "Loba",
    href: "/loba",
    icon: Spade,
    description: "16 parejas",
    participants: 32,
  },
  {
    name: "Truco",
    href: "/truco",
    icon: Spade,
    description: "16 parejas",
    participants: 32,
  },
  {
    name: "Metegol",
    href: "/metegol",
    icon: Gamepad2,
    description: "12 parejas",
    participants: 24,
  },
  {
    name: "Sapo",
    href: "/sapo",
    icon: CircleDot,
    description: "20 participantes",
    participants: 20,
  },
]

export default function Home() {
  const totalParticipants = disciplines.reduce((acc, d) => acc + d.participants, 0)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-serif font-semibold text-3xl text-foreground mb-2">
          Bienvenidos al Torneo Interno
        </h1>
        <p className="text-lg">
          <span className="text-primary font-semibold">Sanatorio El Carmen</span>
          <span className="text-muted-foreground"> - Edicion 2025</span>
        </p>
      </div>

      {/* Login Button */}
      <div className="mb-8 flex justify-end">
        <Link href="/login">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <LogIn className="w-4 h-4" />
            Ingresar
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{disciplines.length}</p>
              <p className="text-sm text-muted-foreground">Disciplinas</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{totalParticipants}</p>
              <p className="text-sm text-muted-foreground">Participantes</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">En Curso</p>
              <p className="text-sm text-muted-foreground">Estado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disciplines Grid */}
      <div className="mb-6">
        <h2 className="font-serif font-semibold text-lg text-foreground mb-4">Disciplinas</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {disciplines.map((discipline) => (
          <Link
            key={discipline.name}
            href={discipline.href}
            className="group bg-card rounded-xl border border-border p-6 hover:shadow-md hover:border-primary/20 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <discipline.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {discipline.participants} jugadores
              </span>
            </div>
            <h3 className="font-serif font-semibold text-foreground mb-1">{discipline.name}</h3>
            <p className="text-sm text-muted-foreground">{discipline.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
