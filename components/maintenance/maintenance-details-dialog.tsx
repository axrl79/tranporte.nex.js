"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Separator from "@/components/ui/separator"
import { Calendar, Clock, DollarSign, User, Wrench, FileText, Truck } from "lucide-react"

interface MaintenanceDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  maintenance: any
  onEdit?: () => void
}

export function MaintenanceDetailsDialog({ open, onOpenChange, maintenance, onEdit }: MaintenanceDetailsDialogProps) {
  if (!maintenance) return null

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(Number(amount))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "programado":
        return "bg-blue-100 text-blue-800"
      case "en_proceso":
        return "bg-yellow-100 text-yellow-800"
      case "completado":
        return "bg-green-100 text-green-800"
      case "cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalles del Mantenimiento</DialogTitle>
          <DialogDescription>Información completa del mantenimiento programado</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del vehículo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5 text-[#0A2463]" />
                Información del Vehículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Placa</p>
                  <p className="font-semibold">{maintenance.vehicle?.plateNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Marca/Modelo</p>
                  <p className="font-semibold">
                    {maintenance.vehicle?.brand} {maintenance.vehicle?.model}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Año</p>
                  <p className="font-semibold">{maintenance.vehicle?.year}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                  <p className="font-semibold">{maintenance.vehicle?.type}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del mantenimiento */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="h-5 w-5 text-[#0A2463]" />
                Detalles del Mantenimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                  <Badge variant="outline" className="mt-1">
                    {maintenance.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <Badge className={`mt-1 ${getStatusColor(maintenance.status)}`}>{maintenance.status}</Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                <p className="mt-1">{maintenance.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#0A2463]" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha Programada</p>
                    <p className="font-semibold">{formatDate(maintenance.scheduledDate)}</p>
                  </div>
                </div>

                {maintenance.completedDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fecha Completada</p>
                      <p className="font-semibold">{formatDate(maintenance.completedDate)}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[#0A2463]" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Técnico Asignado</p>
                    <p className="font-semibold">{maintenance.technician?.name || "Sin asignar"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Costo</p>
                    <p className="font-semibold">{formatCurrency(maintenance.cost)}</p>
                  </div>
                </div>
              </div>

              {maintenance.notes && (
                <>
                  <Separator />
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-[#0A2463] mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Notas Adicionales</p>
                      <p className="mt-1">{maintenance.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Información de auditoría */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Información de Registro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Creado</p>
                  <p>{formatDate(maintenance.createdAt)}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Última Actualización</p>
                  <p>{formatDate(maintenance.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          {onEdit && (
            <Button onClick={onEdit} className="bg-[#0A2463] hover:bg-[#0A2463]/90">
              Editar Mantenimiento
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
