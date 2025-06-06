"use client"

import { useState, useEffect } from "react"
import {
  Clock,
  DollarSign,
  Plus,
  Search,
  Filter,
  Download,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  User,
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
import { toast } from "@/components/ui/use-toast"
import { NewMaintenanceForm } from "@/components/maintenance/new-maintenance-form"
import { MaintenanceDetailsDialog } from "@/components/maintenance/maintenance-details-dialog"
import { EditMaintenanceForm } from "@/components/maintenance/edit-maintenance-form"

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState("scheduled")
  const [maintenances, setMaintenances] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewMaintenanceFormOpen, setIsNewMaintenanceFormOpen] = useState(false)
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const fetchMaintenances = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/maintenances")
      if (!response.ok) {
        throw new Error("Error al cargar mantenimientos")
      }
      const data = await response.json()
      setMaintenances(data)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los mantenimientos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMaintenances()
  }, [])

  const handleMaintenanceCreated = (newMaintenance: any) => {
    setMaintenances((prev) => [newMaintenance, ...prev])
  }

  const handleMaintenanceUpdated = (updatedMaintenance: any) => {
    setMaintenances((prev) =>
      prev.map((maintenance) => (maintenance.id === updatedMaintenance.id ? updatedMaintenance : maintenance)),
    )
    setSelectedMaintenance(updatedMaintenance)
  }

  const handleDeleteMaintenance = async (maintenanceId: string) => {
    try {
      const response = await fetch(`/api/maintenances/${maintenanceId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al eliminar mantenimiento")
      }

      setMaintenances((prev) => prev.filter((m) => m.id !== maintenanceId))
      toast({
        title: "Mantenimiento eliminado",
        description: "El mantenimiento ha sido eliminado exitosamente",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar mantenimiento",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "programado":
        return "bg-blue-100 text-blue-800"
      case "en_proceso":
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
      case "en_proceso":
        return <Wrench className="h-4 w-4" />
      case "completado":
        return <CheckCircle className="h-4 w-4" />
      case "cancelado":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
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

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(Number(amount))
  }

  const filteredMaintenances = maintenances.filter((maintenance) => {
    const matchesSearch =
      maintenance.vehicle?.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      maintenance.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      maintenance.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "scheduled" && maintenance.status === "programado") ||
      (activeTab === "in_progress" && maintenance.status === "en_proceso") ||
      (activeTab === "completed" && maintenance.status === "completado")

    return matchesSearch && matchesTab
  })

  const stats = {
    total: maintenances.length,
    scheduled: maintenances.filter((m) => m.status === "programado").length,
    inProgress: maintenances.filter((m) => m.status === "en_proceso").length,
    completed: maintenances.filter((m) => m.status === "completado").length,
    totalCost: maintenances
      .filter((m) => m.status === "completado" && m.cost)
      .reduce((sum, m) => sum + Number(m.cost), 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Mantenimiento</h1>
          <p className="text-muted-foreground">Control y seguimiento de mantenimientos de vehículos</p>
        </div>
        <Button onClick={() => setIsNewMaintenanceFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Mantenimiento
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Mantenimientos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programados</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Pendientes de realizar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">En ejecución</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Finalizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCost.toString())}</div>
            <p className="text-xs text-muted-foreground">Mantenimientos completados</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="scheduled">Programados</TabsTrigger>
            <TabsTrigger value="in_progress">En Proceso</TabsTrigger>
            <TabsTrigger value="completed">Completados</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar mantenimientos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Mantenimientos</CardTitle>
              <CardDescription>Gestión completa de mantenimientos de vehículos</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A2463] mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Cargando mantenimientos...</p>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Fecha Programada</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Conductor</TableHead>
                      <TableHead>Costo</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaintenances.map((maintenance) => (
                      <TableRow key={maintenance.id}>
                        <TableCell className="font-medium">
                          {maintenance.vehicle?.plateNumber || "N/A"}
                          <div className="text-sm text-muted-foreground">
                            {maintenance.vehicle?.brand} {maintenance.vehicle?.model}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{maintenance.type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{maintenance.description}</TableCell>
                        <TableCell>{formatDate(maintenance.scheduledDate)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(maintenance.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(maintenance.status)}
                              {maintenance.status}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {maintenance.technician ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {maintenance.technician.name}
                            </div>
                          ) : (
                            "Sin asignar"
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(maintenance.cost)}</TableCell>
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
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedMaintenance(maintenance)
                                  setIsDetailsOpen(true)
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedMaintenance(maintenance)
                                  setIsEditOpen(true)
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteMaintenance(maintenance.id)}
                                className="text-red-600"
                                disabled={maintenance.status === "completado"}
                              >
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogos */}
      <NewMaintenanceForm
        open={isNewMaintenanceFormOpen}
        onOpenChange={setIsNewMaintenanceFormOpen}
        onMaintenanceCreated={handleMaintenanceCreated}
      />

      <MaintenanceDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        maintenance={selectedMaintenance}
        onEdit={() => {
          setIsDetailsOpen(false)
          setIsEditOpen(true)
        }}
      />

      <EditMaintenanceForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        maintenance={selectedMaintenance}
        onMaintenanceUpdated={handleMaintenanceUpdated}
      />
    </div>
  )
}
