import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Truck, Calendar, Wrench, Check, Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function VehicleDetailsDialog({ open, onOpenChange, vehicle, onEdit }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: any
  onEdit: () => void
}) {
  if (!vehicle) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "disponible": return <Check className="h-4 w-4 text-green-500" />
      case "en_ruta": return <MapPin className="h-4 w-4 text-blue-500" />
      case "mantenimiento": return <Wrench className="h-4 w-4 text-yellow-500" />
      case "inactivo": return <Clock className="h-4 w-4 text-gray-500" />
      default: return <Truck className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalles del Vehículo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Información Básica</h3>
              <div className="mt-2 space-y-1 text-sm">
                <div><span className="text-muted-foreground">Placa:</span> {vehicle.plateNumber}</div>
                <div><span className="text-muted-foreground">Marca:</span> {vehicle.brand}</div>
                <div><span className="text-muted-foreground">Modelo:</span> {vehicle.model}</div>
                <div><span className="text-muted-foreground">Año:</span> {vehicle.year}</div>
              </div>
            </div>
            <div>
              <h3 className="font-medium">Estado y Capacidad</h3>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center">
                  <span className="text-muted-foreground">Estado:</span> 
                  <Badge variant="outline" className="ml-2">
                    {getStatusIcon(vehicle.status)}
                    <span className="ml-1">{vehicle.status}</span>
                  </Badge>
                </div>
                <div><span className="text-muted-foreground">Capacidad:</span> {vehicle.capacity} ton</div>
                <div><span className="text-muted-foreground">Último mantenimiento:</span> {vehicle.lastMaintenance || 'N/A'}</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-medium">Especificaciones Técnicas</h3>
            <div className="mt-2 text-sm text-muted-foreground">
              {vehicle.specifications || 'No hay especificaciones adicionales.'}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={onEdit}>
            Editar Vehículo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}