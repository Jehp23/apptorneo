"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { LogIn, LogOut } from "lucide-react"

export function AdminHeaderActions() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetch("/api/admin/me").then((r) => { if (r.ok) setIsAdmin(true) })
  }, [])

  if (isAdmin) {
    return (
      <Link
        href="/api/admin/auth/logout"
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        Salir
      </Link>
    )
  }

  return (
    <Link
      href="/login"
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <LogIn className="h-4 w-4" />
      Ingresar como admin
    </Link>
  )
}
