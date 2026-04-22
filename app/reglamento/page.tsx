import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Home, FileText, Users, Calendar, Award, AlertTriangle, Clock } from "lucide-react";

const generalRegulations = [
  {
    icon: Users,
    title: "Participación",
    items: [
      "Todos los empleados del Sanatorio El Carmen pueden participar",
      "Cada participante puede inscribirse en múltiples disciplinas",
      "Las inscripciones deben realizarse antes del inicio del torneo",
      "No se permiten cambios de equipo una vez comenzado el torneo",
    ],
  },
  {
    icon: Calendar,
    title: "Calendario",
    items: [
      "El torneo se desarrollará durante las fechas establecidas por la organización",
      "Los horarios de cada partido serán comunicados con anticipación",
      "En caso de demoras, se ajustarán los horarios según disponibilidad",
      "Los partidos suspendidos se reprogramarán a la brevedad",
    ],
  },
  {
    icon: Clock,
    title: "Puntualidad",
    items: [
      "Los equipos deben presentarse 10 minutos antes del horario programado",
      "Se otorga una tolerancia de 15 minutos para comenzar el partido",
      "Pasada la tolerancia, el equipo ausente pierde por walkover",
      "En caso de fuerza mayor, comunicar inmediatamente a la organización",
    ],
  },
  {
    icon: Award,
    title: "Fair Play",
    items: [
      "Se espera conducta deportiva de todos los participantes",
      "Está prohibido el uso de lenguaje ofensivo o discriminatorio",
      "El respeto hacia compañeros, rivales y organizadores es obligatorio",
      "Las decisiones de los árbitros/jueces son inapelables durante el partido",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Sanciones",
    items: [
      "Conducta antideportiva: Advertencia verbal",
      "Reincidencia: Expulsión del partido en curso",
      "Faltas graves: Expulsión del torneo",
      "Las sanciones serán evaluadas por el comité organizador",
    ],
  },
  {
    icon: FileText,
    title: "Disposiciones Finales",
    items: [
      "La organización se reserva el derecho de modificar fechas y horarios",
      "Cualquier situación no prevista será resuelta por el comité organizador",
      "Los premios serán entregados en la ceremonia de clausura",
      "La participación implica la aceptación de este reglamento",
    ],
  },
];

const disciplinesSummary = [
  {
    name: "Fútbol 5",
    icon: "⚽",
    href: "/futbol5",
    summary: "6 equipos, 2 grupos, fase eliminatoria. Partidos de 2x20 min.",
  },
  {
    name: "Padel",
    icon: "🎾",
    href: "/padel",
    summary: "6 parejas, 2 grupos, mejor de 3 sets. Golden point en deuce.",
  },
  {
    name: "Loba",
    icon: "🃏",
    href: "/loba",
    summary: "38 jugadores, 6 mesas. Eliminación al llegar a 101 puntos.",
  },
  {
    name: "Truco",
    icon: "🎴",
    href: "/truco",
    summary: "8 parejas, 2 grupos. Partidos a 30 puntos, sin flor.",
  },
  {
    name: "Metegol",
    icon: "🕹️",
    href: "/metegol",
    summary: "18 equipos, 6 grupos, hexagonal final. Prohibido el remolino.",
  },
  {
    name: "Sapo",
    icon: "🐸",
    href: "/sapo",
    summary: "15 parejas, clasificación por puntaje, eliminatoria top 8.",
  },
];

export default function ReglamentoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="h-4 w-4" />
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8" />
              <h1 className="text-2xl md:text-3xl font-bold">Reglamento General</h1>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* General Rules */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Normas Generales del Torneo</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {generalRegulations.map((section, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <section.icon className="h-5 w-5 text-primary" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-sm">
                        <span className="text-primary font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Disciplines Summary */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Reglamentos por Disciplina</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {disciplinesSummary.map((discipline) => (
              <Link key={discipline.name} href={discipline.href}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer hover:border-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="text-2xl" role="img" aria-label={discipline.name}>
                        {discipline.icon}
                      </span>
                      {discipline.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{discipline.summary}</p>
                    <p className="text-sm text-primary mt-2 font-medium">
                      Ver reglamento completo →
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-6 px-4 mt-12">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>Sanatorio El Carmen - Torneo Interno 2026</p>
          <p className="text-sm mt-1">Comité Organizador</p>
        </div>
      </footer>
    </div>
  );
}
