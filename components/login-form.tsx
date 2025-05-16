"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Truck, Lock, AlertCircle, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión")
      }

      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${data.user.name}`,
      })

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      console.error("Error de login:", err)
      setError(err instanceof Error ? err.message : "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-navy shadow-lg">
      <CardHeader className="bg-navy text-cream rounded-t-lg">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-cream p-3 rounded-full">
            <Truck className="h-8 w-8 text-navy" />
          </div>
        </div>
        <CardTitle className="text-center text-2xl font-bold">Sistema de Gestión Logística</CardTitle>
        <CardDescription className="text-center text-beige">Control Operativo para Transporte Seguro</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 bg-beige/20">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Ingrese su email"
                  required
                  className="pl-10 bg-cream border-navy/20"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <Shield className="absolute left-3 top-2.5 h-5 w-5 text-navy/50" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingrese su contraseña"
                  required
                  className="pl-10 pr-10 bg-cream border-navy/20"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-navy/50" />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute right-3 top-2.5 h-5 w-5 text-navy/50"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full mt-6 bg-crimson hover:bg-crimson/90 text-cream" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center bg-beige/20 rounded-b-lg text-xs text-navy/70">
        Sistema de Gestión Logística y Control Operativo © 2025
      </CardFooter>
    </Card>
  )
}
