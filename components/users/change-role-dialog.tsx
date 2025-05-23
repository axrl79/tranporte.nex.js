"use client"

import { useState } from "react"
import { Shield, ShieldAlert, User } from "lucide-react"

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface ChangeRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
  onRoleChanged?: (user: any) => void
}

export function ChangeRoleDialog({ open, onOpenChange, user, onRoleChanged }: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Actualizar el rol seleccionado cuando cambia el usuario
  useState(() => {
    if (user) {
      setSelectedRole(user.role)
    }
  })

  if (!user) return null

  const roles = [
    {
      value: "admin",
      label: "Administrador",
      icon: ShieldAlert,
      description: "Acceso completo al sistema, incluyendo gestión de usuarios y configuración.",
      color: "bg-[#0A2463]",
      textColor: "text-white",
    },
    {
      value: "operador",
      label: "Operador",
      icon: Shield,
      description: "Acceso a gestión de flota, rutas y reportes. Sin acceso a configuración avanzada.",
      color: "bg-[#F9DC5C]",
      textColor: "text-[#0A2463]",
    },
    {
      value: "conductor",
      label: "Conductor",
      icon: User,
      description: "Acceso limitado a rutas asignadas y reportes básicos.",
      color: "bg-gray-100",
      textColor: "text-gray-900",
    },
  ]

  async function handleSubmit() {
    if (!selectedRole || selectedRole === user.role) {
      onOpenChange(false)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al cambiar el rol")
      }

      const updatedUser = await response.json()

      toast({
        title: "Rol actualizado",
        description: `El rol de ${user.name} ha sido cambiado a ${
          roles.find((r) => r.value === selectedRole)?.label || selectedRole
        }.`,
      })

      if (onRoleChanged) {
        onRoleChanged(updatedUser)
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cambiar el rol",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Cambiar Rol de Usuario</DialogTitle>
          <DialogDescription>Seleccione el nuevo rol para este usuario</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-12 w-12 border-2 border-[#F2E9DC]">
            <AvatarFallback className="bg-[#0A2463] text-[#F2E9DC]">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-2 mb-2">
          <div className="text-sm font-medium">Rol Actual:</div>
          <Badge
            className={`${
              roles.find((r) => r.value === user.role)?.color || "bg-gray-200"
            } ${roles.find((r) => r.value === user.role)?.textColor || "text-gray-900"}`}
          >
            {roles.find((r) => r.value === user.role)?.label || user.role}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-medium">Seleccione el nuevo rol:</div>
          <RadioGroup value={selectedRole} onValueChange={setSelectedRole} className="gap-4">
            {roles.map((role) => (
              <div
                key={role.value}
                className={`flex items-start space-x-3 border rounded-lg p-4 ${
                  selectedRole === role.value ? "border-[#0A2463] bg-[#F2E9DC]/20" : "border-gray-200"
                }`}
              >
                <RadioGroupItem value={role.value} id={role.value} className="mt-1" />
                <div className="flex-1 space-y-1">
                  <Label htmlFor={role.value} className="flex items-center gap-2 text-base font-medium cursor-pointer">
                    <role.icon className="h-5 w-5" />
                    {role.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#0A2463] hover:bg-[#0A2463]/90"
            disabled={isSubmitting || selectedRole === user.role || !selectedRole}
          >
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
