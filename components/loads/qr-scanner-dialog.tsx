"use client"

import { useState } from "react"
import { QrCode, Camera, Search, Package, Boxes, CheckCircle, AlertCircle } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

// Datos simulados para demostración
const qrDatabase = {
  "QR-CARGA-001": {
    type: "load",
    id: "1",
    code: "CARGA-001",
    status: "cargado",
    client: "Empresa ABC",
    itemsCount: 3,
    totalWeight: 2.5,
  },
  "QR-PROD-001": {
    type: "product",
    id: "1",
    code: "PROD-001",
    name: "Aceite Motor 20W-50",
    currentStock: 150,
    location: "A-01-15",
  },
  "QR-PROD-002": {
    type: "product",
    id: "2",
    code: "PROD-002",
    name: "Filtro de Aire",
    currentStock: 25,
    location: "B-03-08",
  },
}

interface QRScannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QRScannerDialog({ open, onOpenChange }: QRScannerDialogProps) {
  const [activeTab, setActiveTab] = useState("scanner")
  const [manualCode, setManualCode] = useState("")
  const [scannedData, setScannedData] = useState<any>(null)
  const [isScanning, setIsScanning] = useState(false)

  // Simular escaneo de QR
  const simulateScan = () => {
    setIsScanning(true)

    // Simular delay de escaneo
    setTimeout(() => {
      const codes = Object.keys(qrDatabase)
      const randomCode = codes[Math.floor(Math.random() * codes.length)]
      handleQRScan(randomCode)
      setIsScanning(false)
    }, 2000)
  }

  // Manejar escaneo de QR
  const handleQRScan = (qrCode: string) => {
    const data = qrDatabase[qrCode as keyof typeof qrDatabase]

    if (data) {
      setScannedData({ qrCode, ...data })
      toast({
        title: "QR Escaneado",
        description: `${data.type === "load" ? "Carga" : "Producto"} encontrado: ${data.code}`,
      })
    } else {
      toast({
        title: "QR No Encontrado",
        description: "El código QR no está registrado en el sistema",
        variant: "destructive",
      })
      setScannedData(null)
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                    {isScanning ? (
                      <div className="text-center">
                        <div className="animate-pulse">
                          <Camera className="h-16 w-16 mx-auto text-[#0A2463] mb-2" />
                        </div>
                        <p className="text-sm text-muted-foreground">Escaneando...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="h-16 w-16 mx-auto text-[#0A2463]/50 mb-2" />
                        <p className="text-sm text-muted-foreground">Área de escaneo</p>
                      </div>
                    )}
                  </div>

                  <Button onClick={simulateScan} disabled={isScanning} className="bg-[#0A2463] hover:bg-[#0A2463]/90">
                    {isScanning ? "Escaneando..." : "Iniciar Escaneo"}
                  </Button>

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
                      placeholder="Ej: QR-CARGA-001"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleManualSearch()}
                    />
                    <Button onClick={handleManualSearch} variant="outline">
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Códigos de ejemplo:</p>
                    <div className="space-y-1">
                      <button
                        className="block text-left hover:text-[#0A2463] transition-colors"
                        onClick={() => setManualCode("QR-CARGA-001")}
                      >
                        • QR-CARGA-001 (Carga)
                      </button>
                      <button
                        className="block text-left hover:text-[#0A2463] transition-colors"
                        onClick={() => setManualCode("QR-PROD-001")}
                      >
                        • QR-PROD-001 (Producto)
                      </button>
                      <button
                        className="block text-left hover:text-[#0A2463] transition-colors"
                        onClick={() => setManualCode("QR-PROD-002")}
                      >
                        • QR-PROD-002 (Producto)
                      </button>
                    </div>
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
                    <div>
                      <span className="text-muted-foreground">QR:</span>
                      <p className="font-mono text-xs">{scannedData.qrCode}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar Cargado
                    </Button>
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
                      <p>{scannedData.currentStock}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ubicación:</span>
                      <p>{scannedData.location}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">QR:</span>
                      <p className="font-mono text-xs">{scannedData.qrCode}</p>
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
