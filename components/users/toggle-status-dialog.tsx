"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ToggleStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
  onStatusChanged?: (user: any) => void
}

export function ToggleStatusDialog({ open, onOpenChange, user, onStatusChanged }: ToggleStatusDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!user) return null

  async function handleToggleStatus() {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !user.active }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al cambiar el estado")
      }

      const updatedUser = await response.json()

      toast({
        title: updatedUser.active ? "Usuario activado" : "Usuario desactivado",
        description: `${user.name} ha sido ${updatedUser.active ? "activado" : "desactivado"} correctamente.`,
      })

      if (onStatusChanged) {
        onStatusChanged(updatedUser)
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
          <DialogTitle className="text-xl">{user.active ? "Desactivar Usuario" : "Activar Usuario"}</DialogTitle>
          <DialogDescription>
            {user.active
              ? "El usuario no podrá acceder al sistema después de esta acción."
              : "El usuario podrá acceder al sistema después de esta acción."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-4 gap-4">
          <Avatar className="h-16 w-16 border-2 border-[#F2E9DC]">
            <AvatarFallback className="bg-[#0A2463] text-[#F2E9DC] text-xl">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>

          <div className="text-center">
            <h3 className="font-medium text-lg">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 ${
              user.active ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
          >
            {user.active ? (
              <>
                <XCircle className="h-5 w-5" />
                <span>Actualmente Activo</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>Actualmente Inactivo</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">
              {user.active
                ? "Esta acción impedirá que el usuario inicie sesión."
                : "Esta acción permitirá que el usuario inicie sesión."}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleToggleStatus}
            className={user.active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Procesando..." : user.active ? "Desactivar Usuario" : "Activar Usuario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
