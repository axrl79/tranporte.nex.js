"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, MapPin, Search, UserCheck, LogIn, LogOut, Coffee, CheckCircle } from "lucide-react"

// Datos simulados
const employees = [
  {
    id: "1",
    code: "EMP-001",
    name: "Carlos Mendoza",
    position: "Conductor Senior",
    photo: "/placeholder.svg?height=40&width=40",
    status: "presente",
    lastAttendance: {
      type: "entrada",
      time: "08:00",
      location: "Oficina Central",
    },
  },
  {
    id: "2",
    code: "EMP-002",
    name: "Ana Rodriguez",
    position: "Conductora",
    photo: "/placeholder.svg?height=40&width=40",
    status: "presente",
    lastAttendance: {
      type: "entrada",
      time: "07:45",
      location: "Oficina Central",
    },
  },
  {
    id: "3",
    code: "EMP-003",
    name: "Miguel Torres",
    position: "Mecánico",
    photo: "/placeholder.svg?height=40&width=40",
    status: "ausente",
    lastAttendance: {
      type: "salida",
      time: "17:30",
      location: "Taller",
    },
  },
]

const todayAttendances = [
  {
    id: "1",
    employeeId: "1",
    employeeName: "Carlos Mendoza",
    type: "entrada",
    time: "08:00:15",
    location: "Oficina Central",
    coordinates: "-16.5000, -68.1193",
  },
  {
    id: "2",
    employeeId: "2",
    employeeName: "Ana Rodriguez",
    type: "entrada",
    time: "07:45:32",
    location: "Oficina Central",
    coordinates: "-16.5000, -68.1193",
  },
  {
    id: "3",
    employeeId: "1",
    employeeName: "Carlos Mendoza",
    type: "descanso_inicio",
    time: "12:00:45",
    location: "Oficina Central",
    coordinates: "-16.5000, -68.1193",
  },
]

export function AttendanceControl() {
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [attendanceType, setAttendanceType] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentLocation, setCurrentLocation] = useState("Oficina Central")

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    const variants = {
      presente: "default",
      ausente: "secondary",
      descanso: "outline",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status}</Badge>
  }

  const getAttendanceIcon = (type: string) => {
    switch (type) {
      case "entrada":
        return <LogIn className="h-4 w-4 text-green-600" />
      case "salida":
        return <LogOut className="h-4 w-4 text-red-600" />
      case "descanso_inicio":
        return <Coffee className="h-4 w-4 text-yellow-600" />
      case "descanso_fin":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleRegisterAttendance = () => {
    if (!selectedEmployee || !attendanceType) {
      alert("Por favor selecciona un empleado y tipo de asistencia")
      return
    }

    // Aquí iría la lógica para registrar la asistencia
    console.log("Registrando asistencia:", {
      employeeId: selectedEmployee,
      type: attendanceType,
      location: currentLocation,
      timestamp: new Date().toISOString(),
    })

    // Resetear formulario
    setSelectedEmployee("")
    setAttendanceType("")

    alert("Asistencia registrada correctamente")
  }

  return (
    <div className="space-y-6">
      {/* Control de Registro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Registro de Asistencia
          </CardTitle>
          <CardDescription>Registra entradas, salidas y descansos del personal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Empleado</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empleado" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.code} - {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Asistencia</Label>
              <Select value={attendanceType} onValueChange={setAttendanceType}>
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

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                placeholder="Ubicación actual"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleRegisterAttendance} className="w-full">
                <Clock className="mr-2 h-4 w-4" />
                Registrar
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Ubicación detectada: {currentLocation}</span>
            <span className="text-xs">(-16.5000, -68.1193)</span>
          </div>
        </CardContent>
      </Card>

      {/* Estado Actual del Personal */}
      <Card>
        <CardHeader>
          <CardTitle>Estado Actual del Personal</CardTitle>
          <CardDescription>Vista en tiempo real de la asistencia del personal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <Label htmlFor="search">Buscar Empleado</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={employee.photo || "/placeholder.svg"} />
                    <AvatarFallback>
                      {employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{employee.name}</h4>
                      <Badge variant="outline">{employee.code}</Badge>
                      {getStatusBadge(employee.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-2">
                    {getAttendanceIcon(employee.lastAttendance.type)}
                    <span className="text-sm font-medium">{employee.lastAttendance.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{employee.lastAttendance.location}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Registro de Hoy */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Hoy</CardTitle>
          <CardDescription>Todas las asistencias registradas hoy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayAttendances.map((attendance) => (
              <div key={attendance.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getAttendanceIcon(attendance.type)}
                  <div className="space-y-1">
                    <h4 className="font-semibold">{attendance.employeeName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {attendance.type.replace("_", " ")} - {attendance.time}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium">{attendance.location}</p>
                  <p className="text-xs text-muted-foreground">{attendance.coordinates}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
