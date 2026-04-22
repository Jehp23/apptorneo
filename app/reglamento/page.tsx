import Link from "next/link"
import {
  Users,
  Calendar,
  Clock,
  Award,
  AlertTriangle,
  FileText,
  ArrowRight,
  Trophy,
  Target,
  Spade,
  Gamepad2,
  CircleDot,
} from "lucide-react"

const generalRegulations = [
  {
    icon: Users,
    title: "Participacion",
    items: [
      "Todos los empleados pueden participar",
      "Inscripcion en multiples disciplinas permitida",
      "Inscripciones antes del inicio del torneo",
      "Sin cambios de equipo una vez comenzado",
    ],
  },
  {
    icon: Calendar,
    title: "Calendario",
    items: [
      "Fechas establecidas por la organizacion",
      "Horarios comunicados con anticipacion",
      "Ajustes segun disponibilidad si hay demoras",
      "Partidos suspendidos se reprograman",
    ],
  },
  {
    icon: Clock,
    title: "Puntualidad",
    items: [
      "Presentarse 10 min antes del horario",
      "Tolerancia de 15 minutos",
      "Walkover pasada la tolerancia",
      "Fuerza mayor: comunicar inmediatamente",
    ],
  },
  {
    icon: Award,
    title: "Fair Play",
    items: [
      "Conducta deportiva obligatoria",
      "Prohibido lenguaje ofensivo",
      "Respeto a compañeros y rivales",
      "Decisiones de arbitros son inapelables",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Sanciones",
    items: [
      "Conducta antideportiva: Advertencia",
      "Reincidencia: Expulsion del partido",
      "Faltas graves: Expulsion del torneo",
      "Evaluacion por comite organizador",
    ],
  },
  {
    icon: FileText,
    title: "Disposiciones Finales",
    items: [
      "Organizacion puede modificar fechas",
      "Situaciones no previstas: comite decide",
      "Premios en ceremonia de clausura",
      "Participar implica aceptar reglamento",
    ],
  },
]

const disciplinesSummary = [
  { name: "Futbol 5", Icon: Trophy, href: "/futbol5", summary: "6 equipos, 2 grupos, fase eliminatoria" },
  { name: "Padel", Icon: Target, href: "/padel", summary: "6 parejas, 2 grupos, mejor de 3 sets" },
  { name: "Loba", Icon: Spade, href: "/loba", summary: "38 jugadores, 6 mesas, eliminacion 101 pts" },
  { name: "Truco", Icon: Spade, href: "/truco", summary: "8 parejas, 2 grupos, partidos a 30 pts" },
  { name: "Metegol", Icon: Gamepad2, href: "/metegol", summary: "18 equipos, 6 grupos, hexagonal final" },
  { name: "Sapo", Icon: CircleDot, href: "/sapo", summary: "15 parejas, clasificacion + eliminatoria" },
]

export default function ReglamentoPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-serif font-semibold text-2xl text-foreground">Reglamento General</h1>
            <p className="text-sm text-muted-foreground">Normas y disposiciones del torneo</p>
          </div>
        </div>
      </header>

      {/* General Rules */}
      <section className="mb-12">
        <h2 className="font-serif font-semibold text-lg text-foreground mb-6">Normas Generales</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {generalRegulations.map((section, index) => (
            <div key={index} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <section.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{section.title}</h3>
              </div>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Disciplines Summary */}
      <section>
        <h2 className="font-serif font-semibold text-lg text-foreground mb-6">Reglamentos por Disciplina</h2>
        <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border">
          {disciplinesSummary.map((discipline) => (
            <Link
              key={discipline.name}
              href={discipline.href}
              className="group flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <discipline.Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="font-semibold text-foreground">{discipline.name}</span>
                  <p className="text-sm text-muted-foreground mt-0.5">{discipline.summary}</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
