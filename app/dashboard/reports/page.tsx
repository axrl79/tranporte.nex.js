"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { FileText, Download, Calendar, TrendingUp, Truck, DollarSign, Package, Wrench, Route } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

const COLORS = ["#0A2463", "#F9DC5C", "#D90429", "#8B5A3C", "#2E8B57"]

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("fleet")
  const [reportData, setReportData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  })

  const generateReport = async (reportType: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        type: reportType,
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
      })

      const response = await fetch(`/api/reports?${params}`)
      if (!response.ok) {
        throw new Error("Error al generar reporte")
      }

      const data = await response.json()
      setReportData((prev: any) => ({ ...prev, [reportType]: data }))

      toast({
        title: "Reporte generado",
        description: `Reporte de ${reportType} generado exitosamente`,
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = (reportType: string, format: string) => {
    // Simular exportación
    toast({
      title: "Exportando reporte",
      description: `Exportando reporte de ${reportType} en formato ${format}`,
    })
  }

  useEffect(() => {
    // Generar reportes iniciales
    generateReport("fleet")
    generateReport("trips")
    generateReport("maintenance")
    generateReport("inventory")
    generateReport("financial")
  }, [])

  const fleetData = reportData.fleet || {}
  const tripsData = reportData.trips || {}
  const maintenanceData = reportData.maintenance || {}
  const inventoryData = reportData.inventory || {}
  const financialData = reportData.financial || {}

  // Datos para gráficos
  const vehicleUtilizationData = fleetData.vehicleUtilization || []
  const maintenanceByTypeData = maintenanceData.maintenanceByType
    ? Object.entries(maintenanceData.maintenanceByType).map(([type, count]) => ({
        type,
        count,
      }))
    : []

  const movementsByTypeData = inventoryData.movementsByType
    ? Object.entries(inventoryData.movementsByType).map(([type, count]) => ({
        type,
        count,
      }))
    : []

  const financialTrendData = [
    { month: "Ene", revenue: 45000, expenses: 32000 },
    { month: "Feb", revenue: 52000, expenses: 38000 },
    { month: "Mar", revenue: 48000, expenses: 35000 },
    { month: "Abr", revenue: 61000, expenses: 42000 },
    { month: "May", revenue: 55000, expenses: 39000 },
    { month: "Jun", revenue: 67000, expenses: 45000 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes y Análisis</h1>
          <p className="text-muted-foreground">Informes detallados y análisis de rendimiento</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="startDate">Desde:</Label>
            <Input
              id="startDate"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
              className="w-auto"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="endDate">Hasta:</Label>
            <Input
              id="endDate"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
              className="w-auto"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="fleet">Flota</TabsTrigger>
          <TabsTrigger value="trips">Viajes</TabsTrigger>
          <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="financial">Financiero</TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Vehículos</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fleetData.totalVehicles || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {fleetData.activeVehicles || 0} activos, {fleetData.inMaintenanceVehicles || 0} en mantenimiento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Viajes Totales</CardTitle>
                <Route className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fleetData.totalTrips || 0}</div>
                <p className="text-xs text-muted-foreground">{fleetData.completedTrips || 0} completados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilización Promedio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">+5% vs mes anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">Puntualidad en entregas</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Utilización por Vehículo</CardTitle>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => generateReport("fleet")} disabled={isLoading}>
                    <FileText className="mr-2 h-4 w-4" />
                    Actualizar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => exportReport("fleet", "PDF")}>
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vehicleUtilizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="plateNumber" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="utilization" fill="#0A2463" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado de Vehículos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Disponibles", value: fleetData.activeVehicles || 0 },
                        { name: "En Mantenimiento", value: fleetData.inMaintenanceVehicles || 0 },
                        { name: "Fuera de Servicio", value: 2 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trips" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Viajes Totales</CardTitle>
                <Route className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tripsData.totalTrips || 0}</div>
                <p className="text-xs text-muted-foreground">{tripsData.completedTrips || 0} completados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Distancia Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(tripsData.totalDistance || 0).toLocaleString()} km</div>
                <p className="text-xs text-muted-foreground">Este período</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Consumo Promedio</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tripsData.averageFuelConsumption || 0} L/100km</div>
                <p className="text-xs text-muted-foreground">Combustible</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Puntualidad</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tripsData.onTimePerformance || 0}%</div>
                <p className="text-xs text-muted-foreground">Entregas a tiempo</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rendimiento de Viajes</CardTitle>
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => generateReport("trips")} disabled={isLoading}>
                  <FileText className="mr-2 h-4 w-4" />
                  Actualizar
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportReport("trips", "Excel")}>
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Gráfico de rendimiento de viajes (próximamente)
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Mantenimientos</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{maintenanceData.totalMaintenances || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {maintenanceData.completedMaintenances || 0} completados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Bs. {(maintenanceData.totalCost || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Promedio: Bs. {(maintenanceData.averageCost || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Programados</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{maintenanceData.scheduledMaintenances || 0}</div>
                <p className="text-xs text-muted-foreground">Próximos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">Tiempo de respuesta</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mantenimientos por Tipo</CardTitle>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => generateReport("maintenance")} disabled={isLoading}>
                    <FileText className="mr-2 h-4 w-4" />
                    Actualizar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => exportReport("maintenance", "PDF")}>
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={maintenanceByTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#F9DC5C" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Costos de Mantenimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Gráfico de tendencia de costos (próximamente)
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inventoryData.totalProducts || 0}</div>
                <p className="text-xs text-muted-foreground">{inventoryData.lowStockProducts || 0} con stock bajo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Bs. {(inventoryData.totalInventoryValue || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Valor total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Movimientos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inventoryData.totalMovements || 0}</div>
                <p className="text-xs text-muted-foreground">Este período</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rotación</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2x</div>
                <p className="text-xs text-muted-foreground">Veces por año</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Movimientos por Tipo</CardTitle>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => generateReport("inventory")} disabled={isLoading}>
                    <FileText className="mr-2 h-4 w-4" />
                    Actualizar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => exportReport("inventory", "Excel")}>
                    <Download className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={movementsByTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {movementsByTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Productos con Stock Bajo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Lista de productos con stock crítico (próximamente)
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Bs. {(financialData.totalRevenue || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Este período</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Bs. {(financialData.totalExpenses || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Mantenimiento: Bs. {(financialData.maintenanceCosts || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ganancia</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Bs. {(financialData.profit || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Margen: {(financialData.profitMargin || 0).toFixed(1)}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Combustible</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Bs. {(financialData.fuelCosts || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Costo combustible</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tendencia Financiera</CardTitle>
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => generateReport("financial")} disabled={isLoading}>
                  <FileText className="mr-2 h-4 w-4" />
                  Actualizar
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportReport("financial", "PDF")}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={financialTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#0A2463" strokeWidth={2} name="Ingresos" />
                  <Line type="monotone" dataKey="expenses" stroke="#D90429" strokeWidth={2} name="Gastos" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
