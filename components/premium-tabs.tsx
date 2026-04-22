"use client"

import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
}

interface PremiumTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function PremiumTabs({ tabs, activeTab, onTabChange }: PremiumTabsProps) {
  return (
    <nav className="flex gap-1 bg-muted/50 p-1 rounded-xl mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
            activeTab === tab.id
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
