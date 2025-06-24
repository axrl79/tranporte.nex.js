"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatWithOptions } from "date-fns/fp"
import { es } from "date-fns/locale"

export interface Employee {
  code: string
  fullName: string
  position: string
  type: string
  status: string
  createdAt: string | Date
  email?: string
  phone?: string
  address?: string
  licenseExpiry?: string | Date
  medicalCertExpiry?: string | Date
}

interface EmployeeViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee
}

// Función helper para formatear fechas de manera segura
const safeFormatDate = (date: string | Date | undefined, fallback = "N/A") => {
  if (!date) return fallback
  try {
    return formatWithOptions({ locale: es }, "PPP")(new Date(date))
  } catch (error) {
    console.error("Error formatting date:", error)
    return fallback
  }
}

export function EmployeeViewDialog({ open, onOpenChange, employee }: EmployeeViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalles del Empleado</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* ... (otros campos permanecen igual) ... */}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Fecha de Ingreso</h4>
              <p className="text-sm">
                {safeFormatDate(employee.createdAt)}
              </p>
            </div>
          </div>
          
          {/* ... (otros campos permanecen igual) ... */}
          
          {(employee.type === "conductor" || employee.type === "mecanico") && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Licencia de Conducir</h4>
                <p className="text-sm">
                  {safeFormatDate(employee.licenseExpiry)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Certificado Médico</h4>
                <p className="text-sm">
                  {safeFormatDate(employee.medicalCertExpiry)}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}