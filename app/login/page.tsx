"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Users, AlertCircle, Heart } from "lucide-react"
import Image from "next/image"

type UserType = "admin" | "participant"

export default function LoginPage() {
  const [userType, setUserType] = useState<UserType | null>(null)
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (userType === "participant") {
      // Participants don't need authentication, redirect to home
      router.push("/")
      return
    }

    if (userType === "admin") {
      try {
        const response = await fetch("/api/admin/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        })

        if (response.ok) {
          router.push("/admin")
        } else {
          const data = await response.json()
          setError(data.error || "Credenciales inválidas")
        }
      } catch (err) {
        setError("Error de conexión")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleBack = () => {
    setUserType(null)
    setPassword("")
    setError("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* Logo del Sanatorio */}
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <Image
              src="/logosanatorio.avif"
              alt="Logo Sanatorio El Carmen"
              fill
              className="object-contain"
              onError={(e) => {
                // Fallback si el logo no carga
                e.currentTarget.style.display = 'none'
                const fallback = e.currentTarget.parentElement?.querySelector('.fallback-logo')
                if (fallback) (fallback as HTMLElement).style.display = 'flex'
              }}
            />
            <div className="fallback-logo hidden w-full h-full bg-primary/10 rounded-xl items-center justify-center">
              <Heart className="w-10 h-10 text-primary" />
            </div>
          </div>

          <CardTitle className="text-2xl font-serif">Torneo Interno</CardTitle>
          <CardDescription className="text-primary font-semibold">
            Sanatorio El Carmen - Edición 2025
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!userType ? (
            // Selección de tipo de usuario
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium mb-2">¿Cómo deseas acceder?</h3>
                <p className="text-sm text-muted-foreground">
                  Selecciona tu rol para continuar
                </p>
              </div>

              <Button
                onClick={() => handleUserTypeSelect("participant")}
                className="w-full h-16 flex items-center gap-3"
                variant="outline"
              >
                <Users className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-medium">Participante</div>
                  <div className="text-xs text-muted-foreground">Ver fixtures y posiciones</div>
                </div>
              </Button>

              <Button
                onClick={() => handleUserTypeSelect("admin")}
                className="w-full h-16 flex items-center gap-3"
                variant="outline"
              >
                <Shield className="w-6 h-6" />
                <div className="text-left">
                  <div className="font-medium">Administrador</div>
                  <div className="text-xs text-muted-foreground">Gestionar torneo</div>
                </div>
              </Button>
            </div>
          ) : (
            // Formulario de login para admin
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium mb-2">
                  Acceso de {userType === "admin" ? "Administrador" : "Participante"}
                </h3>
                {userType === "participant" ? (
                  <p className="text-sm text-muted-foreground">
                    Haz clic en continuar para acceder como participante
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Ingresa la contraseña de administrador
                  </p>
                )}
              </div>

              {userType === "admin" && (
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    placeholder="Ingresa la contraseña"
                    required
                  />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Atrás
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? "Ingresando..." : "Continuar"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}