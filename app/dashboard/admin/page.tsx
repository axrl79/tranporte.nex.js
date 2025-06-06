"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  FileText,
  CreditCard,
  DollarSign,
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

// Datos simulados
const adminStats = {
  totalClients: 45,
  activeContracts: 23,
  pendingInvoices: 12,
  monthlyRevenue: 125000,
  pendingPayments: 35000,
  overdueInvoices: 5,
}

const recentClients = [
  {
    id: "1",
    name: "Transportes Bolivar",
    email: "contacto@bolivar.com",
    phone: "+591 2 2345678",
    status: "activo",
    balance: 15000,
    lastActivity: "2024-01-15",
  },
  {
    id: "2",
    name: "Minera San Cristóbal",
    email: "logistica@sancristobal.com",
    phone: "+591 2 3456789",
    status: "activo",
    balance: -2500,
    lastActivity: "2024-01-14",
  },
  {
    id: "3",
    name: "Agroindustrial La Paz",
    email: "admin@agrilapaz.com",
    phone: "+591 2 4567890",
    status: "inactivo",
    balance: 0,
    lastActivity: "2024-01-10",
  },
]

const recentInvoices = [
  {
    id: "1",
    number: "FAC-2024-001",
    client: "Transportes Bolivar",
    amount: 8500,
    status: "pagada",
    dueDate: "2024-01-20",
    issueDate: "2024-01-05",
  },
  {
    id: "2",
    number: "FAC-2024-002",
    client: "Minera San Cristóbal",
    amount: 12000,
    status: "enviada",
    dueDate: "2024-01-25",
    issueDate: "2024-01-10",
  },
  {
    id: "3",
    number: "FAC-2024-003",
    client: "Agroindustrial La Paz",
    amount: 6500,
    status: "vencida",
    dueDate: "2024-01-15",
    issueDate: "2023-12-30",
  },
]

const recentPayments = [
  {
    id: "1",
    code: "PAG-2024-001",
    client: "Transportes Bolivar",
    amount: 8500,
    type: "transferencia",
    status: "completado",
    date: "2024-01-18",
  },
  {
    id: "2",
    code: "PAG-2024-002",
    client: "Minera San Cristóbal",
    amount: 5000,
    type: "cheque",
    status: "procesando",
    date: "2024-01-16",
  },
]

export default function AdminPage() {
  const [selectedTab, setSelectedTab] = useState("overview")

  const getStatusBadge = (status: string) => {
    const variants = {
      activo: "default",
      inactivo: "secondary",
      pagada: "default",
      enviada: "secondary",
      vencida: "destructive",
      completado: "default",
      procesando: "secondary",
      pendiente: "outline",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status}</Badge>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Administración General</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="invoices">Facturación</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* KPIs Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats.totalClients}</div>
                <p className="text-xs text-muted-foreground">+3 desde el mes pasado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contratos Activos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats.activeContracts}</div>
                <p className="text-xs text-muted-foreground">+2 nuevos este mes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Bs. {adminStats.monthlyRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12% vs mes anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Bs. {adminStats.pendingPayments.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{adminStats.overdueInvoices} facturas vencidas</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Ingresos por Mes</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Gráfico de ingresos mensuales
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Facturas por Estado</CardTitle>
                <CardDescription>Distribución actual de facturas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm">Pagadas (65%)</span>
                    <div className="ml-auto text-sm font-medium">156</div>
                  </div>
                  <Progress value={65} className="h-2" />

                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-sm">Enviadas (25%)</span>
                    <div className="ml-auto text-sm font-medium">60</div>
                  </div>
                  <Progress value={25} className="h-2" />

                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm">Vencidas (10%)</span>
                    <div className="ml-auto text-sm font-medium">24</div>
                  </div>
                  <Progress value={10} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Clientes</CardTitle>
              <CardDescription>Administra tu cartera de clientes y sus contratos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{client.name}</h4>
                        {getStatusBadge(client.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className={`font-semibold ${client.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        Bs. {client.balance.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Última actividad: {client.lastActivity}</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Ver Contratos
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

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Facturación</CardTitle>
              <CardDescription>Gestiona facturas y facturación automática</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{invoice.number}</h4>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{invoice.client}</p>
                      <p className="text-sm text-muted-foreground">
                        Emitida: {invoice.issueDate} | Vence: {invoice.dueDate}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-semibold text-lg">Bs. {invoice.amount.toLocaleString()}</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Factura
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Registrar Pago
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

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Control de Pagos</CardTitle>
              <CardDescription>Registra y controla pagos de clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{payment.code}</h4>
                        {getStatusBadge(payment.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{payment.client}</p>
                      <p className="text-sm text-muted-foreground">
                        Tipo: {payment.type} | Fecha: {payment.date}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-semibold text-lg text-green-600">Bs. {payment.amount.toLocaleString()}</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
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
      </Tabs>
    </div>
  )
}
