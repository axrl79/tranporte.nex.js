"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { FileText, Calendar, AlertTriangle, CheckCircle } from "lucide-react"

interface DocumentRenewalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: any
  onDocumentRenewed: (employee: any) => void
}

export function DocumentRenewalDialog({ open, onOpenChange, employee, onDocumentRenewed }: DocumentRenewalDialogProps) {
  // Cambiar el enfoque para trabajar con documentos separados
  const [documents, setDocuments] = useState<any[]>([])
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [renewalData, setRenewalData] = useState({
    licenseNumber: employee?.licenseNumber || "",
    licenseExpiry: employee?.licenseExpiry ? new Date(employee.licenseExpiry).toISOString().split("T")[0] : "",
    medicalCertExpiry: employee?.medicalCertExpiry
      ? new Date(employee.medicalCertExpiry).toISOString().split("T")[0]
      : "",
    notes: "",
  })

  // Cargar documentos del empleado
  useEffect(() => {
    if (employee?.id && open) {
      fetchEmployeeDocuments()
    }
  }, [employee?.id, open])

  const fetchEmployeeDocuments = async () => {
    try {
      const response = await fetch(`/api/employee-documents?employeeId=${employee.id}`)
      const documentsData = await response.json()
      setDocuments(documentsData)
    } catch (error) {
      console.error("Error loading documents:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setRenewalData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const isDocumentExpired = (expiryDate: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    return expiry < today
  }

  const isDocumentExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    return expiry <= thirtyDaysFromNow && expiry >= today
  }

  const getDocumentStatus = (expiryDate: string) => {
    if (!expiryDate) return { status: "sin_fecha", color: "bg-gray-100 text-gray-800", icon: FileText }
    if (isDocumentExpired(expiryDate))
      return { status: "vencido", color: "bg-red-100 text-red-800", icon: AlertTriangle }
    if (isDocumentExpiringSoon(expiryDate))
      return { status: "por_vencer", color: "bg-yellow-100 text-yellow-800", icon: Calendar }
    return { status: "vigente", color: "bg-green-100 text-green-800", icon: CheckCircle }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validaciones
      if (renewalData.licenseExpiry && new Date(renewalData.licenseExpiry) <= new Date()) {
        toast({
          title: "Error",
          description: "La fecha de vencimiento de la licencia debe ser futura",
          variant: "destructive",
        })
        return
      }

      if (renewalData.medicalCertExpiry && new Date(renewalData.medicalCertExpiry) <= new Date()) {
        toast({
          title: "Error",
          description: "La fecha de vencimiento del certificado médico debe ser futura",
          variant: "destructive",
        })
        return
      }

      // Preparar datos para actualización
      const updateData = {
        licenseNumber: renewalData.licenseNumber || null,
        licenseExpiry: renewalData.licenseExpiry || null,
        medicalCertExpiry: renewalData.medicalCertExpiry || null,
      }

      const response = await fetch(`/api/employees/${employee.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al renovar documentos")
      }

      const updatedEmployee = await response.json()

      // Crear registro de actividad
      if (renewalData.notes) {
        await fetch("/api/alerts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "document_renewal",
            title: "Documentos Renovados",
            message: `Documentos renovados para ${employee.name}: ${renewalData.notes}`,
            severity: "info",
            entityType: "employee",
            entityId: employee.id,
          }),
        })
      }

      toast({
        title: "Éxito",
        description: "Documentos renovados correctamente",
      })

      onDocumentRenewed(updatedEmployee)
      onOpenChange(false)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al renovar documentos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Actualizar el formulario para manejar documentos individuales
  const handleDocumentUpdate = async (documentId: string, updateData: any) => {
    try {
      const response = await fetch(`/api/employee-documents/${documentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar documento")
      }

      const updatedDocument = await response.json()
      setDocuments((prev) => prev.map((doc) => (doc.id === documentId ? updatedDocument : doc)))

      toast({
        title: "Éxito",
        description: "Documento actualizado correctamente",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Error al actualizar el documento",
        variant: "destructive",
      })
    }
  }

  // Función para crear nuevo documento
  const handleCreateDocument = async (documentData: any) => {
    try {
      const response = await fetch("/api/employee-documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...documentData,
          employeeId: employee.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al crear documento")
      }

      const newDocument = await response.json()
      setDocuments((prev) => [newDocument, ...prev])

      toast({
        title: "Éxito",
        description: "Documento creado correctamente",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Error al crear el documento",
        variant: "destructive",
      })
    }
  }

  if (!employee) return null

  const licenseStatus = getDocumentStatus(employee.licenseExpiry)
  const medicalStatus = getDocumentStatus(employee.medicalCertExpiry)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Renovar Documentos</DialogTitle>
          <DialogDescription>
            Actualizar las fechas de vencimiento de los documentos de {employee.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado Actual */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado Actual de Documentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <licenseStatus.icon className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Licencia de Conducir</p>
                    <p className="text-sm text-muted-foreground">{employee.licenseNumber || "No registrada"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={licenseStatus.color}>
                    {licenseStatus.status === "vencido" && "Vencida"}
                    {licenseStatus.status === "por_vencer" && "Por Vencer"}
                    {licenseStatus.status === "vigente" && "Vigente"}
                    {licenseStatus.status === "sin_fecha" && "Sin Fecha"}
                  </Badge>
                  {employee.licenseExpiry && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Vence: {new Date(employee.licenseExpiry).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <medicalStatus.icon className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Certificado Médico</p>
                    <p className="text-sm text-muted-foreground">
                      {employee.type === "conductor" ? "Requerido" : "Opcional"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={medicalStatus.color}>
                    {medicalStatus.status === "vencido" && "Vencido"}
                    {medicalStatus.status === "por_vencer" && "Por Vencer"}
                    {medicalStatus.status === "vigente" && "Vigente"}
                    {medicalStatus.status === "sin_fecha" && "Sin Fecha"}
                  </Badge>
                  {employee.medicalCertExpiry && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Vence: {new Date(employee.medicalCertExpiry).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulario de Renovación */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actualizar Documentos</CardTitle>
                <CardDescription>Ingresa las nuevas fechas de vencimiento y números de documento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Número de Licencia</Label>
                    <Input
                      id="licenseNumber"
                      value={renewalData.licenseNumber}
                      onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                      placeholder="Ej: B-123456789"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseExpiry">Nueva Fecha de Vencimiento</Label>
                    <Input
                      id="licenseExpiry"
                      type="date"
                      value={renewalData.licenseExpiry}
                      onChange={(e) => handleInputChange("licenseExpiry", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalCertExpiry">Vencimiento Certificado Médico</Label>
                  <Input
                    id="medicalCertExpiry"
                    type="date"
                    value={renewalData.medicalCertExpiry}
                    onChange={(e) => handleInputChange("medicalCertExpiry", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas de Renovación</Label>
                  <Textarea
                    id="notes"
                    value={renewalData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Detalles sobre la renovación, cambios realizados, etc."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Renovando..." : "Renovar Documentos"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
