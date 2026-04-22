import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { disciplines } from "@/lib/data";
import { FileText, Trophy } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="h-10 w-10" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-balance">
              Torneo Interno
            </h1>
          </div>
          <p className="text-lg md:text-xl opacity-90">Sanatorio El Carmen</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Disciplines Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Disciplinas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {disciplines.map((discipline) => (
              <Link key={discipline.id} href={discipline.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                  <CardContent className="p-6 md:p-8 flex flex-col items-center justify-center text-center gap-3">
                    <span className="text-5xl md:text-6xl" role="img" aria-label={discipline.name}>
                      {discipline.icon}
                    </span>
                    <h3 className="text-lg md:text-xl font-semibold">{discipline.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Regulations Button */}
        <section className="text-center">
          <Link href="/reglamento">
            <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6">
              <FileText className="h-5 w-5" />
              Reglamento General
            </Button>
          </Link>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-muted py-6 px-4 mt-12">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>Sanatorio El Carmen - Torneo Interno 2026</p>
        </div>
      </footer>
    </main>
  );
}
