"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Truck,
  User,
  Calendar,
  Clock,
  Package,
  MoreHorizontal,
  Eye,
  Trash2,
  Play,
  Square,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ScheduleTripDialog } from "@/components/trips/schedule-trip-dialog"
import { TripDetailsDialog } from "@/components/trips/trip-details-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"

interface Trip {
  id: string
  vehicleId: string
  driverId: string
  routeId: string
  scheduledStart: string
  scheduledEnd: string
  actualStart?: string
  actualEnd?: string
  status: "programado" | "en_curso" | "completado" | "cancelado"
  cargo: string
  cargoWeight?: number
  notes?: string
  vehicle?: {
    id: string
    plateNumber: string
    type: string
    status: string
  }
  driver?: {
    id: string
    name: string
    email: string
  }
  route?: {
    id: string
    name: string
    originName: string
    destinationName: string
    distance: number
  }
  createdAt: string
  updatedAt: string
}

interface TripStats {
  total: number
  programado: number
  en_curso: number
  completado: number
  cancelado: number
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [stats, setStats] = useState<TripStats>({
    total: 0,
    programado: 0,
    en_curso: 0,
    completado: 0,
    cancelado: 0,
  })

  const fetchTrips = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/trips")

      if (!response.ok) {
        throw new Error("Failed to load trips")
      }

      const data = await response.json()
      setTrips(data)

      // Calculate statistics
      const newStats = {
        total: data.length,
        programado: data.filter((t: Trip) => t.status === "programado").length,
        en_curso: data.filter((t: Trip) => t.status === "en_curso").length,
        completado: data.filter((t: Trip) => t.status === "completado").length,
        cancelado: data.filter((t: Trip) => t.status === "cancelado").length,
      }
      setStats(newStats)
    } catch (error) {
      console.error("Error fetching trips:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los viajes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const filterTrips = useCallback(() => {
    let filtered = [...trips]

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (trip) =>
          trip.vehicle?.plateNumber?.toLowerCase().includes(term) ||
          trip.driver?.name?.toLowerCase().includes(term) ||
          trip.route?.name?.toLowerCase().includes(term) ||
          trip.cargo?.toLowerCase().includes(term),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((trip) => trip.status === statusFilter)
    }

    setFilteredTrips(filtered)
  }, [trips, searchTerm, statusFilter])

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  useEffect(() => {
    filterTrips()
  }, [filterTrips])

  const handleTripScheduled = useCallback((newTrip: Trip) => {
    setTrips((prev) => [newTrip, ...prev])
    toast({
      title: "Viaje programado",
      description: "El viaje ha sido programado exitosamente",
    })
  }, [])

  const handleStatusChange = async (tripId: string, newStatus: Trip["status"]) => {
    try {
      setIsMutating(true)
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar estado")
      }

      const updatedTrip = await response.json()

      setTrips((prev) =>
        prev.map((trip) => (trip.id === tripId ? { ...trip, ...updatedTrip } : trip))
      )

      toast({
        title: "Estado actualizado",
        description: `El viaje ha sido marcado como ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating trip status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del viaje",
        variant: "destructive",
      })
    } finally {
      setIsMutating(false)
    }
  }

  const handleDeleteTrip = async (tripId: string) => {
    try {
      setIsMutating(true)
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar viaje")
      }

      setTrips((prev) => prev.filter((trip) => trip.id !== tripId))

      toast({
        title: "Viaje eliminado",
        description: "El viaje ha sido eliminado exitosamente",
      })
    } catch (error) {
      console.error("Error deleting trip:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el viaje",
        variant: "destructive",
      })
    } finally {
      setIsMutating(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Fecha inválida"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "programado":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "en_curso":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "completado":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "cancelado":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "programado":
        return <Clock className="h-3 w-3" />
      case "en_curso":
        return <Play className="h-3 w-3" />
      case "completado":
        return <CheckCircle className="h-3 w-3" />
      case "cancelado":
        return <Square className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const renderStatsCards = () => {
    if (isLoading) {
      return Array(5).fill(0).map((_, i) => (
        <Card key={`stat-skeleton-${i}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-12" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))
    }

    return (
      <>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Programados</p>
                <p className="text-2xl font-bold text-blue-600">{stats.programado}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Curso</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.en_curso}</p>
              </div>
              <Play className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completados</p>
                <p className="text-2xl font-bold text-green-600">{stats.completado}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancelados</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelado}</p>
              </div>
              <Square className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  const renderTripRow = (trip: Trip) => (
    <TableRow key={trip.id} className="hover:bg-muted/50">
      <TableCell>
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{trip.vehicle?.plateNumber || "N/A"}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{trip.route?.name || "Ruta no disponible"}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{trip.driver?.name || "Sin asignar"}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{trip.cargo}</div>
            {trip.cargoWeight && (
              <div className="text-xs text-muted-foreground">{trip.cargoWeight} ton</div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatDate(trip.scheduledStart)}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={`${getStatusColor(trip.status)} flex items-center gap-1 w-fit`}>
          {getStatusIcon(trip.status)}
          {trip.status.replace("_", " ")}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isMutating}>
            <Button variant="ghost" className="h-8 w-8 p-0">
              {isMutating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreHorizontal className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedTrip(trip)
                setShowDetailsDialog(true)
              }}
              disabled={isMutating}
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>

            {trip.status === "programado" && (
              <DropdownMenuItem 
                onClick={() => handleStatusChange(trip.id, "en_curso")}
                disabled={isMutating}
              >
                <Play className="mr-2 h-4 w-4" />
                Iniciar viaje
              </DropdownMenuItem>
            )}

            {trip.status === "en_curso" && (
              <DropdownMenuItem 
                onClick={() => handleStatusChange(trip.id, "completado")}
                disabled={isMutating}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Completar viaje
              </DropdownMenuItem>
            )}

            {(trip.status === "programado" || trip.status === "en_curso") && (
              <DropdownMenuItem
                onClick={() => handleStatusChange(trip.id, "cancelado")}
                className="text-red-600"
                disabled={isMutating}
              >
                <Square className="mr-2 h-4 w-4" />
                Cancelar viaje
              </DropdownMenuItem>
            )}

            <DropdownMenuItem 
              onClick={() => handleDeleteTrip(trip.id)} 
              className="text-red-600"
              disabled={isMutating}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Viajes</h1>
          <p className="text-muted-foreground">Programación, seguimiento y control de viajes</p>
        </div>
        <Button 
          onClick={() => setShowScheduleDialog(true)} 
          className="bg-[#0A2463] hover:bg-[#0A2463]/90"
          disabled={isLoading || isMutating}
        >
          {isLoading || isMutating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Programar Viaje
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {renderStatsCards()}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por vehículo, conductor, ruta o carga..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={isLoading || isMutating}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
                disabled={isLoading || isMutating}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
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
          </div>
        </CardContent>
      </Card>

      {/* Trips Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Viajes</CardTitle>
          <CardDescription>
            {filteredTrips.length} de {trips.length} viajes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={`row-skeleton-${i}`} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {trips.length === 0 ? "No hay viajes programados" : "No se encontraron viajes"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {trips.length === 0
                  ? "Comienza programando tu primer viaje"
                  : "Intenta ajustar los filtros de búsqueda"}
              </p>
              {trips.length === 0 && (
                <Button 
                  onClick={() => setShowScheduleDialog(true)}
                  disabled={isMutating}
                >
                  {isMutating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Programar Primer Viaje
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Ruta</TableHead>
                    <TableHead>Conductor</TableHead>
                    <TableHead>Carga</TableHead>
                    <TableHead>Programado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrips.map(renderTripRow)}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ScheduleTripDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        onTripScheduled={handleTripScheduled}
      />

      <TripDetailsDialog 
        trip={selectedTrip} 
        open={showDetailsDialog} 
        onOpenChange={setShowDetailsDialog} 
      />
    </div>
  )
}