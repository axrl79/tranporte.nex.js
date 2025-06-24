"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, User, Route, Package, Calendar, MapPin } from "lucide-react"

interface TripDetailsDialogProps {
  trip: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TripDetailsDialog({ trip, open, onOpenChange }: TripDetailsDialogProps) {
  if (!trip) return null

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "programado":
        return "bg-blue-100 text-blue-800"
      case "en_curso":
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Detalles del Viaje
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado y información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Estado del Viaje
                <Badge className={getStatusColor(trip.status)}>{trip.status.replace("_", " ").toUpperCase()}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">ID del Viaje</Label>
                  <p className="text-sm text-muted-foreground">{trip.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Fecha de Creación</Label>
                  <p className="text-sm text-muted-foreground">{formatDate(trip.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del vehículo y conductor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Vehículo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">Placa</Label>
                    <p className="font-medium">{trip.vehicle?.plateNumber || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tipo</Label>
                    <p className="text-sm text-muted-foreground">{trip.vehicle?.type || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Modelo</Label>
                    <p className="text-sm text-muted-foreground">{trip.vehicle?.model || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Conductor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">Nombre</Label>
                    <p className="font-medium">{trip.driver?.name || "Sin asignar"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-muted-foreground">{trip.driver?.email || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Teléfono</Label>
                    <p className="text-sm text-muted-foreground">{trip.driver?.phone || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información de la ruta */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Ruta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nombre de la Ruta</Label>
                  <p className="font-medium">{trip.route?.name || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Origen</Label>
                  <p className="text-sm text-muted-foreground">{trip.route?.originName || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Destino</Label>
                  <p className="text-sm text-muted-foreground">{trip.route?.destinationName || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Horarios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Horarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Inicio Programado</Label>
                  <p className="font-medium">{formatDate(trip.scheduledStart)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Fin Programado</Label>
                  <p className="font-medium">{formatDate(trip.scheduledEnd)}</p>
                </div>
                {trip.actualStart && (
                  <div>
                    <Label className="text-sm font-medium">Inicio Real</Label>
                    <p className="font-medium">{formatDate(trip.actualStart)}</p>
                  </div>
                )}
                {trip.actualEnd && (
                  <div>
                    <Label className="text-sm font-medium">Fin Real</Label>
                    <p className="font-medium">{formatDate(trip.actualEnd)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información de la carga */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Carga
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Descripción</Label>
                  <p className="font-medium">{trip.cargo || "N/A"}</p>
                </div>
                {trip.cargoWeight && (
                  <div>
                    <Label className="text-sm font-medium">Peso (Toneladas)</Label>
                    <p className="font-medium">{trip.cargoWeight}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Métricas del viaje */}
          {(trip.fuelConsumed || trip.kmTraveled) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Métricas del Viaje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trip.fuelConsumed && (
                    <div>
                      <Label className="text-sm font-medium">Combustible Consumido (L)</Label>
                      <p className="font-medium">{trip.fuelConsumed}</p>
                    </div>
                  )}
                  {trip.kmTraveled && (
                    <div>
                      <Label className="text-sm font-medium">Kilómetros Recorridos</Label>
                      <p className="font-medium">{trip.kmTraveled}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notas */}
          {trip.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notas Adicionales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{trip.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
