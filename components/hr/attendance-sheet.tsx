"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Calendar, Clock, MapPin, Plus, Download, Filter } from "lucide-react"

// Definición de tipos
type Employee = {
  id: string
  name: string
  fullName?: string
  firstName?: string
  lastName?: string
  position?: string
}

type AttendanceRecord = {
  id: string
  employeeId: string
  employee?: Employee
  date: string
  time: string
  type: string
  status: string
  timestamp: string
  location?: string
  latitude?: number | null
  longitude?: number | null
  notes?: string
  verifiedBy?: string | null
  verifiedByUser?: {
    name: string
  }
  tripId?: string | null
}

type NewAttendanceData = {
  employeeId: string
  date: string
  time: string
  type: string
  status: string
  timestamp: string
  location: string
  latitude: number | null
  longitude: number | null
  notes: string
  verifiedBy: string | null
  tripId: string | null
}

export function AttendanceSheet({ employees: initialEmployees = [] }: { employees?: Employee[] }) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [filteredAttendance, setFilteredAttendance] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewAttendanceDialog, setShowNewAttendanceDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  
  const [newAttendanceData, setNewAttendanceData] = useState<NewAttendanceData>({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    type: "entrada",
    status: "",
    timestamp: new Date().toISOString(),
    location: "",
    latitude: null,
    longitude: null,
    notes: "",
    verifiedBy: null,
    tripId: null,
  })

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [employeesRes, attendanceRes] = await Promise.all([
        fetch("/api/employees"),
        fetch("/api/attendance")
      ])

      if (!employeesRes.ok || !attendanceRes.ok) {
        throw new Error("Error al cargar los datos")
      }

      const [employeesData, attendanceData] = await Promise.all([
        employeesRes.json(),
        attendanceRes.json()
      ])

      setEmployees(employeesData)
      setAttendance(attendanceData)
      setFilteredAttendance(attendanceData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de asistencia",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    let filtered = attendance

    if (selectedDate) {
      filtered = filtered.filter((record) => record.date === selectedDate)
    }

    if (selectedEmployee && selectedEmployee !== "all") {
      filtered = filtered.filter((record) => record.employeeId === selectedEmployee)
    }

    if (selectedStatus && selectedStatus !== "all") {
      filtered = filtered.filter((record) => record.status === selectedStatus)
    }

    setFilteredAttendance(filtered)
  }, [attendance, selectedDate, selectedEmployee, selectedStatus])

  const handleNewAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!newAttendanceData.employeeId || !newAttendanceData.date || !newAttendanceData.type) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos obligatorios",
          variant: "destructive",
        })
        return
      }

      // Combinar fecha y hora para timestamp
      const timestamp = new Date(`${newAttendanceData.date}T${newAttendanceData.time}:00`)

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newAttendanceData,
          timestamp: timestamp.toISOString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al registrar asistencia")
      }

      const newRecord = await response.json()

      toast({
        title: "Éxito",
        description: "Asistencia registrada correctamente",
      })

      setNewAttendanceData({
        employeeId: "",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().slice(0, 5),
        type: "entrada",
        status: "",
        timestamp: new Date().toISOString(),
        location: "",
        latitude: null,
        longitude: null,
        notes: "",
        verifiedBy: null,
        tripId: null,
      })

      setShowNewAttendanceDialog(false)
      fetchData()
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al registrar asistencia",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "presente":
        return "bg-green-100 text-green-800"
      case "ausente":
        return "bg-red-100 text-red-800"
      case "tardanza":
        return "bg-yellow-100 text-yellow-800"
      case "permiso":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "entrada":
        return "bg-green-100 text-green-800"
      case "salida":
        return "bg-red-100 text-red-800"
      case "descanso_inicio":
        return "bg-blue-100 text-blue-800"
      case "descanso_fin":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const exportToCSV = () => {
    const headers = ["Empleado", "Fecha", "Tipo", "Hora", "Estado", "Ubicación", "Notas"]
    const csvContent = [
      headers.join(","),
      ...filteredAttendance.map((record) =>
        [
          `"${record.employee?.name || record.employee?.fullName || 
            `${record.employee?.firstName || ""} ${record.employee?.lastName || ""}`.trim() || "N/A"}"`,
          record.date,
          record.type,
          record.time,
          record.status,
          `"${record.location || ""}"`,
          `"${record.notes || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `asistencias_${selectedDate || "todas"}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2463] mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Cargando planilla de asistencias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Planilla de Asistencias</h2>
          <p className="text-muted-foreground">Control y registro de asistencias del personal</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={() => setShowNewAttendanceDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Registrar Asistencia
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-filter">Fecha</Label>
              <Input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee-filter">Empleado</Label>
              <Select 
                value={selectedEmployee} 
                onValueChange={setSelectedEmployee}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los empleados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los empleados</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name || employee.fullName || `${employee.firstName} ${employee.lastName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Estado</Label>
              <Select 
                value={selectedStatus} 
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="presente">Presente</SelectItem>
                  <SelectItem value="ausente">Ausente</SelectItem>
                  <SelectItem value="tardanza">Tardanza</SelectItem>
                  <SelectItem value="permiso">Permiso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDate(new Date().toISOString().split("T")[0])
                  setSelectedEmployee("")
                  setSelectedStatus("")
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Asistencias */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Asistencia</CardTitle>
          <CardDescription>{filteredAttendance.length} registro(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.employee?.name || record.employee?.fullName || 
                       `${record.employee?.firstName || ""} ${record.employee?.lastName || ""}`.trim() || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTypeColor(record.type)}>
                        {record.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        {record.time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(record.status)}>
                        {record.status || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.location && (
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          {record.location}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{record.notes}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron registros con los filtros actuales
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diálogo para Nueva Asistencia */}
      <Dialog open={showNewAttendanceDialog} onOpenChange={setShowNewAttendanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Asistencia</DialogTitle>
            <DialogDescription>Registra la entrada, salida o descanso de un empleado</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleNewAttendance} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Empleado *</Label>
                <Select
                  value={newAttendanceData.employeeId}
                  onValueChange={(value) => setNewAttendanceData((prev) => ({ ...prev, employeeId: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name || employee.fullName || `${employee.firstName} ${employee.lastName}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={newAttendanceData.type}
                  onValueChange={(value) => setNewAttendanceData((prev) => ({ ...prev, type: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="salida">Salida</SelectItem>
                    <SelectItem value="descanso_inicio">Inicio Descanso</SelectItem>
                    <SelectItem value="descanso_fin">Fin Descanso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newAttendanceData.date}
                  onChange={(e) => setNewAttendanceData((prev) => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Hora *</Label>
                <Input
                  id="time"
                  type="time"
                  value={newAttendanceData.time}
                  onChange={(e) => setNewAttendanceData((prev) => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={newAttendanceData.status}
                  onValueChange={(value) => setNewAttendanceData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presente">Presente</SelectItem>
                    <SelectItem value="tardanza">Tardanza</SelectItem>
                    <SelectItem value="permiso">Permiso</SelectItem>
                    <SelectItem value="ausente">Ausente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={newAttendanceData.location}
                  onChange={(e) => setNewAttendanceData((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Ej: Oficina Central, Almacén"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                value={newAttendanceData.notes}
                onChange={(e) => setNewAttendanceData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Observaciones adicionales"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewAttendanceDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Registrando..." : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}