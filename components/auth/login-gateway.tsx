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
      <div className="w-full max-w-xs space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative h-28 w-72 overflow-hidden rounded-3xl bg-muted">
            <Image src="/logosanatorio.avif" alt="Sanatorio El Carmen" fill className="object-cover" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Torneo Interno</h1>
            <p className="mt-1 text-base text-muted-foreground">Sanatorio El Carmen · 2025</p>
          </div>
        </div>

        {!showLogin ? (
          <div className="space-y-3">
            <button
              onClick={() => router.push("/torneo")}
              className="w-full rounded-3xl border-2 border-primary bg-primary px-6 py-6 text-center text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              <p className="text-2xl font-bold">Ver el torneo</p>
            </button>
            <button
              onClick={() => setShowLogin(true)}
              className="w-full rounded-3xl border-2 border-border bg-card px-6 py-4 text-center transition-colors hover:border-muted-foreground active:scale-[0.98]"
            >
              <p className="text-base font-semibold text-muted-foreground">Administrar</p>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <button type="button" onClick={() => { setShowLogin(false); setPassword(""); setError("") }}
              className="flex items-center gap-2 text-base text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Volver
            </button>
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border-2 border-border bg-background px-5 py-4 text-xl outline-none transition-colors focus:border-primary placeholder:text-muted-foreground"
              placeholder="Contraseña..."
            />
            {error ? <p className="text-base font-medium text-destructive">{error}</p> : null}
            <button type="submit" disabled={loading || !password}
              className="w-full rounded-2xl bg-primary px-5 py-4 text-xl font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40">
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
