"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Truck, AlertTriangle, Wrench, Route, Plus, Eye, RefreshCw } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { ScheduleTripForm } from "@/components/fleet/schedule-trip-form"
import { NewMaintenanceForm } from "@/components/maintenance/new-maintenance-form"
import { TripsManagement } from "@/components/dashboard/trips-management"
import { AIAssistant } from "@/components/dashboard/ai-assistant"

type Vehicle = {
  id: string
  plateNumber: string
  status: 'disponible' | 'mantenimiento' | 'en_viaje' | 'inactivo'
}

type Trip = {
  id: string
  vehicle: Vehicle
  route: {
    id: string
    name: string
  }
  driver: {
    id: string
    name: string
  }
  status: 'programado' | 'en_curso' | 'completado' | 'cancelado'
  scheduledStart: string
}

type Maintenance = {
  id: string
  vehicle: Vehicle
  type: string
  description: string
  scheduledDate: string
  status: 'programado' | 'en_progreso' | 'completado' | 'cancelado'
  technician?: {
    id: string
    name: string
  }
}

type Alert = {
  id: string
  title: string
  message: string
  severity: 'critical' | 'warning' | 'info'
  createdAt: string
  isResolved: boolean
}

type Route = {
  id: string
  name: string
  isActive: boolean
}

type DashboardData = {
  totalVehicles: number
  activeVehicles: number
  inMaintenanceVehicles: number
  totalTrips: number
  activeTrips: number
  scheduledTrips: number
  completedTrips: number
  upcomingMaintenances: number
  criticalAlerts: number
  totalRoutes: number
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalVehicles: 0,
    activeVehicles: 0,
    inMaintenanceVehicles: 0,
    totalTrips: 0,
    activeTrips: 0,
    scheduledTrips: 0,
    completedTrips: 0,
    upcomingMaintenances: 0,
    criticalAlerts: 0,
    totalRoutes: 0
  })
  const [recentTrips, setRecentTrips] = useState<Trip[]>([])
  const [upcomingMaintenances, setUpcomingMaintenances] = useState<Maintenance[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showScheduleTripForm, setShowScheduleTripForm] = useState(false)
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  const fetchData = async (url: string) => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Error fetching ${url}: ${response.status}`)
    }
    return response.json()
  }

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const endpoints = [
        { url: "/api/vehicles", key: "vehicles" },
        { url: "/api/trips?limit=5", key: "trips" },
        { url: "/api/maintenances?status=programado&limit=5", key: "maintenances" },
        { url: "/api/alerts?isResolved=false&limit=10", key: "alerts" },
        { url: "/api/routes?active=true", key: "routes" }
      ]

      const results = await Promise.allSettled(endpoints.map(endpoint => fetchData(endpoint.url)))

      const data = endpoints.reduce((acc, endpoint, index) => {
        const result = results[index]
        acc[endpoint.key] = result.status === "fulfilled" ? result.value : []
        return acc
      }, {} as Record<string, any>)

      // Verificar datos mínimos requeridos
      if (!Array.isArray(data.vehicles)) {
        throw new Error("Datos de vehículos no válidos")
      }

      // Calcular métricas del dashboard
      const metrics: DashboardData = {
        totalVehicles: data.vehicles.length,
        activeVehicles: data.vehicles.filter((v: Vehicle) => v.status === "disponible").length,
        inMaintenanceVehicles: data.vehicles.filter((v: Vehicle) => v.status === "mantenimiento").length,
        totalTrips: data.trips?.length || 0,
        activeTrips: data.trips?.filter((t: Trip) => t.status === "en_curso").length || 0,
        scheduledTrips: data.trips?.filter((t: Trip) => t.status === "programado").length || 0,
        completedTrips: data.trips?.filter((t: Trip) => t.status === "completado").length || 0,
        upcomingMaintenances: data.maintenances?.length || 0,
        criticalAlerts: data.alerts?.filter((a: Alert) => a.severity === "critical").length || 0,
        totalRoutes: data.routes?.length || 0
      }

      setDashboardData(metrics)
      setRecentTrips(data.trips || [])
      setUpcomingMaintenances(data.maintenances || [])
      setAlerts(data.alerts || [])

      // Mostrar advertencias para peticiones fallidas
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.warn(`Failed to fetch ${endpoints[index].url}:`, result.reason)
        }
      })

    } catch (error) {
      console.error("Error loading dashboard:", error)
      setError(error instanceof Error ? error.message : "Error desconocido al cargar datos")
      
      toast({
        title: "Error",
        description: "No se pudieron cargar algunos datos del dashboard",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleTripScheduled = (newTrip: Trip) => {
    setRecentTrips(prev => [newTrip, ...prev.slice(0, 4)])
    fetchDashboardData()
  }

  const handleMaintenanceCreated = (newMaintenance: Maintenance) => {
    setUpcomingMaintenances(prev => [newMaintenance, ...prev.slice(0, 4)])
    fetchDashboardData()
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
    } catch {
      return "Fecha inválida"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "programado": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "en_curso": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "completado": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "cancelado": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "warning": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "info": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Error al cargar el dashboard</h2>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <Button onClick={fetchDashboardData} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0A2463] border-t-transparent"></div>
        <p className="text-lg text-muted-foreground">Cargando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general del sistema de gestión de flota</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowMaintenanceForm(true)} size="sm" className="gap-2">
            <Wrench className="h-4 w-4" />
            Programar Mantenimiento
          </Button>
          <Button onClick={() => setShowScheduleTripForm(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Programar Viaje
          </Button>
          <Button onClick={() => setShowAIAssistant(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Asistente IA
          </Button>
          <Button onClick={fetchDashboardData} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="trips">Viajes</TabsTrigger>
          <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vehículos Activos</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.activeVehicles}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    / {dashboardData.totalVehicles}
                  </span>
                </div>
                <Progress 
                  value={dashboardData.totalVehicles > 0 ? 
                    (dashboardData.activeVehicles / dashboardData.totalVehicles) * 100 : 0} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Viajes Activos</CardTitle>
                <Route className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.activeTrips}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.scheduledTrips} programados • {dashboardData.completedTrips} completados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mantenimientos</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.upcomingMaintenances}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.inMaintenanceVehicles} vehículos en mantenimiento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas Críticas</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.criticalAlerts}</div>
                <p className="text-xs text-muted-foreground">
                  {alerts.length} alertas en total
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Eventos recientes en la flota</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTrips.slice(0, 3).map(trip => (
                    <div key={trip.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-secondary">
                          <Route className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{trip.vehicle?.plateNumber || "Vehículo no disponible"}</p>
                          <p className="text-sm text-muted-foreground">
                            {trip.route?.name || "Ruta no especificada"} • {formatDate(trip.scheduledStart)}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(trip.status)}>
                        {trip.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Estado de la Flota</CardTitle>
                <CardDescription>Distribución de vehículos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Disponibles</span>
                    <span className="text-sm">{dashboardData.activeVehicles}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">En mantenimiento</span>
                    <span className="text-sm">{dashboardData.inMaintenanceVehicles}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">En viaje</span>
                    <span className="text-sm">
                      {dashboardData.totalVehicles - dashboardData.activeVehicles - dashboardData.inMaintenanceVehicles}
                    </span>
                  </div>
                  <div className="pt-4">
                    <div className="h-[100px] flex items-center justify-center bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground">Gráfico de disponibilidad</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trips" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Viajes Programados</CardTitle>
                  <CardDescription>Lista de viajes recientes y programados</CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowScheduleTripForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Viaje
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentTrips.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Route className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No hay viajes programados</p>
                  <Button size="sm" onClick={() => setShowScheduleTripForm(true)}>
                    Programar primer viaje
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentTrips.map(trip => (
                    <div key={trip.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{trip.vehicle?.plateNumber || "N/A"}</h4>
                          <Badge variant="outline" className={getStatusColor(trip.status)}>
                            {trip.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {trip.route?.name || "Ruta no disponible"} • {trip.driver?.name || "Conductor no asignado"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(trip.scheduledStart)}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Detalles
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <TripsManagement
            trips={recentTrips.map(trip => ({
              ...trip,
              vehicleId: trip.vehicle?.id ?? "",
              driverId: trip.driver?.id ?? "",
              driver: trip.driver
                ? { ...trip.driver, fullName: (trip.driver as any).fullName ?? trip.driver.name }
                : { id: "", fullName: "" }
            }))}
            onRefresh={fetchDashboardData}
          />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Mantenimientos</CardTitle>
                  <CardDescription>Próximos mantenimientos programados</CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowMaintenanceForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Mantenimiento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingMaintenances.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Wrench className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No hay mantenimientos programados</p>
                  <Button size="sm" onClick={() => setShowMaintenanceForm(true)}>
                    Programar primer mantenimiento
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingMaintenances.map(maintenance => (
                    <div key={maintenance.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{maintenance.vehicle?.plateNumber || "N/A"}</h4>
                          <Badge variant="outline">{maintenance.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {maintenance.description || "Sin descripción"}
                        </p>
                        <div className="flex gap-4">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(maintenance.scheduledDate)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {maintenance.technician?.name || "Técnico no asignado"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(maintenance.status)}>
                        {maintenance.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas del Sistema</CardTitle>
              <CardDescription>Alertas y notificaciones recientes</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No hay alertas activas</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.map(alert => (
                    <div key={alert.id} className="flex items-start justify-between p-4 rounded-lg border hover:bg-accent/50">
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-full mt-1 ${getSeverityColor(alert.severity)}`}>
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{alert.title}</h4>
                            <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(alert.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Resolver
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ScheduleTripForm
        open={showScheduleTripForm}
        onOpenChange={setShowScheduleTripForm}
        route={selectedRoute}
        onTripScheduled={handleTripScheduled}
      />

      <NewMaintenanceForm
        open={showMaintenanceForm}
        onOpenChange={setShowMaintenanceForm}
        onMaintenanceCreated={handleMaintenanceCreated}
      />

      <AIAssistant 
        open={showAIAssistant}
        onOpenChange={setShowAIAssistant}
      />
    </div>
  )
}