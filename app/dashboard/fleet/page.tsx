"use client"

import { useState, useEffect } from "react"
import {
  Check,
  ChevronDown,
  Download,
  Filter,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Truck,
  Calendar,
  Clock,
  AlertTriangle,
  MapIcon,
  Route,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewVehicleForm } from "@/components/fleet/new-vehicle-form"
import { NewRouteForm } from "@/components/fleet/new-route-form"
import { RouteDetailsDialog } from "@/components/fleet/route-details-dialog"
import { EditRouteForm } from "@/components/fleet/edit-route-form"
import { RouteMapDialog } from "@/components/fleet/route-map-dialog"
import { ScheduleTripForm } from "@/components/fleet/schedule-trip-form"
import { ToggleRouteStatusDialog } from "@/components/fleet/toggle-route-status-dialog"
import { Skeleton } from "@/components/ui/skeleton"

export default function FleetPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("Todos")
  const [selectedType, setSelectedType] = useState<string>("Todos")
  const [isNewVehicleFormOpen, setIsNewVehicleFormOpen] = useState(false)
  const [isNewRouteFormOpen, setIsNewRouteFormOpen] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [routes, setRoutes] = useState<any[]>([])
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true)
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [routeSearchQuery, setRouteSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("fleet")

  // Estados para los diálogos de rutas
  const [selectedRoute, setSelectedRoute] = useState<any>(null)
  const [isRouteDetailsOpen, setIsRouteDetailsOpen] = useState(false)
  const [isEditRouteOpen, setIsEditRouteOpen] = useState(false)
  const [isRouteMapOpen, setIsRouteMapOpen] = useState(false)
  const [isScheduleTripOpen, setIsScheduleTripOpen] = useState(false)
  const [isToggleRouteStatusOpen, setIsToggleRouteStatusOpen] = useState(false)

  const fetchVehicles = async () => {
    try {
      setIsLoadingVehicles(true)
      const response = await fetch("/api/vehicles")
      if (!response.ok) {
        throw new Error("Error al cargar vehículos")
      }
      const data = await response.json()
      setVehicles(data)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los vehículos",
        variant: "destructive",
      })
    } finally {
      setIsLoadingVehicles(false)
    }
  }

  const fetchRoutes = async () => {
    try {
      setIsLoadingRoutes(true)
      const response = await fetch("/api/routes")
      if (!response.ok) {
        throw new Error("Error al cargar rutas")
      }
      const data = await response.json()
      setRoutes(data)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las rutas",
        variant: "destructive",
      })
    } finally {
      setIsLoadingRoutes(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
    fetchRoutes()
  }, [])

  const vehicleTypes = [
    { name: "Todos", icon: Truck },
    { name: "camion", label: "Camión", icon: Truck },
    { name: "trailer", label: "Tráiler", icon: Truck },
    { name: "cisterna", label: "Cisterna", icon: Truck },
    { name: "furgon", label: "Furgón", icon: Truck },
    { name: "otro", label: "Otro", icon: Truck },
  ]

  const vehicleStatuses = [
    { name: "Todos", icon: Filter },
    { name: "disponible", label: "Disponible", icon: Check, color: "bg-green-500" },
    { name: "en_ruta", label: "En Ruta", icon: MapPin, color: "bg-blue-500" },
    { name: "mantenimiento", label: "Mantenimiento", icon: AlertTriangle, color: "bg-yellow-500" },
    { name: "inactivo", label: "Inactivo", icon: Clock, color: "bg-gray-500" },
  ]

  const getTypeLabel = (typeName: string) => {
    const type = vehicleTypes.find((t) => t.name === typeName)
    return type?.label || typeName
  }

  const getStatusLabel = (statusName: string) => {
    const status = vehicleStatuses.find((s) => s.name === statusName)
    return status?.label || statusName
  }

  const getStatusColor = (statusName: string) => {
    const status = vehicleStatuses.find((s) => s.name === statusName)
    return status?.color || "bg-gray-500"
  }

  const filteredVehicles = vehicles
    .filter(
      (vehicle) =>
        (selectedStatus === "Todos" || vehicle.status === selectedStatus) &&
        (selectedType === "Todos" || vehicle.type === selectedType),
    )
    .filter(
      (vehicle) =>
        vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  const filteredRoutes = routes.filter(
    (route) =>
      route.name.toLowerCase().includes(routeSearchQuery.toLowerCase()) ||
      route.originName.toLowerCase().includes(routeSearchQuery.toLowerCase()) ||
      route.destinationName.toLowerCase().includes(routeSearchQuery.toLowerCase()),
  )

  const handleVehicleCreated = (newVehicle: any) => {
    setVehicles((prevVehicles) => [newVehicle, ...prevVehicles])
    toast({
      title: "Vehículo creado",
      description: "El vehículo ha sido registrado exitosamente.",
    })
  }

  const handleRouteCreated = (newRoute: any) => {
    setRoutes((prevRoutes) => [newRoute, ...prevRoutes])
    toast({
      title: "Ruta creada",
      description: "La nueva ruta ha sido registrada exitosamente.",
    })
  }

  const handleRouteUpdated = (updatedRoute: any) => {
    setRoutes((prevRoutes) => prevRoutes.map((route) => (route.id === updatedRoute.id ? updatedRoute : route)))
    setSelectedRoute(updatedRoute)
    toast({
      title: "Ruta actualizada",
      description: "Los cambios en la ruta han sido guardados.",
    })
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const formatDistance = (distance: string | number) => {
    const dist = typeof distance === "string" ? Number.parseFloat(distance) : distance
    return dist.toLocaleString() + " km"
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Funciones para manejar las acciones de rutas
  const handleViewDetails = (route: any) => {
    setSelectedRoute(route)
    setIsRouteDetailsOpen(true)
  }

  const handleEditRoute = (route: any) => {
    setSelectedRoute(route)
    setIsEditRouteOpen(true)
  }

  const handleViewMap = (route: any) => {
    setSelectedRoute(route)
    setIsRouteMapOpen(true)
  }

  const handleScheduleTrip = (route: any) => {
    setSelectedRoute(route)
    setIsScheduleTripOpen(true)
  }

  const handleToggleStatus = (route: any) => {
    setSelectedRoute(route)
    setIsToggleRouteStatusOpen(true)
  }

  const handleTripScheduled = (trip: any) => {
    toast({
      title: "Viaje programado",
      description: `El viaje ha sido programado exitosamente.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Flota</h1>
          <p className="text-muted-foreground">Administre vehículos y rutas de transporte</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar reporte
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fleet" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Vehículos
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <Route className="h-4 w-4" />
            Rutas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vehículos</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vehicles.length}</div>
                <p className="text-xs text-muted-foreground">+2 desde el mes pasado</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
                <Check className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vehicles.filter((v) => v.status === "disponible").length}</div>
                <p className="text-xs text-muted-foreground">
                  {((vehicles.filter((v) => v.status === "disponible").length / vehicles.length) * 100).toFixed(1)}% del
                  total
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Ruta</CardTitle>
                <MapPin className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vehicles.filter((v) => v.status === "en_ruta").length}</div>
                <p className="text-xs text-muted-foreground">Actualmente en operación</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mantenimiento</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vehicles.filter((v) => v.status === "mantenimiento").length}</div>
                <p className="text-xs text-muted-foreground">Requieren atención</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar vehículos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      {getStatusLabel(selectedStatus)}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {vehicleStatuses.map((status) => (
                      <DropdownMenuCheckboxItem
                        key={status.name}
                        checked={selectedStatus === status.name}
                        onCheckedChange={() => setSelectedStatus(status.name)}
                        className="capitalize"
                      >
                        {status.label || status.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      {getTypeLabel(selectedType)}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {vehicleTypes.map((type) => (
                      <DropdownMenuCheckboxItem
                        key={type.name}
                        checked={selectedType === type.name}
                        onCheckedChange={() => setSelectedType(type.name)}
                        className="capitalize"
                      >
                        {type.label || type.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <Button onClick={() => setIsNewVehicleFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Vehículo</span>
              <span className="inline sm:hidden">Nuevo</span>
            </Button>
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader className="px-0 sm:px-6 pt-0 sm:pt-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">Lista de Vehículos</CardTitle>
                  <CardDescription>Gestione la información de todos los vehículos de la flota</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Download className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Exportar</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 sm:px-6 pb-0 sm:pb-6">
              {isLoadingVehicles ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="pl-6">Placa</TableHead>
                        <TableHead>Marca/Modelo</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Año</TableHead>
                        <TableHead>Capacidad</TableHead>
                        <TableHead>Última Revisión</TableHead>
                        <TableHead className="pr-6 text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVehicles.length > 0 ? (
                        filteredVehicles.map((vehicle) => (
                          <TableRow key={vehicle.id} className="hover:bg-gray-50">
                            <TableCell className="pl-6 font-medium">{vehicle.plateNumber}</TableCell>
                            <TableCell>
                              {vehicle.brand} {vehicle.model}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {getTypeLabel(vehicle.type)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusColor(vehicle.status)} capitalize`}>
                                {getStatusLabel(vehicle.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>{vehicle.year}</TableCell>
                            <TableCell>{vehicle.capacity} ton</TableCell>
                            <TableCell>{formatDate(vehicle.lastMaintenance)}</TableCell>
                            <TableCell className="pr-6 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Abrir menú</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                  <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                                  <DropdownMenuItem>Editar vehículo</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Cambiar estado</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            No se encontraron vehículos
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rutas</CardTitle>
                <Route className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{routes.length}</div>
                <p className="text-xs text-muted-foreground">+1 desde el mes pasado</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rutas Activas</CardTitle>
                <Check className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{routes.filter((r) => r.active).length}</div>
                <p className="text-xs text-muted-foreground">
                  {((routes.filter((r) => r.active).length / routes.length) * 100).toFixed(1)}% del total
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Distancia Total</CardTitle>
                <MapPin className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {routes.reduce((total, route) => total + Number.parseFloat(route.distance), 0).toLocaleString()} km
                </div>
                <p className="text-xs text-muted-foreground">Suma de todas las rutas</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Total</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(routes.reduce((total, route) => total + route.estimatedDuration, 0) / 60)}h
                </div>
                <p className="text-xs text-muted-foreground">Duración estimada total</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar rutas..."
                value={routeSearchQuery}
                onChange={(e) => setRouteSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
              <Button onClick={() => setIsNewRouteFormOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nueva Ruta</span>
                <span className="inline sm:hidden">Nueva</span>
              </Button>
            </div>
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader className="px-0 sm:px-6 pt-0 sm:pt-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">Lista de Rutas</CardTitle>
                  <CardDescription>Gestione las rutas de transporte disponibles</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 sm:px-6 pb-0 sm:pb-6">
              {isLoadingRoutes ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="pl-6">Nombre</TableHead>
                        <TableHead>Origen</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Distancia</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Creada</TableHead>
                        <TableHead className="pr-6 text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoutes.length > 0 ? (
                        filteredRoutes.map((route) => (
                          <TableRow key={route.id} className="hover:bg-gray-50">
                            <TableCell className="pl-6 font-medium">{route.name}</TableCell>
                            <TableCell>{route.originName}</TableCell>
                            <TableCell>{route.destinationName}</TableCell>
                            <TableCell>{formatDistance(route.distance)}</TableCell>
                            <TableCell>{formatDuration(route.estimatedDuration)}</TableCell>
                            <TableCell>
                              <Badge className={route.active ? "bg-green-500" : "bg-gray-500"}>
                                {route.active ? "Activa" : "Inactiva"}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(route.createdAt)}</TableCell>
                            <TableCell className="pr-6 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Abrir menú</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleViewDetails(route)}>
                                    Ver detalles
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditRoute(route)}>
                                    Editar ruta
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleViewMap(route)}>
                                    <MapIcon className="mr-2 h-4 w-4" />
                                    Ver en mapa
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleScheduleTrip(route)}>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Programar viaje
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleToggleStatus(route)}>
                                    {route.active ? "Desactivar ruta" : "Activar ruta"}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            No se encontraron rutas
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Formularios y diálogos */}
      <NewVehicleForm
        open={isNewVehicleFormOpen}
        onOpenChange={setIsNewVehicleFormOpen}
        onVehicleCreated={handleVehicleCreated}
      />

      <NewRouteForm
        open={isNewRouteFormOpen}
        onOpenChange={setIsNewRouteFormOpen}
        onRouteCreated={handleRouteCreated}
      />

      {/* Diálogos de rutas */}
      <RouteDetailsDialog
        open={isRouteDetailsOpen}
        onOpenChange={setIsRouteDetailsOpen}
        route={selectedRoute}
        onEdit={() => {
          setIsRouteDetailsOpen(false)
          setIsEditRouteOpen(true)
        }}
        onScheduleTrip={() => {
          setIsRouteDetailsOpen(false)
          setIsScheduleTripOpen(true)
        }}
        onViewMap={() => {
          setIsRouteDetailsOpen(false)
          setIsRouteMapOpen(true)
        }}
      />

      <EditRouteForm
        open={isEditRouteOpen}
        onOpenChange={setIsEditRouteOpen}
        route={selectedRoute}
        onRouteUpdated={handleRouteUpdated}
      />

      <RouteMapDialog open={isRouteMapOpen} onOpenChange={setIsRouteMapOpen} route={selectedRoute} />

      <ScheduleTripForm
        open={isScheduleTripOpen}
        onOpenChange={setIsScheduleTripOpen}
        route={selectedRoute}
        onTripScheduled={handleTripScheduled}
      />

      <ToggleRouteStatusDialog
        open={isToggleRouteStatusOpen}
        onOpenChange={setIsToggleRouteStatusOpen}
        route={selectedRoute}
        onStatusChanged={handleRouteUpdated}
      />
    </div>
  )
}