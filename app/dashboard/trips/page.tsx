"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import {
  Plus,
  Search,
  MoreHorizontal,
  Truck,
  MapPin,
  User,
  Calendar,
  Play,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"
import { ScheduleTripForm } from "@/components/fleet/schedule-trip-form"

interface Trip {
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

interface FleetRoute {
  id: string
  name: string
  originName: string
  destinationName: string
  distance: number
  estimatedDuration: number
  status: string
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [routes, setRoutes] = useState<FleetRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<FleetRoute | null>(null)

  useEffect(() => {
    fetchTrips()
    fetchRoutes()
  }, [])

  const fetchTrips = async () => {
    try {
      const response = await fetch("/api/trips")
      if (response.ok) {
        const data = await response.json()
        setTrips(data)
      }
    } catch (error) {
      console.error("Error fetching trips:", error)
      toast({
        title: "Error",
        description: "Error al cargar los viajes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRoutes = async () => {
    try {
      const response = await fetch("/api/routes")
      if (response.ok) {
        const data = await response.json()
        setRoutes(data.filter((route: FleetRoute) => route.status === "activa"))
      }
    } catch (error) {
      console.error("Error fetching routes:", error)
    }
  }

  const handleScheduleTrip = () => {
    if (routes.length === 0) {
      toast({
        title: "Sin rutas disponibles",
        description: "Debe crear al menos una ruta activa antes de programar viajes",
        variant: "destructive",
      })
      return
    }

    // Seleccionar la primera ruta disponible por defecto
    setSelectedRoute(routes[0])
    setShowScheduleForm(true)
  }

  const handleTripScheduled = (newTrip: Trip) => {
    setTrips((prev) => [newTrip, ...prev])
    fetchTrips() // Refrescar la lista
  }

  const updateTripStatus = async (tripId: string, newStatus: Trip["status"]) => {
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setTrips((prev) => prev.map((trip) => (trip.id === tripId ? { ...trip, status: newStatus } : trip)))
        toast({
          title: "Estado actualizado",
          description: `El viaje ha sido ${newStatus}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar el estado del viaje",
        variant: "destructive",
      })
    }
  }

  const deleteTrip = async (tripId: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este viaje?")) return

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTrips((prev) => prev.filter((trip) => trip.id !== tripId))
        toast({
          title: "Viaje eliminado",
          description: "El viaje ha sido eliminado exitosamente",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar el viaje",
        variant: "destructive",
      })
    }
  }

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.vehiclePlateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.cargo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || trip.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: Trip["status"]) => {
    const statusConfig = {
      programado: { color: "bg-blue-100 text-blue-800", icon: Calendar },
      en_curso: { color: "bg-yellow-100 text-yellow-800", icon: Play },
      completado: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      cancelado: { color: "bg-red-100 text-red-800", icon: XCircle },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
      </Badge>
    )
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDistance = (distance: number) => {
    return `${distance.toLocaleString()} km`
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Estadísticas
  const stats = {
    total: trips.length,
    programado: trips.filter((t) => t.status === "programado").length,
    en_curso: trips.filter((t) => t.status === "en_curso").length,
    completado: trips.filter((t) => t.status === "completado").length,
    cancelado: trips.filter((t) => t.status === "cancelado").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A2463] mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando viajes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Viajes</h1>
          <p className="text-muted-foreground">Programación, seguimiento y control de viajes</p>
        </div>
        <Button onClick={handleScheduleTrip} className="bg-[#0A2463] hover:bg-[#0A2463]/90">
          <Plus className="mr-2 h-4 w-4" />
          Programar Viaje
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programados</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.programado}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Curso</CardTitle>
            <Play className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.en_curso}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completado}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.cancelado}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ruta, vehículo, conductor o carga..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="programado">Programado</SelectItem>
                <SelectItem value="en_curso">En Curso</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de viajes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Viajes</CardTitle>
          <CardDescription>
            {filteredTrips.length} viaje{filteredTrips.length !== 1 ? "s" : ""} encontrado
            {filteredTrips.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ruta</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead>Conductor</TableHead>
                <TableHead>Programado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Carga</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{trip.routeName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-green-600" />
                        {trip.originName}
                        <span className="mx-1">→</span>
                        <MapPin className="h-3 w-3 text-red-600" />
                        {trip.destinationName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistance(trip.distance)} • {formatDuration(trip.estimatedDuration)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-[#0A2463]" />
                      {trip.vehiclePlateNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-[#0A2463]" />
                      {trip.driverName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDateTime(trip.scheduledStart)}</div>
                      <div className="text-muted-foreground">hasta {formatDateTime(trip.scheduledEnd)}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(trip.status)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{trip.cargo}</div>
                      {trip.cargoWeight && <div className="text-sm text-muted-foreground">{trip.cargoWeight} ton</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {trip.status === "programado" && (
                          <DropdownMenuItem onClick={() => updateTripStatus(trip.id, "en_curso")}>
                            <Play className="mr-2 h-4 w-4" />
                            Iniciar viaje
                          </DropdownMenuItem>
                        )}
                        {trip.status === "en_curso" && (
                          <DropdownMenuItem onClick={() => updateTripStatus(trip.id, "completado")}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Completar viaje
                          </DropdownMenuItem>
                        )}
                        {(trip.status === "programado" || trip.status === "en_curso") && (
                          <DropdownMenuItem onClick={() => updateTripStatus(trip.id, "cancelado")}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar viaje
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteTrip(trip.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTrips.length === 0 && (
            <div className="text-center py-8">
              <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No hay viajes</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "No se encontraron viajes con los filtros aplicados"
                  : "Comience programando su primer viaje"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={handleScheduleTrip} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Programar Viaje
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulario de programación */}
      {selectedRoute && (
        <ScheduleTripForm
          open={showScheduleForm}
          onOpenChange={setShowScheduleForm}
          route={selectedRoute}
          onTripScheduled={handleTripScheduled}
        />
      )}
    </div>
  )
}
