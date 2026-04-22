"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Trophy,
  Gamepad2,
  Spade,
  Target,
  CircleDot,
  FileText,
} from "lucide-react"

const navigation = [
  { name: "Inicio", href: "/torneo", icon: Home },
  { name: "Futbol 5", href: "/futbol5", icon: Trophy },
  { name: "Padel", href: "/padel", icon: Target },
  { name: "Loba", href: "/loba", icon: Spade },
  { name: "Truco", href: "/truco", icon: Spade },
  { name: "Metegol", href: "/metegol", icon: Gamepad2 },
  { name: "Sapo", href: "/sapo", icon: CircleDot },
  { name: "Reglamento General", href: "/reglamento", icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-serif font-semibold text-sm text-foreground">Torneo Interno</h1>
            <p className="text-xs text-muted-foreground">Sanatorio El Carmen</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          2025 Edition
        </p>
      </div>
    </aside>
  )
}
