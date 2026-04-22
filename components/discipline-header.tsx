"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface DisciplineHeaderProps {
  name: string;
  icon: string;
}

export function DisciplineHeader({ name, icon }: DisciplineHeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <div className="flex items-center gap-5">
          <span className="text-4xl md:text-5xl" role="img" aria-label={name}>
            {icon}
          </span>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight">{name}</h1>
        </div>
      </div>
    </header>
  );
}
