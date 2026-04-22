"use client"

import { type LucideIcon } from "lucide-react"

interface DisciplineHeaderProps {
  name: string
  Icon: LucideIcon
  description?: string
}

export function DisciplineHeader({ name, Icon, description }: DisciplineHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="font-serif font-semibold text-2xl text-foreground">{name}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </header>
  )
}
