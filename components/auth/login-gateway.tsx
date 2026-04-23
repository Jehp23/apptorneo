"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export function LoginGateway() {
  const [showLogin, setShowLogin] = useState(false)
  const [password,  setPassword]  = useState("")
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) { setError("Contraseña incorrecta"); setLoading(false); return }
      router.push("/admin")
      router.refresh()
    } catch {
      setError("No se pudo conectar. Intentá de nuevo.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-xs space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-muted">
            <Image src="/logotipo_sanatorio.png" alt="Sanatorio El Carmen" fill className="object-contain" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-semibold text-foreground">Torneo Interno</h1>
            <p className="text-sm text-muted-foreground">Sanatorio El Carmen · 2025</p>
          </div>
        </div>

        {!showLogin ? (
          <div className="space-y-3">
            <button
              onClick={() => router.push("/torneo")}
              className="w-full rounded-xl bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ver torneo
            </button>
            <button
              onClick={() => setShowLogin(true)}
              className="w-full rounded-xl border border-border px-4 py-3 text-center text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              Administrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <button type="button" onClick={() => { setShowLogin(false); setPassword(""); setError("") }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Volver
            </button>
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary placeholder:text-muted-foreground"
              placeholder="Contraseña..."
            />
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            <button type="submit" disabled={loading || !password}
              className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40">
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
