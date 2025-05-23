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
import { Progress } from "@/components/ui/progress"
import { NewVehicleForm } from "@/components/fleet/new-vehicle-form"
import { NewRouteForm } from "@/components/fleet/new-route-form"

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
  }

  const handleRouteCreated = (newRoute: any) => {
    setRoutes((prevRoutes) => [newRoute, ...prevRoutes])
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Datos para el mapa (simulados)
  const mapVehicles = [
    { id: 1, plateNumber: "ABC-123", lat: 19.432608, lng: -99.133209, status: "en_ruta" },
    { id: 2, plateNumber: "XYZ-789", lat: 19.436, lng: -99.143, status: "en_ruta" },
    { id: 3, plateNumber: "DEF-456", lat: 19.422, lng: -99.153, status: "en_ruta" },
  ]

  // Datos para viajes programados (simulados)
  const scheduledTrips = [
    {
      id: 1,
      vehicle: "ABC-123 (Camión)",
      driver: "Carlos Méndez",
      route: "CDMX - Puebla",
      departure: "2023-05-20 08:00",
      arrival: "2023-05-20 10:00",
      status: "programado",
    },
    {
      id: 2,
      vehicle: "XYZ-789 (Cisterna)",
      driver: "Ana Gutiérrez",
      route: "CDMX - Querétaro",
      departure: "2023-05-21 09:00",
      arrival: "2023-05-21 12:00",
      status: "en_curso",
    },
    {
      id: 3,
      vehicle: "DEF-456 (Tráiler)",
      driver: "Roberto Sánchez",
      route: "Puebla - Veracruz",
      departure: "2023-05-22 07:00",
      arrival: "2023-05-22 11:00",
      status: "programado",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logística y Flota</h1>
          <p className="text-muted-foreground">Gestión de vehículos, rutas y programación de viajes</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-[#0A2463] hover:bg-[#0A2463]/90" onClick={() => setIsNewVehicleFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Vehículo
          </Button>
          <Button variant="outline" onClick={() => setIsNewRouteFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Ruta
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#0A2463] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Vehículos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs opacity-70">
              {isLoadingVehicles ? "Cargando..." : `${vehicles.length} vehículos registrados`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#F9DC5C] text-[#0A2463]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Ruta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicles.filter((vehicle) => vehicle.status === "en_ruta").length}
            </div>
            <p className="text-xs opacity-70">Vehículos actualmente en viaje</p>
          </CardContent>
        </Card>

        <Card className="bg-[#F2E9DC] text-[#0A2463]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rutas Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routes.filter((route) => route.active).length}</div>
            <p className="text-xs opacity-70">Rutas disponibles para asignar</p>
          </CardContent>
        </Card>

        <Card className="bg-[#D90429] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Mantenimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicles.filter((vehicle) => vehicle.status === "mantenimiento").length}
            </div>
            <p className="text-xs opacity-70">Requieren atención</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="fleet" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#F2E9DC]">
          <TabsTrigger value="fleet" className="data-[state=active]:bg-[#0A2463] data-[state=active]:text-white">
            <Truck className="h-4 w-4 mr-2" />
            Flota
          </TabsTrigger>
          <TabsTrigger value="map" className="data-[state=active]:bg-[#0A2463] data-[state=active]:text-white">
            <MapIcon className="h-4 w-4 mr-2" />
            Mapa
          </TabsTrigger>
          <TabsTrigger value="routes" className="data-[state=active]:bg-[#0A2463] data-[state=active]:text-white">
            <Route className="h-4 w-4 mr-2" />
            Rutas
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-[#0A2463] data-[state=active]:text-white">
            <Calendar className="h-4 w-4 mr-2" />
            Programación
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fleet">
          <Card>
            <CardHeader>
              <CardTitle>Vehículos de la Flota</CardTitle>
              <CardDescription>Gestiona los vehículos y su estado actual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar vehículos..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex gap-2">
                        <span>Estado:</span>
                        <span className="font-medium">
                          {selectedStatus === "Todos" ? "Todos" : getStatusLabel(selectedStatus)}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {vehicleStatuses.map((status) => (
                        <DropdownMenuCheckboxItem
                          key={status.name}
                          checked={selectedStatus === status.name}
                          onCheckedChange={() => setSelectedStatus(status.name)}
                        >
                          <div className="flex items-center gap-2">
                            <status.icon className="h-4 w-4" />
                            <span>{status.label || status.name}</span>
                          </div>
                          {selectedStatus === status.name && <Check className="h-4 w-4 ml-auto" />}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex gap-2">
                        <span>Tipo:</span>
                        <span className="font-medium">
                          {selectedType === "Todos" ? "Todos" : getTypeLabel(selectedType)}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {vehicleTypes.map((type) => (
                        <DropdownMenuCheckboxItem
                          key={type.name}
                          checked={selectedType === type.name}
                          onCheckedChange={() => setSelectedType(type.name)}
                        >
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            <span>{type.label || type.name}</span>
                          </div>
                          {selectedType === type.name && <Check className="h-4 w-4 ml-auto" />}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>

              {isLoadingVehicles ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A2463] mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Cargando vehículos...</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vehículo</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Combustible</TableHead>
                        <TableHead>Kilometraje</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVehicles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No se encontraron vehículos
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredVehicles.map((vehicle) => (
                          <TableRow key={vehicle.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-[#0A2463] flex items-center justify-center text-white">
                                  <Truck className="h-5 w-5" />
                                </div>
                                <div>
                                  <div className="font-medium">{vehicle.plateNumber}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{getTypeLabel(vehicle.type)}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className={`h-2 w-2 rounded-full ${getStatusColor(vehicle.status)} mr-2`} />
                                <span>{getStatusLabel(vehicle.status)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">{vehicle.fuelType}</div>
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={
                                      vehicle.currentFuelLevel
                                        ? (vehicle.currentFuelLevel / vehicle.fuelCapacity) * 100
                                        : 0
                                    }
                                    className="h-2"
                                  />
                                  <span className="text-xs">
                                    {vehicle.currentFuelLevel
                                      ? Math.round((vehicle.currentFuelLevel / vehicle.fuelCapacity) * 100)
                                      : 0}
                                    %
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{vehicle.totalKm ? `${vehicle.totalKm.toLocaleString()} km` : "0 km"}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Acciones</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                                  <DropdownMenuItem>Editar vehículo</DropdownMenuItem>
                                  <DropdownMenuItem>Programar mantenimiento</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Asignar a viaje</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Seguimiento</CardTitle>
              <CardDescription>Visualización en tiempo real de la ubicación de los vehículos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] bg-[#F2E9DC]/30 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <MapIcon className="h-16 w-16 mx-auto text-[#0A2463]/50" />
                  <h3 className="mt-4 text-lg font-medium">Mapa de Seguimiento</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Aquí se mostrará el mapa con la ubicación en tiempo real de los vehículos
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {mapVehicles.map((vehicle) => (
                      <Badge key={vehicle.id} className="bg-blue-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        {vehicle.plateNumber}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes">
          <Card>
            <CardHeader>
              <CardTitle>Rutas Disponibles</CardTitle>
              <CardDescription>Gestión de rutas y destinos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar rutas..."
                    className="pl-8"
                    value={routeSearchQuery}
                    onChange={(e) => setRouteSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button className="bg-[#0A2463] hover:bg-[#0A2463]/90" onClick={() => setIsNewRouteFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Ruta
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>

              {isLoadingRoutes ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A2463] mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Cargando rutas...</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Origen</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Distancia</TableHead>
                        <TableHead>Duración Est.</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoutes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            {routes.length === 0 ? "No hay rutas registradas" : "No se encontraron rutas"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRoutes.map((route) => (
                          <TableRow key={route.id}>
                            <TableCell className="font-medium">{route.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-green-600" />
                                {route.originName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-red-600" />
                                {route.destinationName}
                              </div>
                            </TableCell>
                            <TableCell>{Number.parseFloat(route.distance).toLocaleString()} km</TableCell>
                            <TableCell>{formatDuration(route.estimatedDuration)}</TableCell>
                            <TableCell>
                              <Badge className={route.active ? "bg-green-500" : "bg-gray-500"}>
                                {route.active ? "Activa" : "Inactiva"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Acciones</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                                  <DropdownMenuItem>Editar ruta</DropdownMenuItem>
                                  <DropdownMenuItem>Ver en mapa</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Programar viaje</DropdownMenuItem>
                                  <DropdownMenuItem className={route.active ? "text-red-600" : "text-green-600"}>
                                    {route.active ? "Desactivar ruta" : "Activar ruta"}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Programación de Viajes</CardTitle>
              <CardDescription>Planificación y asignación de viajes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button className="bg-[#0A2463] hover:bg-[#0A2463]/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Programar Viaje
                </Button>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Conductor</TableHead>
                      <TableHead>Ruta</TableHead>
                      <TableHead>Salida</TableHead>
                      <TableHead>Llegada Est.</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledTrips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell className="font-medium">{trip.vehicle}</TableCell>
                        <TableCell>{trip.driver}</TableCell>
                        <TableCell>{trip.route}</TableCell>
                        <TableCell>{trip.departure}</TableCell>
                        <TableCell>{trip.arrival}</TableCell>
                        <TableCell>
                          <Badge className={trip.status === "programado" ? "bg-yellow-500" : "bg-green-500"}>
                            {trip.status === "programado" ? "Programado" : "En Curso"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Acciones</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                              <DropdownMenuItem>Editar viaje</DropdownMenuItem>
                              <DropdownMenuItem>Iniciar viaje</DropdownMenuItem>
                              <DropdownMenuItem>Cancelar viaje</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
    </div>
  )
}
