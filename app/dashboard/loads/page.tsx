"use client"

import { useState, useEffect } from "react"
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Download,
  QrCode,
  Eye,
  Edit,
  MoreHorizontal,
  Truck,
  Package,
  Calendar,
  Weight,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Progress } from "@/components/ui/progress"
import { NewLoadForm } from "@/components/loads/new-load-form"
import { LoadDetailsDialog } from "@/components/loads/load-details-dialog"
import { QRScannerDialog } from "@/components/loads/qr-scanner-dialog"
import { toast } from "@/components/ui/use-toast"

// Tipos de datos
type Vehicle = {
  id: string
  plateNumber: string
  type: string
  capacity: number
  status: 'disponible' | 'en_viaje' | 'mantenimiento'
}

type Load = {
  id: string
  code: string
  status: 'pendiente' | 'en_proceso' | 'cargado' | 'en_transito' | 'descargado' | 'completado'
  vehicleId: string | null
  vehiclePlate: string | null
  tripId: string | null
  totalWeight: number
  totalVolume: number
  totalValue: number
  itemsCount: number
  loadingDate: string | null
  origin: string
  destination: string
  client: string
  loadingProgress: number
  documents?: string[]
}

type Activity = {
  id: string
  action: string
  load: string
  user: string
  timestamp: string
  type: 'system' | 'user'
}

type DashboardMetrics = {
  totalLoads: number
  activeLoads: number
  completedLoads: number
  availableVehicles: number
  totalWeight: number
  pendingLoads: number
}

export default function LoadsPage() {
  const [activeTab, setActiveTab] = useState("loads")
  const [showNewLoadForm, setShowNewLoadForm] = useState(false)
  const [showLoadDetails, setShowLoadDetails] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loads, setLoads] = useState<Load[]>([])
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalLoads: 0,
    activeLoads: 0,
    completedLoads: 0,
    availableVehicles: 0,
    totalWeight: 0,
    pendingLoads: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para obtener datos de la API
  const fetchData = async <T,>(url: string): Promise<T> => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Error fetching ${url}: ${response.status}`)
    }
    return response.json()
  }

  // Cargar datos iniciales
  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const endpoints = [
        { url: "/api/loads", key: "loads" },
        { url: "/api/loads/activity", key: "activity" },
        { url: "/api/vehicles?status=disponible", key: "vehicles" }
      ]

      const results = await Promise.allSettled(
        endpoints.map(endpoint => fetchData<any>(endpoint.url))
      )

      const data = endpoints.reduce((acc, endpoint, index) => {
        const result = results[index]
        acc[endpoint.key] = result.status === "fulfilled" ? result.value : []
        return acc
      }, {} as Record<string, any>)

      setLoads(data.loads || [])
      setRecentActivity(data.activity || [])
      setAvailableVehicles(data.vehicles || [])

      // Calcular métricas
      const activeLoads = data.loads?.filter((l: Load) => 
        ['en_proceso', 'cargado', 'en_transito'].includes(l.status)).length || 0
      const completedLoads = data.loads?.filter((l: Load) => 
        l.status === 'completado').length || 0
      const pendingLoads = data.loads?.filter((l: Load) => 
        l.status === 'pendiente').length || 0
      const totalWeight = data.loads?.reduce((sum: number, l: Load) => 
        sum + l.totalWeight, 0) || 0

      setMetrics({
        totalLoads: data.loads?.length || 0,
        activeLoads,
        completedLoads,
        availableVehicles: data.vehicles?.length || 0,
        totalWeight,
        pendingLoads
      })

      // Mostrar advertencias para peticiones fallidas
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.warn(`Failed to fetch ${endpoints[index].url}:`, result.reason)
        }
      })

    } catch (error) {
      console.error("Error loading data:", error)
      setError(error instanceof Error ? error.message : "Error desconocido al cargar datos")
      
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de cargas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  const filteredLoads = loads.filter(
    (load) =>
      load.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (load.vehiclePlate && load.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getStatusColor = (status: string) => {
    const colors = {
      pendiente: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      en_proceso: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      cargado: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      en_transito: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      descargado: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      completado: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendiente":
        return <Clock className="h-4 w-4" />
      case "en_proceso":
        return <AlertCircle className="h-4 w-4" />
      case "cargado":
      case "completado":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    const texts = {
      pendiente: "Pendiente",
      en_proceso: "En Proceso",
      cargado: "Cargado",
      en_transito: "En Tránsito",
      descargado: "Descargado",
      completado: "Completado",
    }
    return texts[status as keyof typeof texts] || status
  }

  const handleLoadCreated = (newLoad: Load) => {
    setLoads(prev => [newLoad, ...prev])
    loadInitialData() // Recargar datos para asegurar consistencia
    toast({
      title: "Carga creada",
      description: `La carga ${newLoad.code} ha sido registrada exitosamente`,
    })
  }

  const handleLoadUpdated = (updatedLoad: Load) => {
    setLoads(prev => prev.map(l => l.id === updatedLoad.id ? updatedLoad : l))
    setSelectedLoad(updatedLoad)
    toast({
      title: "Carga actualizada",
      description: `La carga ${updatedLoad.code} ha sido modificada`,
    })
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Error al cargar los datos</h2>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        <Button onClick={loadInitialData} className="mt-4">
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
        <p className="text-lg text-muted-foreground">Cargando datos...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Cargas</h1>
          <p className="text-muted-foreground">
            Control de carga y descarga de mercancía • {metrics.totalLoads} cargas registradas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowQRScanner(true)}>
            <QrCode className="mr-2 h-4 w-4" />
            Escanear QR
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button 
            className="bg-[#0A2463] hover:bg-[#0A2463]/90" 
            onClick={() => setShowNewLoadForm(true)}
            disabled={metrics.availableVehicles === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Carga
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={loadInitialData}
            title="Actualizar datos"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-[#0A2463]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cargas</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLoads}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeLoads} activas • {metrics.completedLoads} completadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#F9DC5C]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cargas Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingLoads}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.availableVehicles} vehículos disponibles
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completedLoads}</div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('es-ES', { month: 'long' })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#0A2463]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vehículos Disponibles</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.availableVehicles}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.pendingLoads > 0 ? 
                `${metrics.pendingLoads} cargas esperando vehículo` : 
                "Todos asignados"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="loads" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#F2E9DC]">
          <TabsTrigger value="loads" className="data-[state=active]:bg-[#0A2463] data-[state=active]:text-white">
            Cargas
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-[#0A2463] data-[state=active]:text-white">
            Actividad
          </TabsTrigger>
          <TabsTrigger value="control" className="data-[state=active]:bg-[#0A2463] data-[state=active]:text-white">
            Control QR
          </TabsTrigger>
        </TabsList>

        <TabsContent value="loads" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Lista de Cargas</CardTitle>
                  <CardDescription>
                    {filteredLoads.length} de {loads.length} cargas mostradas
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar cargas..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      className="pl-8 w-[300px]"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredLoads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Package className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchTerm ? "No se encontraron cargas" : "No hay cargas registradas"}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setShowNewLoadForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Crear primera carga
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Peso (T)</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Progreso</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLoads.map((load: Load) => (
                      <TableRow key={load.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell className="font-medium">{load.code}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(load.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(load.status)}
                              {getStatusText(load.status)}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {load.vehiclePlate ? (
                            <div className="flex items-center gap-1">
                              <Truck className="h-4 w-4 text-[#0A2463]" />
                              {load.vehiclePlate}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Sin asignar</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {load.destination}
                          </div>
                        </TableCell>
                        <TableCell>{load.client}</TableCell>
                        <TableCell>{load.totalWeight.toFixed(1)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3 text-muted-foreground" />
                            {load.itemsCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={load.loadingProgress} className="h-2 w-16" />
                            <span className="text-xs">{load.loadingProgress}%</span>
                          </div>
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
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedLoad(load)
                                  setShowLoadDetails(true)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar carga
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <QrCode className="h-4 w-4 mr-2" />
                                Ver QR
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Checklist
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                {recentActivity.length} eventos registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No hay actividad registrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity: Activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50">
                      <div className="flex items-center gap-4">
                        <div className={`rounded-full p-2 ${
                          activity.type === 'system' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {activity.type === 'system' ? (
                            <AlertCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.load} • {activity.user}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {activity.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="control" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Control por Código QR</CardTitle>
              <CardDescription>Escaneo y control de cargas mediante códigos QR</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <QrCode className="h-16 w-16 mx-auto text-[#0A2463]/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">Control de Carga/Descarga</h3>
                <p className="text-muted-foreground mb-6">
                  Utilice el escáner QR para controlar el proceso de carga y descarga de mercancía
                </p>
                <Button 
                  onClick={() => setShowQRScanner(true)} 
                  className="bg-[#0A2463] hover:bg-[#0A2463]/90"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Abrir Escáner
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogos */}
      
      
      <LoadDetailsDialog 
        open={showLoadDetails} 
        onOpenChange={setShowLoadDetails} 
        load={selectedLoad}
      />
      
      <QRScannerDialog 
        open={showQRScanner} 
        onOpenChange={setShowQRScanner} 
        onScanSuccess={(loadId: string) => {
          toast({
            title: "QR Escaneado",
            description: "La carga ha sido verificada correctamente",
          })
          // Actualizar el estado específico de la carga escaneada
          setLoads((prev: Load[]) => prev.map((load: Load) => 
            load.id === loadId ? {...load, status: 'completado'} : load
          ))
          loadInitialData()
        }}
      />
    </div>
  )
}