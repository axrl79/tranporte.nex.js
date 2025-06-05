"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle, Route, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

interface ToggleRouteStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  route: any
  onStatusChanged?: (route: any) => void
}

export function ToggleRouteStatusDialog({ open, onOpenChange, route, onStatusChanged }: ToggleRouteStatusDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!route) return null

  async function handleToggleStatus() {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/routes/${route.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !route.active }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al cambiar el estado")
      }

      const updatedRoute = await response.json()

      toast({
        title: updatedRoute.active ? "Ruta activada" : "Ruta desactivada",
        description: `La ruta ${route.name} ha sido ${updatedRoute.active ? "activada" : "desactivada"} correctamente.`,
      })

      if (onStatusChanged) {
        onStatusChanged(updatedRoute)
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cambiar el estado",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl">{route.active ? "Desactivar Ruta" : "Activar Ruta"}</DialogTitle>
          <DialogDescription>
            {route.active
              ? "La ruta no estará disponible para programar nuevos viajes."
              : "La ruta estará disponible para programar nuevos viajes."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4 gap-4">
          <div className="h-16 w-16 rounded-full bg-[#F2E9DC] flex items-center justify-center">
            <Route className="h-8 w-8 text-[#0A2463]" />
          </div>

          <div className="text-center">
            <h3 className="font-medium text-lg">{route.name}</h3>
            <p className="text-sm text-muted-foreground">
              {route.originName} → {route.destinationName}
            </p>
          </div>

          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 ${
              route.active ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
          >
            {route.active ? (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>Actualmente Activa</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5" />
                <span>Actualmente Inactiva</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">
              {route.active
                ? "Esta acción impedirá que se programen nuevos viajes para esta ruta."
                : "Esta acción permitirá que se programen nuevos viajes para esta ruta."}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleToggleStatus}
            className={route.active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Procesando..." : route.active ? "Desactivar Ruta" : "Activar Ruta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
