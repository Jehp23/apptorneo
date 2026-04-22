import Link from "next/link";
import { ArrowLeft, ArrowRight, Users, Calendar, Clock, Award, AlertTriangle, FileText } from "lucide-react";

const generalRegulations = [
  {
    icon: Users,
    title: "Participacion",
    items: [
      "Todos los empleados del Sanatorio El Carmen pueden participar",
      "Cada participante puede inscribirse en multiples disciplinas",
      "Las inscripciones deben realizarse antes del inicio del torneo",
      "No se permiten cambios de equipo una vez comenzado el torneo",
    ],
  },
  {
    icon: Calendar,
    title: "Calendario",
    items: [
      "El torneo se desarrollara durante las fechas establecidas por la organizacion",
      "Los horarios de cada partido seran comunicados con anticipacion",
      "En caso de demoras, se ajustaran los horarios segun disponibilidad",
      "Los partidos suspendidos se reprogramaran a la brevedad",
    ],
  },
  {
    icon: Clock,
    title: "Puntualidad",
    items: [
      "Los equipos deben presentarse 10 minutos antes del horario programado",
      "Se otorga una tolerancia de 15 minutos para comenzar el partido",
      "Pasada la tolerancia, el equipo ausente pierde por walkover",
      "En caso de fuerza mayor, comunicar inmediatamente a la organizacion",
    ],
  },
  {
    icon: Award,
    title: "Fair Play",
    items: [
      "Se espera conducta deportiva de todos los participantes",
      "Esta prohibido el uso de lenguaje ofensivo o discriminatorio",
      "El respeto hacia compañeros, rivales y organizadores es obligatorio",
      "Las decisiones de los arbitros/jueces son inapelables durante el partido",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Sanciones",
    items: [
      "Conducta antideportiva: Advertencia verbal",
      "Reincidencia: Expulsion del partido en curso",
      "Faltas graves: Expulsion del torneo",
      "Las sanciones seran evaluadas por el comite organizador",
    ],
  },
  {
    icon: FileText,
    title: "Disposiciones Finales",
    items: [
      "La organizacion se reserva el derecho de modificar fechas y horarios",
      "Cualquier situacion no prevista sera resuelta por el comite organizador",
      "Los premios seran entregados en la ceremonia de clausura",
      "La participacion implica la aceptacion de este reglamento",
    ],
  },
];

const disciplinesSummary = [
  {
    name: "Futbol 5",
    icon: "⚽",
    href: "/futbol5",
    summary: "6 equipos, 2 grupos, fase eliminatoria",
  },
  {
    name: "Padel",
    icon: "🎾",
    href: "/padel",
    summary: "6 parejas, 2 grupos, mejor de 3 sets",
  },
  {
    name: "Loba",
    icon: "🃏",
    href: "/loba",
    summary: "38 jugadores, 6 mesas, eliminacion 101 pts",
  },
  {
    name: "Truco",
    icon: "🎴",
    href: "/truco",
    summary: "8 parejas, 2 grupos, partidos a 30 pts",
  },
  {
    name: "Metegol",
    icon: "🕹️",
    href: "/metegol",
    summary: "18 equipos, 6 grupos, hexagonal final",
  },
  {
    name: "Sapo",
    icon: "🐸",
    href: "/sapo",
    summary: "15 parejas, clasificacion + eliminatoria",
  },
];

export default function ReglamentoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8" />
            <h1 className="text-3xl md:text-4xl font-light tracking-tight">Reglamento General</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* General Rules */}
        <section className="mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
            Normas Generales
          </p>
          <div className="grid gap-8 md:grid-cols-2">
            {generalRegulations.map((section, index) => (
              <div key={index}>
                <div className="flex items-center gap-3 mb-4">
                  <section.icon className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium">{section.title}</h3>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground flex-shrink-0" />
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
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
            Reglamentos por Disciplina
          </p>
          <div className="grid gap-px bg-border rounded-lg overflow-hidden">
            {disciplinesSummary.map((discipline) => (
              <Link 
                key={discipline.name} 
                href={discipline.href}
                className="group bg-background hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl" role="img" aria-label={discipline.name}>
                      {discipline.icon}
                    </span>
                    <div>
                      <span className="font-medium">{discipline.name}</span>
                      <p className="text-sm text-muted-foreground mt-0.5">{discipline.summary}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-sm text-muted-foreground">
            Comite Organizador - 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
