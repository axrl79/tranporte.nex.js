"use client"

import { useState } from "react"
import { Shield, ShieldAlert, User, Mail, Calendar, Clock, CheckCircle, XCircle } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UserProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
  onEdit: () => void
}

export function UserProfileDialog({ open, onOpenChange, user, onEdit }: UserProfileDialogProps) {
  const [activeTab, setActiveTab] = useState("general")

  if (!user) return null

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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <ShieldAlert className="h-5 w-5 text-[#0A2463]" />
      case "operador":
        return <Shield className="h-5 w-5 text-[#0A2463]" />
      default:
        return <User className="h-5 w-5 text-[#0A2463]" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-[#0A2463]">
            <ShieldAlert className="h-3 w-3 mr-1" />
            Administrador
          </Badge>
        )
      case "operador":
        return (
          <Badge className="bg-[#F9DC5C] text-[#0A2463]">
            <Shield className="h-3 w-3 mr-1" />
            Operador
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <User className="h-3 w-3 mr-1" />
            Conductor
          </Badge>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Perfil de Usuario</DialogTitle>
          <DialogDescription>Información detallada del usuario</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-[#F2E9DC]">
              <AvatarFallback className="bg-[#0A2463] text-[#F2E9DC] text-xl">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>
              <div className="mt-2">{getRoleBadge(user.role)}</div>
            </div>
            <Button onClick={onEdit} className="bg-[#0A2463] hover:bg-[#0A2463]/90">
              Editar Usuario
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="activity">Actividad</TabsTrigger>
              <TabsTrigger value="permissions">Permisos</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Estado de la Cuenta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {user.active ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span>Activo</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span>Inactivo</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Rol del Sistema</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <span>
                        {user.role === "admin" ? "Administrador" : user.role === "operador" ? "Operador" : "Conductor"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Información Temporal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Fecha de Creación</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#0A2463]" />
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Último Acceso</div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#0A2463]" />
                        <span>{user.lastLogin ? formatDate(user.lastLogin) : "Nunca"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {user.phone || user.address ? (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Información de Contacto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {user.phone && (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Teléfono</div>
                          <div>{user.phone}</div>
                        </div>
                      )}
                      {user.address && (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Dirección</div>
                          <div>{user.address}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {user.notes && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Notas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{user.notes}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>Historial de actividades del usuario</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-40">
                    <p className="text-muted-foreground">No hay actividades registradas</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Permisos del Sistema</CardTitle>
                  <CardDescription>Permisos asignados según el rol</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Acceso al Dashboard</span>
                      </div>
                      <Badge variant="outline">Permitido</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {user.role === "admin" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>Gestión de Usuarios</span>
                      </div>
                      <Badge variant="outline">{user.role === "admin" ? "Permitido" : "Denegado"}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {user.role === "admin" || user.role === "operador" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>Gestión de Flota</span>
                      </div>
                      <Badge variant="outline">
                        {user.role === "admin" || user.role === "operador" ? "Permitido" : "Denegado"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {user.role === "admin" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>Configuración del Sistema</span>
                      </div>
                      <Badge variant="outline">{user.role === "admin" ? "Permitido" : "Denegado"}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
