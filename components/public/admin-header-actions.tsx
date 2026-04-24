"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogIn, LogOut } from "lucide-react"

export function AdminHeaderActions() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/admin/me", { credentials: "include" }).then((r) => { if (r.ok) setIsAdmin(true) })
  }, [])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      setIsAdmin(false)
    } finally {
      router.refresh()
      setLoggingOut(false)
    }
  }

  if (isAdmin) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
        >
          Panel admin
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </button>
      </div>
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
