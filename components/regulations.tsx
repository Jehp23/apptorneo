"use client"

import { FileText, CheckCircle2 } from "lucide-react"

interface RegulationSection {
  title: string
  items: string[]
}

interface RegulationsProps {
  sections: RegulationSection[]
}

export function Regulations({ sections }: RegulationsProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-serif font-semibold text-foreground">Reglamento</h3>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((section, index) => (
          <div key={index} className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground border-b border-border pb-2">{section.title}</h4>
            <ul className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
