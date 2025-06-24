export interface Trip {
  id: string
  routeId: string
  routeName: string
  vehicleId: string
  vehiclePlateNumber: string
  driverId: string
  driverName: string
  scheduledStart: string
  scheduledEnd: string
  actualStart?: string
  actualEnd?: string
  status: "programado" | "en_curso" | "completado" | "cancelado"
  cargo: string
  cargoWeight?: number
  notes?: string
  originName: string
  destinationName: string
  distance: number
  estimatedDuration: number
}

export interface FleetRoute {
  id: string
  name: string
  originName: string
  destinationName: string
  distance: number
  estimatedDuration: number
  status: string
}