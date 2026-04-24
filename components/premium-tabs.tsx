"use client"

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface Tab {
  id: string
  label: string
  icon?: LucideIcon
}

interface PremiumTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function PremiumTabs({ tabs, activeTab, onTabChange }: PremiumTabsProps) {
  return (
    <nav className="grid grid-cols-3 gap-1 bg-muted/50 p-1 rounded-xl mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-medium rounded-lg transition-all duration-200",
            activeTab === tab.id
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.icon && <tab.icon className="h-4 w-4" />}
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
