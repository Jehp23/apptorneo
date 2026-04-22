"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

interface DisciplineHeaderProps {
  name: string;
  icon: string;
}

export function DisciplineHeader({ name, icon }: DisciplineHeaderProps) {
  return (
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
            <span className="text-4xl" role="img" aria-label={name}>
              {icon}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold">{name}</h1>
          </div>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </div>
    </header>
  );
}
