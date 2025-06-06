"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  Car,
  Award,
  FileText,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Datos simulados
const hrStats = {
  totalEmployees: 28,
  activeDrivers: 15,
  presentToday: 24,
  onLeave: 2,
  expiredDocuments: 3,
  pendingEvaluations: 5,
}

const employees = [
  {
    id: "1",
    code: "EMP-001",
    name: "Carlos Mendoza",
    position: "Conductor Senior",
    type: "conductor",
    status: "activo",
    hireDate: "2022-03-15",
    phone: "+591 7 1234567",
    email: "carlos.mendoza@company.com",
    lastAttendance: "2024-01-18 08:00",
    performance: 8.5,
    totalTrips: 145,
    onTimeRate: 92,
    photo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    code: "EMP-002",
    name: "Ana Rodriguez",
    position: "Conductora",
    type: "conductor",
    status: "activo",
    hireDate: "2023-01-20",
    phone: "+591 7 2345678",
    email: "ana.rodriguez@company.com",
    lastAttendance: "2024-01-18 07:45",
    performance: 9.2,
    totalTrips: 89,
    onTimeRate: 96,
    photo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    code: "EMP-003",
    name: "Miguel Torres",
    position: "Mecánico",
    type: "mecanico",
    status: "activo",
    hireDate: "2021-08-10",
    phone: "+591 7 3456789",
    email: "miguel.torres@company.com",
    lastAttendance: "2024-01-18 08:15",
    performance: 8.8,
    totalTrips: 0,
    onTimeRate: 0,
    photo: "/placeholder.svg?height=40&width=40",
  },
]

const recentAttendances = [
  {
    id: "1",
    employeeName: "Carlos Mendoza",
    type: "entrada",
    timestamp: "2024-01-18 08:00:00",
    location: "Oficina Central",
  },
  {
    id: "2",
    employeeName: "Ana Rodriguez",
    type: "entrada",
    timestamp: "2024-01-18 07:45:00",
    location: "Oficina Central",
  },
  {
    id: "3",
    employeeName: "Miguel Torres",
    type: "entrada",
    timestamp: "2024-01-18 08:15:00",
    location: "Taller",
  },
]

const documentAlerts = [
  {
    id: "1",
    employeeName: "Carlos Mendoza",
    documentType: "Licencia de Conducir",
    expiryDate: "2024-02-15",
    daysUntilExpiry: 28,
  },
  {
    id: "2",
    employeeName: "Ana Rodriguez",
    documentType: "Certificado Médico",
    expiryDate: "2024-01-30",
    daysUntilExpiry: 12,
  },
  {
    id: "3",
    employeeName: "Luis Vargas",
    documentType: "Licencia de Conducir",
    expiryDate: "2024-01-25",
    daysUntilExpiry: 7,
  },
]

export default function HRPage() {
  const [selectedTab, setSelectedTab] = useState("overview")

  const getStatusBadge = (status: string) => {
    const variants = {
      activo: "default",
      inactivo: "secondary",
      vacaciones: "outline",
      licencia: "secondary",
      suspendido: "destructive",
      entrada: "default",
      salida: "secondary",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status}</Badge>
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "conductor":
        return <Car className="h-4 w-4" />
      case "mecanico":
        return <Award className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Recursos Humanos</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Empleado
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="employees">Empleados</TabsTrigger>
          <TabsTrigger value="drivers">Conductores</TabsTrigger>
          <TabsTrigger value="attendance">Asistencias</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* KPIs Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrStats.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">+2 nuevos este mes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conductores Activos</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrStats.activeDrivers}</div>
                <p className="text-xs text-muted-foreground">de {hrStats.totalEmployees} empleados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Presentes Hoy</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrStats.presentToday}</div>
                <p className="text-xs text-muted-foreground">{hrStats.onLeave} en licencia</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentos por Vencer</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrStats.expiredDocuments}</div>
                <p className="text-xs text-muted-foreground">Requieren atención</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Asistencias de la Semana</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Gráfico de asistencias semanales
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Alertas de Documentos</CardTitle>
                <CardDescription>Documentos próximos a vencer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documentAlerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{alert.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{alert.documentType}</p>
                      </div>
                      <Badge variant={alert.daysUntilExpiry <= 7 ? "destructive" : "secondary"}>
                        {alert.daysUntilExpiry}d
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Empleados</CardTitle>
              <CardDescription>Administra el personal de la empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
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
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {getTypeIcon(employee.type)}
                          <span>{employee.position}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Contratado: {employee.hireDate} | Última asistencia: {employee.lastAttendance}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Rendimiento:</span>
                        <Badge variant="default">{employee.performance}/10</Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Documentos
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Clock className="mr-2 h-4 w-4" />
                            Asistencias
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Conductores</CardTitle>
              <CardDescription>Control especializado para conductores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees
                  .filter((emp) => emp.type === "conductor")
                  .map((driver) => (
                    <div
                      key={driver.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-blue-50/50"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={driver.photo || "/placeholder.svg"} />
                          <AvatarFallback>
                            {driver.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{driver.name}</h4>
                            <Badge variant="outline">{driver.code}</Badge>
                            <Car className="h-4 w-4 text-blue-600" />
                          </div>
                          <p className="text-sm text-muted-foreground">{driver.position}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span>
                              Viajes: <strong>{driver.totalTrips}</strong>
                            </span>
                            <span>
                              Puntualidad: <strong>{driver.onTimeRate}%</strong>
                            </span>
                            <span>
                              Rendimiento: <strong>{driver.performance}/10</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex items-center gap-2">
                          <Progress value={driver.onTimeRate} className="w-20 h-2" />
                          <span className="text-sm">{driver.onTimeRate}%</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Perfil Completo
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <TrendingUp className="mr-2 h-4 w-4" />
                              Estadísticas
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Car className="mr-2 h-4 w-4" />
                              Historial de Viajes
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="mr-2 h-4 w-4" />
                              Programar Descanso
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Control de Asistencias</CardTitle>
              <CardDescription>Registro de entradas y salidas del personal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAttendances.map((attendance) => (
                  <div key={attendance.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{attendance.employeeName}</h4>
                        {getStatusBadge(attendance.type)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {attendance.location} | {attendance.timestamp}
                      </p>
                    </div>
                    <div className="text-right">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Control de Documentos</CardTitle>
              <CardDescription>Alertas y vencimientos de documentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{alert.employeeName}</h4>
                      <p className="text-sm text-muted-foreground">{alert.documentType}</p>
                      <p className="text-sm text-muted-foreground">Vence: {alert.expiryDate}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge
                        variant={
                          alert.daysUntilExpiry <= 7
                            ? "destructive"
                            : alert.daysUntilExpiry <= 30
                              ? "secondary"
                              : "default"
                        }
                      >
                        {alert.daysUntilExpiry} días
                      </Badge>
                      <div>
                        <Button variant="outline" size="sm">
                          Renovar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
