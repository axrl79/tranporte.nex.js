"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown, Download, MoreHorizontal, Plus, Search, Shield, ShieldAlert, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { NewUserForm } from "@/components/users/new-user-form"
import { toast } from "@/components/ui/use-toast"

export default function UsersPage() {
  const [selectedRole, setSelectedRole] = useState<string>("Todos")
  const [isNewUserFormOpen, setIsNewUserFormOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/users")
      if (!response.ok) {
        throw new Error("Error al cargar usuarios")
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const roles = [
    { name: "Todos", icon: User },
    { name: "admin", label: "Administrador", icon: ShieldAlert },
    { name: "operador", label: "Operador", icon: Shield },
    { name: "conductor", label: "Conductor", icon: User },
  ]

  const getRoleLabel = (roleName: string) => {
    const role = roles.find((r) => r.name === roleName)
    return role?.label || roleName
  }

  const filteredUsers = users
    .filter((user) => selectedRole === "Todos" || user.role === selectedRole)
    .filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  const handleUserCreated = (newUser: any) => {
    setUsers((prevUsers) => [newUser, ...prevUsers])
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getLastLoginText = (user: any) => {
    if (!user.lastLogin) return "Nunca"

    const lastLogin = new Date(user.lastLogin)
    const now = new Date()
    const diffMs = now.getTime() - lastLogin.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `Hace ${diffMins} minutos`
    if (diffHours < 24) return `Hace ${diffHours} horas`
    return `Hace ${diffDays} días`
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra usuarios y roles del sistema</p>
        </div>
        <Button className="bg-[#0A2463] hover:bg-[#0A2463]/90" onClick={() => setIsNewUserFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#0A2463] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs opacity-70">{isLoading ? "Cargando..." : `${users.length} usuarios registrados`}</p>
          </CardContent>
        </Card>

        <Card className="bg-[#F9DC5C] text-[#0A2463]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((user) => user.role === "admin").length}</div>
            <p className="text-xs opacity-70">Control total del sistema</p>
          </CardContent>
        </Card>

        <Card className="bg-[#F2E9DC] text-[#0A2463]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conductores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((user) => user.role === "conductor").length}</div>
            <p className="text-xs opacity-70">Operadores de vehículos</p>
          </CardContent>
        </Card>

        <Card className="bg-[#D90429] text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Inactivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((user) => !user.active).length}</div>
            <p className="text-xs opacity-70">Requieren atención</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>Gestiona los usuarios y sus roles en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar usuarios..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex gap-2">
                    <span>Rol:</span>
                    <span className="font-medium">
                      {selectedRole === "Todos" ? "Todos" : getRoleLabel(selectedRole)}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Filtrar por rol</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {roles.map((role) => (
                    <DropdownMenuCheckboxItem
                      key={role.name}
                      checked={selectedRole === role.name}
                      onCheckedChange={() => setSelectedRole(role.name)}
                    >
                      <div className="flex items-center gap-2">
                        <role.icon className="h-4 w-4" />
                        <span>{role.label || role.name}</span>
                      </div>
                      {selectedRole === role.name && <Check className="h-4 w-4 ml-auto" />}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A2463] mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Cargando usuarios...</p>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead>Última Actividad</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No se encontraron usuarios
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-[#0A2463] flex items-center justify-center text-white">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.role === "admin" && (
                            <Badge className="bg-[#0A2463]">
                              <ShieldAlert className="h-3 w-3 mr-1" />
                              Administrador
                            </Badge>
                          )}
                          {user.role === "operador" && (
                            <Badge className="bg-[#F9DC5C] text-[#0A2463]">
                              <Shield className="h-3 w-3 mr-1" />
                              Operador
                            </Badge>
                          )}
                          {user.role === "conductor" && (
                            <Badge variant="outline">
                              <User className="h-3 w-3 mr-1" />
                              Conductor
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.active ? (
                            <div className="flex items-center">
                              <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                              <span>Activo</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <div className="h-2 w-2 rounded-full bg-gray-300 mr-2" />
                              <span>Inactivo</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>{getLastLoginText(user)}</TableCell>
                        <TableCell className="text-right">
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
                              <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                              <DropdownMenuItem>Editar usuario</DropdownMenuItem>
                              <DropdownMenuItem>Cambiar rol</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-[#D90429]">
                                {user.active ? "Desactivar usuario" : "Activar usuario"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <NewUserForm open={isNewUserFormOpen} onOpenChange={setIsNewUserFormOpen} onUserCreated={handleUserCreated} />
    </div>
  )
}
