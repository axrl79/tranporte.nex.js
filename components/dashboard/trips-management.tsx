"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  Truck,
} from "lucide-react"
import { ScheduleTripForm } from "@/components/fleet/schedule-trip-form"

// Define types for the component
type Vehicle = {
  id: string
  plateNumber: string
  status: string
}

type Driver = {
  id: string
  fullName: string
}

type Route = {
  id: string
  name: string
}

type Trip = {
  id: string
  vehicle: Vehicle
  driver: Driver
  route: Route
  status: 'programado' | 'en_curso' | 'completado' | 'cancelado'
  scheduledStart: string
  scheduledEnd?: string
  notes?: string
  vehicleId: string
  driverId: string
}

type TripsManagementProps = {
  trips: Trip[]
  onRefresh: () => Promise<void>
}

export function TripsManagement({ trips: initialTrips, onRefresh }: TripsManagementProps) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips)
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>(initialTrips)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [vehicleFilter, setVehicleFilter] = useState("all")
  const [driverFilter, setDriverFilter] = useState("all")
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])

  const fetchAdditionalData = async () => {
    try {
      setIsLoading(true)
      const [vehiclesRes, driversRes] = await Promise.all([
        fetch("/api/vehicles"),
        fetch("/api/employees?type=conductor"),
      ])

      const [vehiclesData, driversData] = await Promise.all([
        vehiclesRes.json(),
        driversRes.json(),
      ])

      setVehicles(vehiclesData)
      setDrivers(driversData)
    } catch (error) {
      console.error("Error loading additional data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos adicionales",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAdditionalData()
  }, [])

  useEffect(() => {
    setTrips(initialTrips)
  }, [initialTrips])

  useEffect(() => {
    let filtered = trips

    // Apply filters
    if (searchTerm) {
      filtered = filtered.filter(
        (trip) =>
          trip.vehicle?.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trip.driver?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trip.route?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((trip) => trip.status === statusFilter)
    }

    if (vehicleFilter !== "all") {
      filtered = filtered.filter((trip) => trip.vehicleId === vehicleFilter)
    }

    if (driverFilter !== "all") {
      filtered = filtered.filter((trip) => trip.driverId === driverFilter)
    }

    setFilteredTrips(filtered)
  }, [trips, searchTerm, statusFilter, vehicleFilter, driverFilter])

  const handleStatusChange = async (tripId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el estado del viaje")
      }

      const updatedTrip = await response.json()

      setTrips((prev) => prev.map((trip) => (trip.id === tripId ? updatedTrip : trip)))

      toast({
        title: "Éxito",
        description: `Estado del viaje actualizado a ${newStatus}`,
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del viaje",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este viaje?")) {
      return
    }

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el viaje")
      }

      setTrips((prev) => prev.filter((trip) => trip.id !== tripId))
      await onRefresh()

      toast({
        title: "Éxito",
        description: "Viaje eliminado correctamente",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el viaje",
        variant: "destructive",
      })
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "programado":
        return <Clock className="h-4 w-4" />
      case "en_curso":
        return <Play className="h-4 w-4" />
      case "completado":
        return <CheckCircle className="h-4 w-4" />
      case "cancelado":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

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

  const handleTripScheduled = (newTrip: Trip) => {
    setTrips((prev) => [newTrip, ...prev])
    setShowScheduleForm(false)
    onRefresh()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2463] mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Cargando viajes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Viajes</CardTitle>
              <CardDescription>Programación, seguimiento y control de viajes</CardDescription>
            </div>
            <Button onClick={() => setShowScheduleForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Programar Viaje
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por vehículo, conductor o ruta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <div>
                <Label htmlFor="status-filter">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="programado">Programado</SelectItem>
                    <SelectItem value="en_curso">En Curso</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vehicle-filter">Vehículo</Label>
                <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plateNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="driver-filter">Conductor</Label>
                <Select value={driverFilter} onValueChange={setDriverFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Conductor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tabla de Viajes */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Conductor</TableHead>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Fecha Programada</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrips.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <MapPin className="mx-auto h-12 w-12 mb-4" />
                        <p>No se encontraron viajes</p>
                        <p className="text-sm">Intenta ajustar los filtros o programa un nuevo viaje</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTrips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{trip.vehicle?.plateNumber || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{trip.driver?.fullName || "Sin asignar"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{trip.route?.name || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(trip.scheduledStart)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(trip.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(trip.status)}
                            <span>{trip.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {trip.status === "completado"
                            ? "100%"
                            : trip.status === "en_curso"
                              ? "En progreso"
                              : trip.status === "programado"
                                ? "Pendiente"
                                : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setSelectedTrip(trip)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalles
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {trip.status === "programado" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(trip.id, "en_curso")}>
                                <Play className="mr-2 h-4 w-4" />
                                Iniciar Viaje
                              </DropdownMenuItem>
                            )}
                            {trip.status === "en_curso" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(trip.id, "completado")}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Completar Viaje
                              </DropdownMenuItem>
                            )}
                            {(trip.status === "programado" || trip.status === "en_curso") && (
                              <DropdownMenuItem onClick={() => handleStatusChange(trip.id, "cancelado")}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancelar Viaje
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteTrip(trip.id)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {trips.filter((t) => t.status === "programado").length}
              </div>
              <div className="text-sm text-blue-600">Programados</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {trips.filter((t) => t.status === "en_curso").length}
              </div>
              <div className="text-sm text-yellow-600">En Curso</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {trips.filter((t) => t.status === "completado").length}
              </div>
              <div className="text-sm text-green-600">Completados</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {trips.filter((t) => t.status === "cancelado").length}
              </div>
              <div className="text-sm text-red-600">Cancelados</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de programación de viajes */}
      <ScheduleTripForm
        open={showScheduleForm}
        onOpenChange={setShowScheduleForm}
        route={null}
        onTripScheduled={handleTripScheduled}
      />

      {/* Diálogo de detalles del viaje */}
      {selectedTrip && (
        <Dialog open={!!selectedTrip} onOpenChange={() => setSelectedTrip(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Viaje</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vehículo</Label>
                  <p className="font-medium">{selectedTrip.vehicle?.plateNumber || "N/A"}</p>
                </div>
                <div>
                  <Label>Conductor</Label>
                  <p className="font-medium">{selectedTrip.driver?.fullName || "Sin asignar"}</p>
                </div>
                <div>
                  <Label>Ruta</Label>
                  <p className="font-medium">{selectedTrip.route?.name || "N/A"}</p>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Badge variant="outline" className={getStatusColor(selectedTrip.status)}>
                    {selectedTrip.status}
                  </Badge>
                </div>
                <div>
                  <Label>Fecha Programada</Label>
                  <p className="font-medium">{formatDate(selectedTrip.scheduledStart)}</p>
                </div>
                <div>
                  <Label>Fecha de Finalización</Label>
                  <p className="font-medium">{formatDate(selectedTrip.scheduledEnd || "")}</p>
                </div>
              </div>
              {selectedTrip.notes && (
                <div>
                  <Label>Notas</Label>
                  <p className="text-sm text-muted-foreground">{selectedTrip.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}