"use client"

import { useState } from "react"
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

// Datos simulados
const loads = [
  {
    id: "1",
    code: "CARGA-001",
    status: "cargado",
    vehicleId: "v1",
    vehiclePlate: "ABC-123",
    tripId: "t1",
    totalWeight: 2.5,
    totalVolume: 1.2,
    totalValue: 15000,
    itemsCount: 3,
    loadingDate: "2024-01-15T08:00:00",
    origin: "Almacén Central",
    destination: "Santa Cruz",
    client: "Empresa ABC",
    loadingProgress: 100,
  },
  {
    id: "2",
    code: "CARGA-002",
    status: "en_proceso",
    vehicleId: "v2",
    vehiclePlate: "XYZ-789",
    tripId: null,
    totalWeight: 1.8,
    totalVolume: 0.9,
    totalValue: 8500,
    itemsCount: 2,
    loadingDate: null,
    origin: "Almacén Central",
    destination: "Cochabamba",
    client: "Distribuidora XYZ",
    loadingProgress: 65,
  },
  {
    id: "3",
    code: "CARGA-003",
    status: "pendiente",
    vehicleId: null,
    vehiclePlate: null,
    tripId: null,
    totalWeight: 3.2,
    totalVolume: 1.8,
    totalValue: 22000,
    itemsCount: 5,
    loadingDate: null,
    origin: "Almacén Central",
    destination: "La Paz",
    client: "Comercial 123",
    loadingProgress: 0,
  },
]

const recentActivity = [
  {
    id: "1",
    action: "Carga completada",
    load: "CARGA-001",
    user: "Juan Pérez",
    timestamp: "2024-01-15 10:30",
  },
  {
    id: "2",
    action: "Inicio de carga",
    load: "CARGA-002",
    user: "María García",
    timestamp: "2024-01-15 09:15",
  },
  {
    id: "3",
    action: "Carga creada",
    load: "CARGA-003",
    user: "Carlos López",
    timestamp: "2024-01-15 08:45",
  },
]

export default function LoadsPage() {
  const [activeTab, setActiveTab] = useState("loads")
  const [showNewLoadForm, setShowNewLoadForm] = useState(false)
  const [showLoadDetails, setShowLoadDetails] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [selectedLoad, setSelectedLoad] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLoads = loads.filter(
    (load) =>
      load.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.destination.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    const colors = {
      pendiente: "bg-gray-100 text-gray-800",
      en_proceso: "bg-blue-100 text-blue-800",
      cargado: "bg-green-100 text-green-800",
      en_transito: "bg-purple-100 text-purple-800",
      descargado: "bg-yellow-100 text-yellow-800",
      completado: "bg-emerald-100 text-emerald-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
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

  const totalLoads = loads.length
  const activeLoads = loads.filter((load) => ["en_proceso", "cargado", "en_transito"].includes(load.status)).length
  const completedLoads = loads.filter((load) => load.status === "completado").length
  const totalWeight = loads.reduce((sum, load) => sum + load.totalWeight, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Cargas</h1>
          <p className="text-muted-foreground">Control de carga y descarga de mercancía</p>
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
          <Button className="bg-[#0A2463] hover:bg-[#0A2463]/90" onClick={() => setShowNewLoadForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Carga
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
            <div className="text-2xl font-bold">{totalLoads}</div>
            <p className="text-xs text-muted-foreground">+3 nuevas esta semana</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#F9DC5C]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cargas Activas</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoads}</div>
            <p className="text-xs text-muted-foreground">En proceso o cargadas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedLoads}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#0A2463]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Peso Total</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWeight.toFixed(1)} T</div>
            <p className="text-xs text-muted-foreground">Carga actual</p>
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
                  <CardDescription>Gestión completa de cargas de mercancía</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar cargas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Peso</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Progreso</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoads.map((load) => (
                    <TableRow key={load.id}>
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
                      <TableCell>{load.totalWeight} T</TableCell>
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
                      <TableCell>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones realizadas en el sistema de cargas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full p-2 bg-[#0A2463]/10">
                        <Boxes className="h-4 w-4 text-[#0A2463]" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.load} - {activity.user}
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
                <Button onClick={() => setShowQRScanner(true)} className="bg-[#0A2463] hover:bg-[#0A2463]/90">
                  <QrCode className="mr-2 h-4 w-4" />
                  Abrir Escáner
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogos */}
      <NewLoadForm open={showNewLoadForm} onOpenChange={setShowNewLoadForm} />
      <LoadDetailsDialog open={showLoadDetails} onOpenChange={setShowLoadDetails} load={selectedLoad} />
      <QRScannerDialog open={showQRScanner} onOpenChange={setShowQRScanner} />
    </div>
  )
}
