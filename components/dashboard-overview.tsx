"use client"

import { useState } from "react"
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Clock,
  Droplet,
  Fuel,
  LineChart,
  MapPin,
  MoreHorizontal,
  Truck,
  Users,
  ClipboardList,
  Bell,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function DashboardOverview() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Sistema Avanzado para la Gestión de Flota y Seguridad en el Transporte
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-[#0A2463] hover:bg-[#0A2463]/90">
            <Truck className="mr-2 h-4 w-4" />
            Añadir Vehículo
          </Button>
          <Button variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Añadir Usuario
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#F2E9DC]">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#0A2463] data-[state=active]:text-white">
            Vista General
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#0A2463] data-[state=active]:text-white">
            Analítica
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-[#0A2463] data-[state=active]:text-white">
            Reportes
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-[#0A2463] data-[state=active]:text-white"
          >
            Notificaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-[#0A2463]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Vehículos Activos</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">+2 desde el último mes</p>
                <div className="mt-2 h-1 w-full bg-[#F2E9DC]">
                  <div className="h-1 bg-[#0A2463]" style={{ width: "85%" }} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#F9DC5C]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Consumo de Combustible</CardTitle>
                <Fuel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,543 L</div>
                <p className="text-xs text-muted-foreground">-5% comparado con el mes anterior</p>
                <div className="mt-2 h-1 w-full bg-[#F2E9DC]">
                  <div className="h-1 bg-[#F9DC5C]" style={{ width: "65%" }} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#D90429]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Alertas de Seguridad</CardTitle>
                <AlertTriangle className="h-4 w-4 text-[#D90429]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">+3 alertas nuevas hoy</p>
                <div className="mt-2 h-1 w-full bg-[#F2E9DC]">
                  <div className="h-1 bg-[#D90429]" style={{ width: "35%" }} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-[#0A2463]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Eficiencia de Ruta</CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89%</div>
                <p className="text-xs text-muted-foreground">+2.5% desde la semana pasada</p>
                <div className="mt-2 h-1 w-full bg-[#F2E9DC]">
                  <div className="h-1 bg-[#0A2463]" style={{ width: "89%" }} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Actividad de la Flota</CardTitle>
                <CardDescription>Monitoreo en tiempo real de los vehículos activos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-[#F2E9DC]/30 rounded-md">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 mx-auto text-[#0A2463]/50" />
                    <p className="mt-2 text-sm text-muted-foreground">Gráfico de actividad de la flota</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Alertas Recientes</CardTitle>
                <CardDescription>Últimas alertas de seguridad y mantenimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full p-1 bg-[#D90429]/10">
                      <AlertTriangle className="h-4 w-4 text-[#D90429]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Exceso de velocidad</p>
                      <p className="text-xs text-muted-foreground">Vehículo #T-2345 - 15 min atrás</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      Alta
                    </Badge>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-full p-1 bg-[#F9DC5C]/10">
                      <Droplet className="h-4 w-4 text-[#F9DC5C]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Nivel de combustible bajo</p>
                      <p className="text-xs text-muted-foreground">Vehículo #T-1872 - 45 min atrás</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      Media
                    </Badge>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-full p-1 bg-[#0A2463]/10">
                      <Clock className="h-4 w-4 text-[#0A2463]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Mantenimiento programado</p>
                      <p className="text-xs text-muted-foreground">Vehículo #T-3012 - 2 horas atrás</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      Baja
                    </Badge>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-full p-1 bg-[#D90429]/10">
                      <MapPin className="h-4 w-4 text-[#D90429]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Desviación de ruta</p>
                      <p className="text-xs text-muted-foreground">Vehículo #T-1654 - 3 horas atrás</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      Alta
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center">
              <div>
                <CardTitle>Vehículos en Tránsito</CardTitle>
                <CardDescription>Monitoreo de vehículos actualmente en ruta</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                <Calendar className="mr-2 h-4 w-4" />
                Ver todos
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Conductor</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Carga</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Progreso</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">T-2345</TableCell>
                    <TableCell>Carlos Méndez</TableCell>
                    <TableCell>Ciudad de México</TableCell>
                    <TableCell>Guadalajara</TableCell>
                    <TableCell>Gasolina</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">En ruta</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={75} className="h-2" />
                        <span className="text-xs">75%</span>
                      </div>
                    </TableCell>
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
                          <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                          <DropdownMenuItem>Contactar conductor</DropdownMenuItem>
                          <DropdownMenuItem>Ver ruta</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium">T-1872</TableCell>
                    <TableCell>Ana Gutiérrez</TableCell>
                    <TableCell>Monterrey</TableCell>
                    <TableCell>Tijuana</TableCell>
                    <TableCell>Diésel</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-500">Parada</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={45} className="h-2" />
                        <span className="text-xs">45%</span>
                      </div>
                    </TableCell>
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
                          <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                          <DropdownMenuItem>Contactar conductor</DropdownMenuItem>
                          <DropdownMenuItem>Ver ruta</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium">T-3012</TableCell>
                    <TableCell>Roberto Sánchez</TableCell>
                    <TableCell>Veracruz</TableCell>
                    <TableCell>Mérida</TableCell>
                    <TableCell>Mercancías</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">En ruta</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={30} className="h-2" />
                        <span className="text-xs">30%</span>
                      </div>
                    </TableCell>
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
                          <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                          <DropdownMenuItem>Contactar conductor</DropdownMenuItem>
                          <DropdownMenuItem>Ver ruta</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium">T-1654</TableCell>
                    <TableCell>Laura Torres</TableCell>
                    <TableCell>Puebla</TableCell>
                    <TableCell>Oaxaca</TableCell>
                    <TableCell>Gasolina</TableCell>
                    <TableCell>
                      <Badge className="bg-red-500">Alerta</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={60} className="h-2" />
                        <span className="text-xs">60%</span>
                      </div>
                    </TableCell>
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
                          <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                          <DropdownMenuItem>Contactar conductor</DropdownMenuItem>
                          <DropdownMenuItem>Ver ruta</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="analytics"
          className="h-[400px] flex items-center justify-center bg-[#F2E9DC]/30 rounded-md"
        >
          <div className="text-center">
            <BarChart3 className="h-16 w-16 mx-auto text-[#0A2463]/50" />
            <h3 className="mt-4 text-lg font-medium">Analítica de Flota</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Aquí se mostrarán los gráficos y análisis detallados de la flota
            </p>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="h-[400px] flex items-center justify-center bg-[#F2E9DC]/30 rounded-md">
          <div className="text-center">
            <ClipboardList className="h-16 w-16 mx-auto text-[#0A2463]/50" />
            <h3 className="mt-4 text-lg font-medium">Reportes</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Aquí se mostrarán los reportes generados por el sistema
            </p>
          </div>
        </TabsContent>

        <TabsContent
          value="notifications"
          className="h-[400px] flex items-center justify-center bg-[#F2E9DC]/30 rounded-md"
        >
          <div className="text-center">
            <Bell className="h-16 w-16 mx-auto text-[#0A2463]/50" />
            <h3 className="mt-4 text-lg font-medium">Notificaciones</h3>
            <p className="mt-2 text-sm text-muted-foreground">Aquí se mostrarán todas las notificaciones del sistema</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
