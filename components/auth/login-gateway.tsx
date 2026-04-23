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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      {/* Grid pattern background */}
      <div className="absolute inset-0 -z-10 opacity-[0.03]" style={{
        backgroundImage: `
          linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }}></div>
      
      <div className="w-full max-w-xs space-y-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative h-32 w-32 overflow-hidden rounded-2xl bg-muted shadow-lg">
            <Image src="/logotipo_sanatorio.png" alt="Sanatorio El Carmen" fill className="object-contain" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground">Torneo Interno</h1>
            <p className="text-sm text-muted-foreground">Sanatorio El Carmen · 2026</p>
          </div>
        </div>

        {!showLogin ? (
          <div className="space-y-3">
            <button
              onClick={() => router.push("/torneo")}
              className="w-full rounded-xl bg-primary px-4 py-3.5 text-center text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 shadow-md"
            >
              Ver torneo
            </button>
            <button
              onClick={() => setShowLogin(true)}
              className="w-full rounded-xl border-2 border-border px-4 py-3.5 text-center text-sm font-semibold text-muted-foreground transition-all hover:border-primary hover:text-foreground"
            >
              Administrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <button type="button" onClick={() => { setShowLogin(false); setPassword(""); setError("") }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Volver
            </button>
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary placeholder:text-muted-foreground"
              placeholder="Contraseña..."
            />
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            <button type="submit" disabled={loading || !password}
              className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40 shadow-md">
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
