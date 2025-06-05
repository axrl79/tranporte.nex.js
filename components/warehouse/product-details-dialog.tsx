"use client"

import { useState } from "react"
import { Package, MapPin, QrCode, TrendingUp, TrendingDown, Calendar, User, BarChart3 } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Datos simulados de movimientos
const recentMovements = [
  {
    id: "1",
    type: "entrada",
    quantity: 100,
    user: "Juan Pérez",
    timestamp: "2024-01-15 10:30",
    reference: "FAC-001",
    reason: "Compra",
  },
  {
    id: "2",
    type: "salida",
    quantity: 25,
    user: "María García",
    timestamp: "2024-01-14 14:20",
    reference: "CARGA-001",
    reason: "Carga a Vehículo",
  },
  {
    id: "3",
    type: "salida",
    quantity: 15,
    user: "Carlos López",
    timestamp: "2024-01-13 09:15",
    reference: "VIAJE-002",
    reason: "Carga a Vehículo",
  },
]

interface ProductDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: any
}

export function ProductDetailsDialog({ open, onOpenChange, product }: ProductDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("general")

  if (!product) return null

  const getStockStatus = () => {
    const percentage = (product.currentStock / product.maxStock) * 100
    if (percentage <= 20) return { status: "Crítico", color: "bg-red-500", textColor: "text-red-800" }
    if (percentage <= 40) return { status: "Bajo", color: "bg-yellow-500", textColor: "text-yellow-800" }
    return { status: "Normal", color: "bg-green-500", textColor: "text-green-800" }
  }

  const getTypeColor = (type: string) => {
    const colors = {
      liquido: "bg-blue-100 text-blue-800",
      solido: "bg-gray-100 text-gray-800",
      fragil: "bg-orange-100 text-orange-800",
      peligroso: "bg-red-100 text-red-800",
      perecedero: "bg-green-100 text-green-800",
      general: "bg-purple-100 text-purple-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getMovementTypeColor = (type: string) => {
    const colors = {
      entrada: "bg-green-100 text-green-800",
      salida: "bg-red-100 text-red-800",
      ajuste: "bg-blue-100 text-blue-800",
      transferencia: "bg-purple-100 text-purple-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const stockStatus = getStockStatus()
  const stockPercentage = (product.currentStock / product.maxStock) * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Package className="h-5 w-5 text-[#0A2463]" />
            {product.name}
          </DialogTitle>
          <DialogDescription>Información detallada del producto</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="movements">Movimientos</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Información Básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Código:</span>
                    <p className="font-mono">{product.code}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Tipo:</span>
                    <div className="mt-1">
                      <Badge variant="outline" className={getTypeColor(product.type)}>
                        {product.type}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Unidad:</span>
                    <p>{product.unit}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Ubicación:</span>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{product.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Código QR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-6 bg-[#F2E9DC]/20 rounded-lg">
                    <div className="text-center">
                      <QrCode className="h-16 w-16 mx-auto text-[#0A2463] mb-2" />
                      <p className="text-sm font-mono">{product.qrCode}</p>
                      <p className="text-xs text-muted-foreground mt-1">Escanear para acceso rápido</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {product.description && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{product.description}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stock" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-[#0A2463]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Stock Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {product.currentStock} {product.unit}
                  </div>
                  <div className="mt-2">
                    <Progress value={stockPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{stockPercentage.toFixed(1)}% de capacidad</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Disponible</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {product.availableStock} {product.unit}
                  </div>
                  <p className="text-xs text-muted-foreground">Listo para usar</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Reservado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {product.reservedStock} {product.unit}
                  </div>
                  <p className="text-xs text-muted-foreground">Asignado a cargas</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Límites de Stock</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Mínimo:</span>
                    <span className="font-medium">
                      {product.minStock} {product.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Máximo:</span>
                    <span className="font-medium">
                      {product.maxStock} {product.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    <Badge variant="outline" className={`${stockStatus.textColor} bg-opacity-10`}>
                      {stockStatus.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Estadísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Rotación (30 días):</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valor estimado:</span>
                    <span className="font-medium">$2,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Última actualización:</span>
                    <span className="font-medium">Hoy 14:30</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="movements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Movimientos Recientes</CardTitle>
                <CardDescription>Últimos movimientos de inventario para este producto</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Referencia</TableHead>
                      <TableHead>Razón</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>
                          <Badge variant="outline" className={getMovementTypeColor(movement.type)}>
                            {movement.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {movement.type === "entrada" ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            {movement.quantity} {product.unit}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {movement.user}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {movement.timestamp}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{movement.reference}</TableCell>
                        <TableCell>{movement.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Gráfico de Movimientos</CardTitle>
                <CardDescription>Tendencia de stock en los últimos 30 días</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center bg-[#F2E9DC]/20 rounded-md">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-[#0A2463]/50" />
                    <p className="mt-2 text-sm text-muted-foreground">Gráfico de tendencia de stock</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
