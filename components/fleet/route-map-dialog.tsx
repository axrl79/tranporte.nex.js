"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface RouteMapDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  route: any
}

export function RouteMapDialog({ open, onOpenChange, route }: RouteMapDialogProps) {
  const [mapLoaded, setMapLoaded] = useState(false)

  if (!route) return null

  // Formatear distancia
  const formatDistance = (distance: string | number) => {
    const dist = typeof distance === "string" ? Number.parseFloat(distance) : distance
    return dist.toLocaleString() + " km"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#0A2463]" />
            Mapa de Ruta: {route.name}
          </DialogTitle>
          <DialogDescription>Visualización de la ruta en el mapa</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información de la ruta */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600">
                <MapPin className="h-3 w-3 mr-1" />
                {route.originName}
              </Badge>
              <span className="text-sm">→</span>
              <Badge className="bg-red-600">
                <MapPin className="h-3 w-3 mr-1" />
                {route.destinationName}
              </Badge>
            </div>
            <Badge variant="outline">{formatDistance(route.distance)}</Badge>
          </div>

          {/* Mapa simulado */}
          <div className="relative h-[500px] bg-[#F2E9DC]/30 rounded-md border overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="h-16 w-16 mx-auto rounded-full bg-[#0A2463]/10 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-[#0A2463]/50" />
                </div>
                <h3 className="mt-4 text-lg font-medium">Visualización del Mapa</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Aquí se mostraría el mapa con la ruta trazada entre {route.originName} y {route.destinationName}
                </p>
              </div>
            </div>

            {/* Simulación de puntos en el mapa */}
            <div className="absolute top-1/4 left-1/4">
              <div className="h-6 w-6 rounded-full bg-green-600 flex items-center justify-center text-white animate-pulse">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="mt-1 bg-white px-2 py-1 rounded text-xs shadow-md">{route.originName}</div>
            </div>

            <div className="absolute bottom-1/4 right-1/4">
              <div className="h-6 w-6 rounded-full bg-red-600 flex items-center justify-center text-white animate-pulse">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="mt-1 bg-white px-2 py-1 rounded text-xs shadow-md">{route.destinationName}</div>
            </div>

            {/* Línea simulada entre puntos */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <svg width="100%" height="100%" className="absolute inset-0">
                <line
                  x1="25%"
                  y1="25%"
                  x2="75%"
                  y2="75%"
                  stroke="#0A2463"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="animate-dash"
                />
              </svg>
            </div>
          </div>

          {/* Información adicional */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-[#F2E9DC]/30 rounded-md">
              <div className="font-medium">Origen</div>
              <div className="text-muted-foreground">
                {Number.parseFloat(route.originLat).toFixed(4)}, {Number.parseFloat(route.originLng).toFixed(4)}
              </div>
            </div>
            <div className="p-3 bg-[#F2E9DC]/30 rounded-md">
              <div className="font-medium">Destino</div>
              <div className="text-muted-foreground">
                {Number.parseFloat(route.destinationLat).toFixed(4)},{" "}
                {Number.parseFloat(route.destinationLng).toFixed(4)}
              </div>
            </div>
            <div className="p-3 bg-[#F2E9DC]/30 rounded-md">
              <div className="font-medium">Distancia</div>
              <div className="text-muted-foreground">{formatDistance(route.distance)}</div>
            </div>
          </div>

          <div className="text-xs text-center text-muted-foreground">
            Nota: Esta es una visualización simulada. En una implementación real, se integraría con servicios de mapas
            como Google Maps o Mapbox.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
