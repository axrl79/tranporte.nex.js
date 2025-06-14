"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Truck, AlertTriangle, Wrench, Route, Plus, Eye } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { ScheduleTripForm } from "@/components/fleet/schedule-trip-form"
import { NewMaintenanceForm } from "@/components/maintenance/new-maintenance-form"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [dashboardData, setDashboardData] = useState<any>({})
  const [recentTrips, setRecentTrips] = useState<any[]>([])
  const [upcomingMaintenances, setUpcomingMaintenances] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showScheduleTripForm, setShowScheduleTripForm] = useState(false)
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<any>(null)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)

      // Fetch multiple data sources
      const [vehiclesRes, tripsRes, maintenancesRes, alertsRes, routesRes] = await Promise.all([
        fetch("/api/vehicles"),
        fetch("/api/trips?limit=5"),
        fetch("/api/maintenances?status=programado&limit=5"),
        fetch("/api/alerts?isResolved=false&limit=10"),
        fetch("/api/routes?active=true"),
      ])

      const [vehicles, trips, maintenances, alertsData, routes] = await Promise.all([
        vehiclesRes.json(),
        tripsRes.json(),
        maintenancesRes.json(),
        alertsRes.json(),
        routesRes.json(),
      ])

      // Calculate dashboard metrics
      const dashboardMetrics = {
        totalVehicles: vehicles.length,
        activeVehicles: vehicles.filter((v: any) => v.status === "disponible").length,
        inMaintenanceVehicles: vehicles.filter((v: any) => v.status === "mantenimiento").length,
        totalTrips: trips.length,
        activeTrips: trips.filter((t: any) => t.status === "en_curso").length,
        scheduledTrips: trips.filter((t: any) => t.status === "programado").length,
        completedTrips: trips.filter((t: any) => t.status === "completado").length,
        upcomingMaintenances: maintenances.length,
        criticalAlerts: alertsData.filter((a: any) => a.severity === "critical").length,
        totalRoutes: routes.length,
      }

      setDashboardData(dashboardMetrics)
      setRecentTrips(trips)
      setUpcomingMaintenances(maintenances)
      setAlerts(alertsData)
    } catch (error) {
      console.error("Error loading dashboard:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleTripScheduled = (newTrip: any) => {
    setRecentTrips((prev) => [newTrip, ...prev.slice(0, 4)])
    fetchDashboardData() // Refresh data
  }

  const handleMaintenanceCreated = (newMaintenance: any) => {
    setUpcomingMaintenances((prev) => [newMaintenance, ...prev.slice(0, 4)])
    fetchDashboardData() // Refresh data
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "info":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2463] mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general del sistema de gestión de flota</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowMaintenanceForm(true)}>
            <Wrench className="mr-2 h-4 w-4" />
            Programar Mantenimiento
          </Button>
          <Button onClick={() => setShowScheduleTripForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Programar Viaje
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="trips">Viajes</TabsTrigger>
          <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* KPIs Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vehículos Activos</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.activeVehicles}</div>
                <p className="text-xs text-muted-foreground">de {dashboardData.totalVehicles} vehículos</p>
                <Progress value={(dashboardData.activeVehicles / dashboardData.totalVehicles) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Viajes Activos</CardTitle>
                <Route className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.activeTrips}</div>
                <p className="text-xs text-muted-foreground">{dashboardData.scheduledTrips} programados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mantenimientos</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.upcomingMaintenances}</div>
                <p className="text-xs text-muted-foreground">próximos programados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas Críticas</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.criticalAlerts}</div>
                <p className="text-xs text-muted-foreground">requieren atención</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Actividad de la Flota</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Gráfico de actividad de la flota (próximamente)
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Viajes Recientes</CardTitle>
                <CardDescription>Últimos viajes programados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTrips.slice(0, 3).map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{trip.vehicle?.plateNumber || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">{trip.route?.name || "Ruta no disponible"}</p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(trip.status)}>
                        {trip.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Viajes</CardTitle>
              <CardDescription>Programación y seguimiento de viajes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTrips.map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{trip.vehicle?.plateNumber || "N/A"}</h4>
                        <Badge variant="outline" className={getStatusColor(trip.status)}>
                          {trip.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Ruta: {trip.route?.name || "No disponible"}</p>
                      <p className="text-sm text-muted-foreground">Conductor: {trip.driver?.name || "No asignado"}</p>
                      <p className="text-sm text-muted-foreground">Programado: {formatDate(trip.scheduledStart)}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mantenimientos Programados</CardTitle>
              <CardDescription>Próximos mantenimientos de vehículos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingMaintenances.map((maintenance) => (
                  <div key={maintenance.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{maintenance.vehicle?.plateNumber || "N/A"}</h4>
                        <Badge variant="outline">{maintenance.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{maintenance.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Programado: {formatDate(maintenance.scheduledDate)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Técnico: {maintenance.technician?.name || "Sin asignar"}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant="outline" className={getStatusColor(maintenance.status)}>
                        {maintenance.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas del Sistema</CardTitle>
              <CardDescription>Notificaciones y alertas importantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{alert.title}</h4>
                        <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(alert.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <Button variant="outline" size="sm">
                        Resolver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogos */}
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
    </div>
  )
}
