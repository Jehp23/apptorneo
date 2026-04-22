import Link from "next/link";
import { disciplines } from "@/lib/data";
import { ArrowRight, FileText } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Sanatorio El Carmen
          </p>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight text-balance">
            Torneo Interno
          </h1>
          <p className="mt-4 text-muted-foreground max-w-md">
            Competencias deportivas y de entretenimiento para todos los colaboradores.
          </p>
        </div>
      </header>

      {/* Disciplines */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
          Disciplinas
        </p>
        <div className="grid gap-px bg-border">
          {disciplines.map((discipline) => (
            <Link 
              key={discipline.id} 
              href={discipline.href}
              className="group bg-background hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between py-6 md:py-8">
                <div className="flex items-center gap-6">
                  <span className="text-3xl md:text-4xl w-14 text-center" role="img" aria-label={discipline.name}>
                    {discipline.icon}
                  </span>
                  <span className="text-lg md:text-xl font-medium">{discipline.name}</span>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Regulations */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <Link 
          href="/reglamento"
          className="group flex items-center justify-between py-6 border-t border-b border-border hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Reglamento General</span>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <p className="text-sm text-muted-foreground">
            2026
          </p>
        </div>
      </footer>
    </main>
  );
}
