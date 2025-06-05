"use client"

import { useState } from "react"
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  MoreHorizontal,
  QrCode,
  ArrowUpDown,
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
import { NewProductForm } from "@/components/warehouse/new-product-form"
import { InventoryMovementForm } from "@/components/warehouse/inventory-movement-form"
import { ProductDetailsDialog } from "@/components/warehouse/product-details-dialog"

// Datos simulados
const products = [
  {
    id: "1",
    code: "PROD-001",
    name: "Aceite Motor 20W-50",
    type: "liquido",
    unit: "L",
    currentStock: 150,
    minStock: 50,
    maxStock: 500,
    availableStock: 120,
    reservedStock: 30,
    location: "A-01-15",
    qrCode: "QR001",
  },
  {
    id: "2",
    code: "PROD-002",
    name: "Filtro de Aire",
    type: "general",
    unit: "unidad",
    currentStock: 25,
    minStock: 20,
    maxStock: 100,
    availableStock: 25,
    reservedStock: 0,
    location: "B-03-08",
    qrCode: "QR002",
  },
  {
    id: "3",
    code: "PROD-003",
    name: "Gasolina Premium",
    type: "liquido",
    unit: "L",
    currentStock: 2500,
    minStock: 1000,
    maxStock: 5000,
    availableStock: 2200,
    reservedStock: 300,
    location: "C-01-01",
    qrCode: "QR003",
  },
  {
    id: "4",
    code: "PROD-004",
    name: "Repuestos Frenos",
    type: "fragil",
    unit: "kit",
    currentStock: 8,
    minStock: 15,
    maxStock: 50,
    availableStock: 8,
    reservedStock: 0,
    location: "D-02-12",
    qrCode: "QR004",
  },
]

const recentMovements = [
  {
    id: "1",
    product: "Aceite Motor 20W-50",
    type: "entrada",
    quantity: 100,
    user: "Juan Pérez",
    timestamp: "2024-01-15 10:30",
    reference: "FAC-001",
  },
  {
    id: "2",
    product: "Filtro de Aire",
    type: "salida",
    quantity: 5,
    user: "María García",
    timestamp: "2024-01-15 09:15",
    reference: "CARGA-001",
  },
  {
    id: "3",
    product: "Gasolina Premium",
    type: "salida",
    quantity: 300,
    user: "Carlos López",
    timestamp: "2024-01-15 08:45",
    reference: "VIAJE-001",
  },
]

export default function WarehousePage() {
  const [activeTab, setActiveTab] = useState("inventory")
  const [showNewProductForm, setShowNewProductForm] = useState(false)
  const [showMovementForm, setShowMovementForm] = useState(false)
  const [showProductDetails, setShowProductDetails] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const lowStockProducts = products.filter((product) => product.currentStock <= product.minStock)

  const getStockStatus = (product: any) => {
    const percentage = (product.currentStock / product.maxStock) * 100
    if (percentage <= 20) return { status: "critical", color: "bg-red-500" }
    if (percentage <= 40) return { status: "low", color: "bg-yellow-500" }
    return { status: "normal", color: "bg-green-500" }
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Almacén</h1>
          <p className="text-muted-foreground">Control de inventario y movimientos de mercancía</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button className="bg-[#0A2463] hover:bg-[#0A2463]/90" onClick={() => setShowNewProductForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-[#0A2463]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">+2 nuevos este mes</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#F9DC5C]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Inventario</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$125,430</div>
            <p className="text-xs text-muted-foreground">+5.2% desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#D90429]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-[#D90429]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">Productos requieren reposición</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#0A2463]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Movimientos Hoy</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">15 entradas, 8 salidas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#F2E9DC]">
          <TabsTrigger value="inventory" className="data-[state=active]:bg-[#0A2463] data-[state=active]:text-white">
            Inventario
          </TabsTrigger>
          <TabsTrigger value="movements" className="data-[state=active]:bg-[#0A2463] data-[state=active]:text-white">
            Movimientos
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-[#0A2463] data-[state=active]:text-white">
            Alertas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Inventario de Productos</CardTitle>
                  <CardDescription>Gestión completa del inventario de almacén</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-[300px]"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                  </Button>
                  <Button size="sm" onClick={() => setShowMovementForm(true)}>
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Movimiento
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Stock Actual</TableHead>
                    <TableHead>Disponible</TableHead>
                    <TableHead>Reservado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product)
                    const stockPercentage = (product.currentStock / product.maxStock) * 100

                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.code}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-[#0A2463]" />
                            {product.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getTypeColor(product.type)}>
                            {product.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {product.currentStock} {product.unit}
                            </span>
                            <div className="w-16">
                              <Progress value={stockPercentage} className="h-2" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.availableStock} {product.unit}
                        </TableCell>
                        <TableCell>
                          {product.reservedStock} {product.unit}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              stockStatus.status === "critical"
                                ? "bg-red-100 text-red-800"
                                : stockStatus.status === "low"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                            }
                          >
                            {stockStatus.status === "critical"
                              ? "Crítico"
                              : stockStatus.status === "low"
                                ? "Bajo"
                                : "Normal"}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.location}</TableCell>
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
                                  setSelectedProduct(product)
                                  setShowProductDetails(true)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar producto
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <QrCode className="h-4 w-4 mr-2" />
                                Generar QR
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ArrowUpDown className="h-4 w-4 mr-2" />
                                Movimiento
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Movimientos Recientes</CardTitle>
              <CardDescription>Historial de entradas y salidas de inventario</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Referencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="font-medium">{movement.product}</TableCell>
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
                          {movement.quantity}
                        </div>
                      </TableCell>
                      <TableCell>{movement.user}</TableCell>
                      <TableCell>{movement.timestamp}</TableCell>
                      <TableCell>{movement.reference}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Stock</CardTitle>
              <CardDescription>Productos que requieren atención inmediata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full p-2 bg-red-100">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Stock actual: {product.currentStock} {product.unit} (Mínimo: {product.minStock} {product.unit}
                          )
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Reabastecer
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogos */}
      <NewProductForm open={showNewProductForm} onOpenChange={setShowNewProductForm} />
      <InventoryMovementForm open={showMovementForm} onOpenChange={setShowMovementForm} />
      <ProductDetailsDialog open={showProductDetails} onOpenChange={setShowProductDetails} product={selectedProduct} />
    </div>
  )
}
