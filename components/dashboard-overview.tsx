import { TrendingUp, AlertTriangle, Users, Truck, Calendar, Clock, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserActivityTable } from "@/components/user-activity-table"

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-navy/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-navy">Operaciones Activas</CardTitle>
            <Truck className="h-4 w-4 text-crimson" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">24</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+5% desde ayer</span>
            </div>
            <Progress value={75} className="h-2 mt-3" />
          </CardContent>
        </Card>

        <Card className="border-navy/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-navy">Alertas de Seguridad</CardTitle>
            <AlertTriangle className="h-4 w-4 text-crimson" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">3</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+2 nuevas alertas</span>
            </div>
            <Progress value={30} className="h-2 mt-3" />
          </CardContent>
        </Card>

        <Card className="border-navy/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-navy">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-crimson" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">18</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+2 desde ayer</span>
            </div>
            <Progress value={60} className="h-2 mt-3" />
          </CardContent>
        </Card>

        <Card className="border-navy/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-navy">Eficiencia Operativa</CardTitle>
            <TrendingUp className="h-4 w-4 text-crimson" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy">92%</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+3% desde la semana pasada</span>
            </div>
            <Progress value={92} className="h-2 mt-3" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-navy/10">
          <CardHeader>
            <CardTitle className="text-navy">Programación de Hoy</CardTitle>
            <CardDescription>Rutas y entregas programadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-navy/10 pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-navy/10 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-navy" />
                    </div>
                    <div>
                      <div className="font-medium text-navy">Ruta #{i} - Transporte de Combustible</div>
                      <div className="text-sm text-muted-foreground">Destino: Terminal {i}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{i === 1 ? "En progreso" : `${i + 7}:00 AM`}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-navy/10">
          <CardHeader>
            <CardTitle className="text-navy">Estadísticas de Seguridad</CardTitle>
            <CardDescription>Últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] flex items-center justify-center">
              <div className="w-full h-full flex items-end justify-between gap-2 pt-6">
                {Array.from({ length: 7 }).map((_, i) => {
                  const height = Math.floor(Math.random() * 70) + 30
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-full bg-navy rounded-sm" style={{ height: `${height}%` }}></div>
                      <span className="text-xs text-muted-foreground">{["L", "M", "X", "J", "V", "S", "D"][i]}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-navy/10">
        <CardHeader>
          <CardTitle className="text-navy">Historial de Actividad</CardTitle>
          <CardDescription>Registro de acciones de usuarios en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="admin">Administradores</TabsTrigger>
              <TabsTrigger value="operators">Operadores</TabsTrigger>
              <TabsTrigger value="drivers">Conductores</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <UserActivityTable />
            </TabsContent>
            <TabsContent value="admin">
              <UserActivityTable filterRole="Administrador" />
            </TabsContent>
            <TabsContent value="operators">
              <UserActivityTable filterRole="Operador" />
            </TabsContent>
            <TabsContent value="drivers">
              <UserActivityTable filterRole="Conductor" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
