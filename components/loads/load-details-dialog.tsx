"use client"

import { useState } from "react"
import { Boxes, Package, Truck, MapPin, Calendar, User, QrCode, CheckCircle, Clock, AlertCircle } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

// Datos simulados de items y checklist
const loadItems = [
  {
    id: "1",
    productCode: "PROD-001",
    productName: "Aceite Motor 20W-50",
    quantity: 50,
    unit: "L",
    weight: 45,
    volume: 0.05,
    unitValue: 25,
    totalValue: 1250,
    loaded: true,
    loadedAt: "2024-01-15T08:30:00",
  },
  {
    id: "2",
    productCode: "PROD-002",
    productName: "Filtro de Aire",
    quantity: 10,
    unit: "unidad",
    weight: 5,
    volume: 0.02,
    unitValue: 15,
    totalValue: 150,
    loaded: true,
    loadedAt: "2024-01-15T08:45:00",
  },
  {
    id: "3",
    productCode: "PROD-003",
    productName: "Gasolina Premium",
    quantity: 200,
    unit: "L",
    weight: 150,
    volume: 0.2,
    unitValue: 8,
    totalValue: 1600,
    loaded: false,
    loadedAt: null,
  },
]

const checklist = [
  {
    id: "1",
    type: "loading",
    itemName: "Verificar documentación",
    description: "Revisar facturas y órdenes de carga",
    required: true,
    completed: true,
    completedAt: "2024-01-15T08:00:00",
    completedBy: "Juan Pérez",
  },
  {
    id: "2",
    type: "loading",
    itemName: "Inspección del vehículo",
    description: "Verificar estado del vehículo antes de la carga",
    required: true,
    completed: true,
    completedAt: "2024-01-15T08:15:00",
    completedBy: "Juan Pérez",
  },
  {
    id: "3",
    type: "loading",
    itemName: "Verificar capacidad",
    description: "Confirmar que el vehículo puede transportar la carga",
    required: true,
    completed: false,
    completedAt: null,
    completedBy: null,
  },
  {
    id: "4",
    type: "loading",
    itemName: "Asegurar carga",
    description: "Verificar que la carga esté correctamente asegurada",
    required: true,
    completed: false,
    completedAt: null,
    completedBy: null,
  },
]

interface LoadDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  load: any
}

export function LoadDetailsDialog({ open, onOpenChange, load }: LoadDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("general")

  if (!load) return null

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

  const completedItems = loadItems.filter((item) => item.loaded).length
  const totalItems = loadItems.length
  const loadingProgress = (completedItems / totalItems) * 100

  const completedChecklist = checklist.filter((item) => item.completed).length
  const totalChecklist = checklist.length
  const checklistProgress = (completedChecklist / totalChecklist) * 100

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Boxes className="h-5 w-5 text-[#0A2463]" />
            {load.code}
          </DialogTitle>
          <DialogDescription>Detalles completos de la carga</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="items">Items ({totalItems})</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Información Básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Estado:</span>
                    <div className="mt-1">
                      <Badge variant="outline" className={getStatusColor(load.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(load.status)}
                          {getStatusText(load.status)}
                        </div>
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Cliente:</span>
                    <p>{load.client}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Origen:</span>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-green-600" />
                      <span>{load.origin}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Destino:</span>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-red-600" />
                      <span>{load.destination}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Vehículo Asignado</CardTitle>
                </CardHeader>
                <CardContent>
                  {load.vehiclePlate ? (
                    <div className="flex items-center gap-2">
                      <Truck className="h-8 w-8 text-[#0A2463]" />
                      <div>
                        <p className="font-medium">{load.vehiclePlate}</p>
                        <p className="text-sm text-muted-foreground">Vehículo asignado</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Truck className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Sin vehículo asignado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-[#0A2463]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Peso Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{load.totalWeight} T</div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-[#F9DC5C]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Volumen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{load.totalVolume} m³</div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Valor Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${load.totalValue}</div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{load.itemsCount}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Progreso de Carga</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Items cargados</span>
                    <span>
                      {completedItems} de {totalItems}
                    </span>
                  </div>
                  <Progress value={loadingProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">{loadingProgress.toFixed(1)}% completado</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Items de la Carga</CardTitle>
                <CardDescription>Detalle de todos los productos en esta carga</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Peso</TableHead>
                      <TableHead>Volumen</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">{item.productCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell>{item.weight} kg</TableCell>
                        <TableCell>{item.volume} m³</TableCell>
                        <TableCell>${item.totalValue}</TableCell>
                        <TableCell>
                          {item.loaded ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Cargado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800">
                              <Clock className="h-3 w-3 mr-1" />
                              Pendiente
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Checklist de Carga</CardTitle>
                <CardDescription>Lista de verificación para el proceso de carga</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Progreso del checklist</span>
                    <span>
                      {completedChecklist} de {totalChecklist}
                    </span>
                  </div>
                  <Progress value={checklistProgress} className="h-2" />
                </div>

                <div className="space-y-4">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="mt-1">
                        {item.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{item.itemName}</h4>
                          {item.required && (
                            <Badge variant="outline" className="text-xs">
                              Obligatorio
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                        {item.completed && item.completedBy && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {item.completedBy}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.completedAt!).toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>
                      {!item.completed && (
                        <Button size="sm" variant="outline">
                          Completar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Código QR de la Carga</CardTitle>
                <CardDescription>Código para identificación rápida y control</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="w-48 h-48 bg-[#F2E9DC]/20 rounded-lg flex items-center justify-center mb-4">
                      <QrCode className="h-32 w-32 text-[#0A2463]" />
                    </div>
                    <p className="font-mono text-lg font-medium">{load.qrCode || `QR-${load.code}`}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Escanee este código para acceso rápido a la información de la carga
                    </p>
                    <div className="flex gap-2 mt-4 justify-center">
                      <Button variant="outline" size="sm">
                        Descargar QR
                      </Button>
                      <Button variant="outline" size="sm">
                        Imprimir
                      </Button>
                    </div>
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
