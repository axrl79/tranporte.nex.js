"use client"

import { useState } from "react"
import { QrCode, Camera, Search, Package, Boxes, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

interface QRScannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScanSuccess?: (scannedData: any) => void
}

type ScannedLoad = {
  type: "load"
  id: string
  code: string
  status: string
  client: string
  itemsCount: number
  totalWeight: number
  vehiclePlate?: string
  origin: string
  destination: string
}

type ScannedProduct = {
  type: "product"
  id: string
  code: string
  name: string
  currentStock: number
  location: string
  unit: string
  unitWeight: number
}

export function QRScannerDialog({ open, onOpenChange, onScanSuccess }: QRScannerDialogProps) {
  const [activeTab, setActiveTab] = useState<"scanner" | "manual">("scanner")
  const [manualCode, setManualCode] = useState("")
  const [scannedData, setScannedData] = useState<ScannedLoad | ScannedProduct | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleQRScan = async (qrCode: string) => {
    setIsLoading(true)
    try {
      // Primero intentamos buscar como carga
      const loadResponse = await fetch(`/api/loads/qr/${qrCode}`)
      
      if (loadResponse.ok) {
        const loadData: ScannedLoad = await loadResponse.json()
        setScannedData({ ...loadData, type: "load" })
        toast({
          title: "Carga encontrada",
          description: `Carga ${loadData.code} escaneada correctamente`,
        })
        if (onScanSuccess) onScanSuccess(loadData)
        return
      }

      // Si no es carga, buscamos como producto
      const productResponse = await fetch(`/api/products/qr/${qrCode}`)
      
      if (productResponse.ok) {
        const productData: ScannedProduct = await productResponse.json()
        setScannedData({ ...productData, type: "product" })
        toast({
          title: "Producto encontrado",
          description: `${productData.name} escaneado correctamente`,
        })
        if (onScanSuccess) onScanSuccess(productData)
        return
      }

      // Si no se encontró nada
      toast({
        title: "QR No Encontrado",
        description: "El código QR no está registrado en el sistema",
        variant: "destructive",
      })
      setScannedData(null)
    } catch (error) {
      console.error("Error al escanear QR:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar el código QR",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Buscar código manual
  const handleManualSearch = () => {
    if (!manualCode.trim()) {
      toast({
        title: "Error",
        description: "Ingrese un código QR para buscar",
        variant: "destructive",
      })
      return
    }

    handleQRScan(manualCode.trim())
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "load":
        return <Boxes className="h-5 w-5 text-[#0A2463]" />
      case "product":
        return <Package className="h-5 w-5 text-[#0A2463]" />
      default:
        return <QrCode className="h-5 w-5 text-[#0A2463]" />
    }
  }

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

  const handleMarkAsLoaded = async (loadId: string) => {
    try {
      const response = await fetch(`/api/loads/${loadId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cargado" }),
      })

      if (response.ok) {
        toast({
          title: "Estado actualizado",
          description: "La carga ha sido marcada como cargada",
        })
        if (scannedData?.type === "load") {
          setScannedData({ ...scannedData, status: "cargado" })
        }
      } else {
        throw new Error("Error al actualizar estado")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la carga",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <QrCode className="h-5 w-5 text-[#0A2463]" />
            Escáner QR
          </DialogTitle>
          <DialogDescription>Escanee códigos QR para control de carga y productos</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as "scanner" | "manual")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scanner">Escáner</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Escáner de Cámara</CardTitle>
                <CardDescription>Use la cámara para escanear códigos QR</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-64 h-64 bg-[#F2E9DC]/20 rounded-lg flex items-center justify-center border-2 border-dashed border-[#0A2463]/30">
                    {isLoading ? (
                      <div className="text-center">
                        <Loader2 className="h-16 w-16 mx-auto text-[#0A2463] mb-2 animate-spin" />
                        <p className="text-sm text-muted-foreground">Procesando QR...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="h-16 w-16 mx-auto text-[#0A2463]/50 mb-2" />
                        <p className="text-sm text-muted-foreground">Área de escaneo</p>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Posicione el código QR dentro del área de escaneo
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Búsqueda Manual</CardTitle>
                <CardDescription>Ingrese el código QR manualmente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ej: CARGA-001 o PROD-001"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleManualSearch()}
                    />
                    <Button 
                      onClick={handleManualSearch} 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Buscar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Resultado del escaneo */}
        {scannedData && (
          <Card className="border-[#0A2463]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {getTypeIcon(scannedData.type)}
                Información Escaneada
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scannedData.type === "load" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{scannedData.code}</span>
                    <Badge variant="outline" className={getStatusColor(scannedData.status)}>
                      {scannedData.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Cliente:</span>
                      <p>{scannedData.client}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Items:</span>
                      <p>{scannedData.itemsCount}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Peso:</span>
                      <p>{scannedData.totalWeight} T</p>
                    </div>
                    {scannedData.vehiclePlate && (
                      <div>
                        <span className="text-muted-foreground">Vehículo:</span>
                        <p>{scannedData.vehiclePlate}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Origen:</span>
                      <p>{scannedData.origin}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Destino:</span>
                      <p>{scannedData.destination}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    {scannedData.status !== "cargado" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMarkAsLoaded(scannedData.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar Cargado
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Reportar Problema
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{scannedData.name}</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Producto
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Código:</span>
                      <p>{scannedData.code}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stock:</span>
                      <p>{scannedData.currentStock} {scannedData.unit}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Peso Unitario:</span>
                      <p>{scannedData.unitWeight} kg</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ubicación:</span>
                      <p>{scannedData.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">
                      <Package className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                    <Button size="sm" variant="outline">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Agregar a Carga
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}