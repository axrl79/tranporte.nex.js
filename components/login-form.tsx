"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Truck, Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 1500)
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
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Usuario</Label>
              <div className="relative">
                <Input id="email" placeholder="Ingrese su usuario" required className="pl-10 bg-cream border-navy/20" />
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
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-navy/50" />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-navy/50 hover:text-navy/70"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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