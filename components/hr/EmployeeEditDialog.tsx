"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
// Define the Employee type here if not available elsewhere
export interface Employee {
  id: string
  code: string
  fullName: string
  position: string
  type: "conductor" | "mecanico" | "administrativo"
  email?: string
  phone?: string
  address?: string
  status: "activo" | "inactivo"
  licenseExpiry?: string
  medicalCertExpiry?: string
  createdAt: string
}
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

interface EmployeeEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee
  onEmployeeUpdated: (employee: Employee) => void
}

export function EmployeeEditDialog({ open, onOpenChange, employee, onEmployeeUpdated }: EmployeeEditDialogProps) {
  const [formData, setFormData] = useState<Omit<Employee, "id" | "code" | "createdAt">>({
    fullName: employee.fullName,
    position: employee.position,
    type: employee.type,
    email: employee.email,
    phone: employee.phone,
    address: employee.address,
    status: employee.status,
    licenseExpiry: employee.licenseExpiry,
    medicalCertExpiry: employee.medicalCertExpiry
  })

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar empleado")
      }

      const updatedEmployee = await response.json()
      onEmployeeUpdated(updatedEmployee)
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating employee:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el empleado",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Empleado</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleChange("position", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value as any)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conductor">Conductor</SelectItem>
                  <SelectItem value="mecanico">Mecánico</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value as any)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>

          {(formData.type === "conductor" || formData.type === "mecanico") && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licenseExpiry">Vencimiento Licencia</Label>
                <Input
                  id="licenseExpiry"
                  type="date"
                  value={formData.licenseExpiry ? formData.licenseExpiry.split('T')[0] : ""}
                  onChange={(e) => handleChange("licenseExpiry", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicalCertExpiry">Vencimiento Cert. Médico</Label>
                <Input
                  id="medicalCertExpiry"
                  type="date"
                  value={formData.medicalCertExpiry ? formData.medicalCertExpiry.split('T')[0] : ""}
                  onChange={(e) => handleChange("medicalCertExpiry", e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}