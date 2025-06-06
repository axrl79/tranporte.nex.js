"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Car,
  Clock,
  TrendingUp,
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle,
  FileText,
  Phone,
  Mail,
  User,
  Plus,
} from "lucide-react"

interface DriverProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driverId: string
}

// Datos simulados del conductor
const driverData = {
  id: "1",
  code: "EMP-001",
  name: "Carlos Mendoza",
  position: "Conductor Senior",
  email: "carlos.mendoza@company.com",
  phone: "+591 7 1234567",
  hireDate: "2022-03-15",
  birthDate: "1985-06-20",
  address: "Av. 6 de Agosto #123, La Paz",
  emergencyContact: "María Mendoza",
  emergencyPhone: "+591 7 9876543",
  photo: "/placeholder.svg?height=100&width=100",
  status: "activo",

  // Estadísticas generales
  stats: {
    totalTrips: 145,
    completedTrips: 142,
    cancelledTrips: 3,
    totalKm: 12450,
    totalHours: 890,
    onTimeRate: 92,
    fuelEfficiency: 8.5,
    customerRating: 4.7,
    incidentsCount: 2,
  },

  // Rendimiento mensual
  monthlyStats: [
    { month: "Ene", trips: 18, onTime: 95, rating: 4.8 },
    { month: "Feb", trips: 16, onTime: 88, rating: 4.6 },
    { month: "Mar", trips: 20, onTime: 90, rating: 4.7 },
    { month: "Abr", trips: 22, onTime: 94, rating: 4.9 },
  ],

  // Asistencias recientes
  recentAttendances: [
    { date: "2024-01-18", entry: "08:00", exit: "17:30", hours: 9.5, status: "completo" },
    { date: "2024-01-17", entry: "07:45", exit: "17:15", hours: 9.5, status: "completo" },
    { date: "2024-01-16", entry: "08:15", exit: "17:45", hours: 9.5, status: "tardanza" },
    { date: "2024-01-15", entry: "08:00", exit: "17:30", hours: 9.5, status: "completo" },
  ],

  // Viajes recientes
  recentTrips: [
    {
      id: "1",
      route: "La Paz - Santa Cruz",
      date: "2024-01-18",
      status: "completado",
      duration: "8h 30m",
      km: 589,
      onTime: true,
    },
    {
      id: "2",
      route: "Santa Cruz - Cochabamba",
      date: "2024-01-16",
      status: "completado",
      duration: "6h 15m",
      km: 365,
      onTime: true,
    },
    {
      id: "3",
      route: "Cochabamba - Oruro",
      date: "2024-01-14",
      status: "completado",
      duration: "4h 45m",
      km: 204,
      onTime: false,
    },
  ],

  // Documentos
  documents: [
    {
      id: "1",
      type: "Licencia de Conducir",
      number: "LP-123456789",
      issueDate: "2022-02-15",
      expiryDate: "2024-02-15",
      status: "vigente",
      daysUntilExpiry: 28,
    },
    {
      id: "2",
      type: "Certificado Médico",
      number: "CM-987654321",
      issueDate: "2023-01-30",
      expiryDate: "2024-01-30",
      status: "por_vencer",
      daysUntilExpiry: 12,
    },
    {
      id: "3",
      type: "Certificado de Antecedentes",
      number: "CA-456789123",
      issueDate: "2023-03-15",
      expiryDate: "2024-03-15",
      status: "vigente",
      daysUntilExpiry: 56,
    },
  ],

  // Períodos de descanso
  restPeriods: [
    {
      id: "1",
      startDate: "2024-01-20",
      endDate: "2024-01-22",
      type: "descanso_semanal",
      status: "programado",
      reason: "Descanso obligatorio semanal",
    },
    {
      id: "2",
      startDate: "2024-01-10",
      endDate: "2024-01-12",
      type: "descanso_semanal",
      status: "completado",
      reason: "Descanso obligatorio semanal",
    },
  ],
}

export function DriverProfileDialog({ open, onOpenChange, driverId }: DriverProfileDialogProps) {
  const [selectedTab, setSelectedTab] = useState("overview")

  const getStatusBadge = (status: string) => {
    const variants = {
      activo: "default",
      vigente: "default",
      por_vencer: "secondary",
      vencido: "destructive",
      completo: "default",
      tardanza: "secondary",
      completado: "default",
      programado: "outline",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status}</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={driverData.photo || "/placeholder.svg"} />
              <AvatarFallback>
                {driverData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span>{driverData.name}</span>
                <Badge variant="outline">{driverData.code}</Badge>
                {getStatusBadge(driverData.status)}
              </div>
              <p className="text-sm text-muted-foreground font-normal">{driverData.position}</p>
            </div>
          </DialogTitle>
          <DialogDescription>Perfil completo y estadísticas de rendimiento del conductor</DialogDescription>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            <TabsTrigger value="attendance">Asistencias</TabsTrigger>
            <TabsTrigger value="trips">Viajes</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="rest">Descansos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Información Personal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{driverData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{driverData.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{driverData.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Contratado: {driverData.hireDate}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium">Contacto de Emergencia:</p>
                    <p className="text-sm text-muted-foreground">{driverData.emergencyContact}</p>
                    <p className="text-sm text-muted-foreground">{driverData.emergencyPhone}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Métricas Clave */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Métricas Clave
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{driverData.stats.totalTrips}</div>
                      <p className="text-sm text-muted-foreground">Viajes Totales</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{driverData.stats.onTimeRate}%</div>
                      <p className="text-sm text-muted-foreground">Puntualidad</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{driverData.stats.customerRating}</div>
                      <p className="text-sm text-muted-foreground">Calificación</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{driverData.stats.fuelEfficiency}</div>
                      <p className="text-sm text-muted-foreground">km/L</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Eficiencia General</span>
                      <span>{Math.round((driverData.stats.completedTrips / driverData.stats.totalTrips) * 100)}%</span>
                    </div>
                    <Progress value={(driverData.stats.completedTrips / driverData.stats.totalTrips) * 100} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alertas y Estado Actual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Estado Actual y Alertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Disponible</p>
                      <p className="text-sm text-green-600">Listo para asignación</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">Documentos por Vencer</p>
                      <p className="text-sm text-yellow-600">2 documentos requieren renovación</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800">Próximo Descanso</p>
                      <p className="text-sm text-blue-600">20-22 Enero 2024</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento Mensual</CardTitle>
                  <CardDescription>Viajes y puntualidad por mes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {driverData.monthlyStats.map((stat) => (
                      <div key={stat.month} className="flex items-center justify-between">
                        <span className="font-medium">{stat.month}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span>{stat.trips} viajes</span>
                          <div className="flex items-center gap-1">
                            <Progress value={stat.onTime} className="w-16 h-2" />
                            <span>{stat.onTime}%</span>
                          </div>
                          <span>⭐ {stat.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas Detalladas</CardTitle>
                  <CardDescription>Métricas de rendimiento completas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Kilómetros Totales:</span>
                      <p className="font-semibold">{driverData.stats.totalKm.toLocaleString()} km</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Horas Totales:</span>
                      <p className="font-semibold">{driverData.stats.totalHours} hrs</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Viajes Completados:</span>
                      <p className="font-semibold">{driverData.stats.completedTrips}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Viajes Cancelados:</span>
                      <p className="font-semibold">{driverData.stats.cancelledTrips}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Incidentes:</span>
                      <p className="font-semibold">{driverData.stats.incidentsCount}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Eficiencia Combustible:</span>
                      <p className="font-semibold">{driverData.stats.fuelEfficiency} km/L</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Registro de Asistencias
                </CardTitle>
                <CardDescription>Historial de entradas y salidas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {driverData.recentAttendances.map((attendance, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{attendance.date}</p>
                        <p className="text-sm text-muted-foreground">
                          Entrada: {attendance.entry} | Salida: {attendance.exit}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-semibold">{attendance.hours}h</p>
                        {getStatusBadge(attendance.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trips" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Historial de Viajes
                </CardTitle>
                <CardDescription>Viajes recientes realizados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {driverData.recentTrips.map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{trip.route}</p>
                          {getStatusBadge(trip.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {trip.date} | {trip.duration} | {trip.km} km
                        </p>
                      </div>
                      <div className="text-right">
                        {trip.onTime ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        )}
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
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos y Certificaciones
                </CardTitle>
                <CardDescription>Estado de documentos requeridos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {driverData.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{doc.type}</p>
                          {getStatusBadge(doc.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">Número: {doc.number}</p>
                        <p className="text-sm text-muted-foreground">Vence: {doc.expiryDate}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={doc.daysUntilExpiry <= 30 ? "destructive" : "default"}>
                          {doc.daysUntilExpiry} días
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rest" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Períodos de Descanso
                </CardTitle>
                <CardDescription>Historial y programación de descansos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {driverData.restPeriods.map((period) => (
                    <div key={period.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {period.startDate} - {period.endDate}
                          </p>
                          {getStatusBadge(period.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{period.reason}</p>
                      </div>
                      <div className="text-right">
                        <Button variant="outline" size="sm">
                          {period.status === "programado" ? "Modificar" : "Ver Detalles"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Programar Nuevo Descanso
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
