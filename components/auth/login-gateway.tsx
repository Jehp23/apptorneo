"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, EyeOff, Shield, Trophy } from "lucide-react"

export function LoginGateway() {
  const [showLogin, setShowLogin] = useState(false)
  const [password,  setPassword]  = useState("")
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-6 py-12">
      {/* Grid pattern background */}
      <div className="absolute inset-0 -z-10 opacity-[0.08]" style={{
        backgroundImage: `
          linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }}></div>
      
      {/* Decorative circles */}
      <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute bottom-20 right-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl -z-10"></div>
      
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative h-36 w-36 overflow-hidden rounded-2xl bg-muted shadow-xl shadow-primary/10 ring-4 ring-primary/10">
            <Image src="/logotipo_sanatorio.png" alt="Sanatorio El Carmen" fill className="object-contain" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-semibold text-foreground">Torneo Interno</h1>
            <p className="text-base text-muted-foreground mt-1">Sanatorio El Carmen · 2026</p>
          </div>
        </div>

        {!showLogin ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-card border border-border p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Trophy className="h-5 w-5 text-primary" />
                <span>Seleccioná una opción para continuar</span>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/torneo")}
                  className="w-full rounded-xl bg-primary px-4 py-4 text-center text-base font-semibold text-primary-foreground transition-all hover:opacity-90 shadow-md flex items-center justify-center gap-2"
                >
                  <Trophy className="h-5 w-5" />
                  Ver torneo
                </button>
                <button
                  onClick={() => setShowLogin(true)}
                  className="w-full rounded-xl border-2 border-border px-4 py-4 text-center text-base font-semibold text-muted-foreground transition-all hover:border-primary hover:text-foreground flex items-center justify-center gap-2"
                >
                  <Shield className="h-5 w-5" />
                  Administrar
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Acceso exclusivo para personal autorizado
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <button type="button" onClick={() => { setShowLogin(false); setPassword(""); setError("") }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Volver
            </button>
            <div className="rounded-2xl bg-card border border-border p-6 space-y-4 shadow-sm">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Contraseña de administrador</label>
                <div className="relative">
                  <input
                    autoFocus
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-base outline-none transition-colors focus:border-primary placeholder:text-muted-foreground pr-12"
                    placeholder="Ingresá tu contraseña..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
              <button type="submit" disabled={loading || !password}
                className="w-full rounded-xl bg-primary px-4 py-4 text-base font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40 shadow-md flex items-center justify-center gap-2">
                {loading ? "Ingresando..." : <><Shield className="h-5 w-5" /> Ingresar</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
