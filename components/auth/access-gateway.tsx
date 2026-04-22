"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, Heart, Shield, Trophy, Users } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type UserType = "admin" | "participant"

interface AccessGatewayProps {
  adminRedirectTo?: string
  participantRedirectTo?: string
  backHref?: string
}

export function AccessGateway({
  adminRedirectTo = "/admin",
  participantRedirectTo = "/",
  backHref,
}: AccessGatewayProps) {
  const [userType, setUserType] = useState<UserType | null>(null)
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type)
    setPassword("")
    setError("")
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")

    if (userType === "participant") {
      router.push(participantRedirectTo)
      return
    }

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setError(data?.error || "Credenciales inválidas")
        setLoading(false)
        return
      }

      router.push(adminRedirectTo)
      router.refresh()
    } catch {
      setError("No se pudo iniciar sesión. Intentá nuevamente.")
      setLoading(false)
    }
  }

  const handleBack = () => {
    setUserType(null)
    setPassword("")
    setError("")
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="hidden rounded-3xl border border-border bg-card/50 p-8 lg:block">
            <div className="mb-8 flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-primary/10">
                <Image src="/logosanatorio.avif" alt="Logo Sanatorio El Carmen" fill className="object-contain p-2" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Sanatorio El Carmen</p>
                <h1 className="font-serif text-3xl font-semibold text-foreground">Torneo interno 2025</h1>
              </div>
            </div>

            <p className="max-w-xl text-lg text-muted-foreground">
              Elegí cómo querés entrar. Como participante solo ves el avance del torneo. Como admin gestionás disciplinas, partidos y resultados.
            </p>

            <div className="mt-8 grid gap-4">
              {[
                {
                  title: "Participante",
                  description: "Acceso rápido para seguir fixtures, posiciones y cruces sin fricción.",
                  icon: Users,
                },
                {
                  title: "Administrador",
                  description: "Ingreso protegido para actualizar el torneo y mantener la información al día.",
                  icon: Shield,
                },
                {
                  title: "Objetivo",
                  description: "Una sola entrada clara para que nadie se pierda. MENOS ruido, más torneo.",
                  icon: Trophy,
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 rounded-2xl border border-border bg-background p-4">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-medium text-foreground">{item.title}</h2>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Card className="w-full border-border shadow-sm">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 lg:hidden">
                <Heart className="h-10 w-10 text-primary" />
              </div>
              <div>
                <CardTitle className="font-serif text-2xl">Ingresar al torneo</CardTitle>
                <CardDescription>
                  Elegí tu perfil para continuar.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              {!userType ? (
                <div className="space-y-4">
                  <Button
                    onClick={() => handleUserTypeSelect("participant")}
                    className="h-auto w-full justify-start gap-4 rounded-2xl border border-border px-4 py-4 text-left"
                    variant="outline"
                  >
                    <div className="rounded-xl bg-primary/10 p-3">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Entrar como participante</div>
                      <div className="text-sm text-muted-foreground">Sin login. Solo para seguir el torneo.</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleUserTypeSelect("admin")}
                    className="h-auto w-full justify-start gap-4 rounded-2xl border border-border px-4 py-4 text-left"
                    variant="outline"
                  >
                    <div className="rounded-xl bg-primary/10 p-3">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Entrar como administrador</div>
                      <div className="text-sm text-muted-foreground">Requiere contraseña para gestionar el torneo.</div>
                    </div>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1 text-center">
                    <h3 className="text-lg font-medium text-foreground">
                      {userType === "admin" ? "Acceso administrador" : "Acceso participante"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {userType === "admin"
                        ? "Ingresá la contraseña para abrir el panel de gestión."
                        : "No necesitás credenciales. Continuá y listo."}
                    </p>
                  </div>

                  {userType === "admin" && (
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium text-foreground">
                        Contraseña
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2"
                        placeholder="Ingresá la contraseña"
                        required
                      />
                    </div>
                  )}

                  {error ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1" onClick={handleBack}>
                      Atrás
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? "Ingresando..." : "Continuar"}
                    </Button>
                  </div>
                </form>
              )}

              {backHref ? (
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <Link href={backHref} className="font-medium text-primary hover:underline">
                    Volver al inicio
                  </Link>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
