"use client"

import { MapPin, Route, Clock, Calendar, ArrowRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RouteDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  route: any
  onEdit: () => void
  onScheduleTrip: () => void
  onViewMap: () => void
}

export function RouteDetailsDialog({
  open,
  onOpenChange,
  route,
  onEdit,
  onScheduleTrip,
  onViewMap,
}: RouteDetailsDialogProps) {
  if (!route) return null

  // Formatear distancia
  const formatDistance = (distance: string | number) => {
    const dist = typeof distance === "string" ? Number.parseFloat(distance) : distance
    return dist.toLocaleString() + " km"
  }

  // Formatear duración
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Route className="h-5 w-5 text-[#0A2463]" />
            Detalles de Ruta
          </DialogTitle>
          <DialogDescription>Información detallada de la ruta seleccionada</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Encabezado con nombre y estado */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{route.name}</h2>
              <p className="text-muted-foreground">Creada el {formatDate(route.createdAt)}</p>
            </div>
            <Badge className={route.active ? "bg-green-500" : "bg-gray-500"}>
              {route.active ? "Activa" : "Inactiva"}
            </Badge>
          </div>

          {/* Descripción */}
          {route.description && (
            <div className="bg-[#F2E9DC]/30 p-4 rounded-md">
              <h3 className="font-medium mb-1">Descripción</h3>
              <p className="text-sm">{route.description}</p>
            </div>
          )}

          {/* Origen y Destino */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  Punto de Origen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium text-lg">{route.originName}</div>
                  <div className="text-sm text-muted-foreground">
                    Coordenadas: {Number.parseFloat(route.originLat).toFixed(4)},{" "}
                    {Number.parseFloat(route.originLng).toFixed(4)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  Punto de Destino
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium text-lg">{route.destinationName}</div>
                  <div className="text-sm text-muted-foreground">
                    Coordenadas: {Number.parseFloat(route.destinationLat).toFixed(4)},{" "}
                    {Number.parseFloat(route.destinationLng).toFixed(4)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información de la ruta */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Información de la Ruta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Distancia Total</div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-[#0A2463]" />
                    <span className="font-medium text-lg">{formatDistance(route.distance)}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Duración Estimada</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#0A2463]" />
                    <span className="font-medium text-lg">{formatDuration(route.estimatedDuration)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas de uso (simuladas) */}
          <Card className="bg-[#F2E9DC]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Estadísticas de Uso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Viajes Totales</div>
                  <div className="font-medium text-lg">12</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Último Viaje</div>
                  <div className="font-medium">15/04/2023</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Próximo Viaje</div>
                  <div className="font-medium">22/05/2023</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-3 justify-end">
            <Button variant="outline" onClick={onViewMap}>
              Ver en Mapa
            </Button>
            <Button variant="outline" onClick={onEdit}>
              Editar Ruta
            </Button>
            <Button className="bg-[#0A2463] hover:bg-[#0A2463]/90" onClick={onScheduleTrip}>
              <Calendar className="mr-2 h-4 w-4" />
              Programar Viaje
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
