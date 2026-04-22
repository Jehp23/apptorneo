import Link from "next/link"
import {
  Trophy,
  Target,
  Spade,
  Gamepad2,
  CircleDot,
  Users,
  LogIn,
  ArrowRight,
  MonitorPlay,
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

const experienceCards = [
  {
    title: "Participantes",
    description: "Solo lectura para seguir fixtures, posiciones y resultados del torneo.",
    href: "/futbol5",
    cta: "Ver disciplinas",
    icon: Users,
  },
  {
    title: "Pantalla grande",
    description: "Vista optimizada para TV o monitor con estado global del torneo.",
    href: "/pantalla",
    cta: "Abrir pantalla",
    icon: MonitorPlay,
  },
  {
    title: "Administración",
    description: "Ingreso protegido para que organización opere el torneo en simultáneo.",
    href: "/admin",
    cta: "Ir al admin",
    icon: LogIn,
  },
]

export default function TournamentHomePage() {
  const totalParticipants = disciplines.reduce((acc, d) => acc + d.participants, 0)

  return (
    <div className="p-8">
      <div className="mb-8 rounded-3xl border border-border bg-card p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Torneo interno</p>
            <h1 className="font-serif text-3xl font-semibold text-foreground">Centro público del torneo</h1>
            <p className="text-lg text-muted-foreground">
              Desde acá los participantes siguen el avance del torneo. Administración opera por su lado y la pantalla grande muestra el estado general en tiempo real.
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">Sanatorio El Carmen</span>
              <span> · Edición 2025</span>
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <LogIn className="h-4 w-4" />
              Cambiar acceso
            </Link>
            <Link href="/pantalla" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 font-medium text-foreground transition-colors hover:bg-muted">
              Abrir pantalla
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <section className="mb-10 grid gap-4 lg:grid-cols-3">
        {experienceCards.map((card) => (
          <Link key={card.title} href={card.href} className="rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/30">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <card.icon className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{card.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
              {card.cta}
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </section>

      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{disciplines.length}</p>
              <p className="text-sm text-muted-foreground">Disciplinas</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
              <Users className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{totalParticipants}</p>
              <p className="text-sm text-muted-foreground">Participantes</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Target className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">En curso</p>
              <p className="text-sm text-muted-foreground">Estado</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="mb-4 font-serif text-lg font-semibold text-foreground">Disciplinas</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {disciplines.map((discipline) => (
          <Link
            key={discipline.name}
            href={discipline.href}
            className="group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/20 hover:shadow-md"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <discipline.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                {discipline.participants} jugadores
              </span>
            </div>
            <h3 className="mb-1 font-serif font-semibold text-foreground">{discipline.name}</h3>
            <p className="text-sm text-muted-foreground">{discipline.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
