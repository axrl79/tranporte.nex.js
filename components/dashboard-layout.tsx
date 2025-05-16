"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Truck,
  Home,
  Users,
  FileText,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Calendar,
  Fuel,
  Shield,
  History,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useToast } from "@/hooks/use-toast"

type User = {
  id: string
  name: string
  email: string
  role: string
} | null

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [activeModule, setActiveModule] = useState("dashboard")
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Obtener el usuario actual
  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error("Error al obtener el usuario:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentUser()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      })

      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  // Función para obtener las iniciales del nombre
  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "U"
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-beige/30">
        <Sidebar className="border-r border-navy/10 w-64">
          <SidebarHeader className="border-b border-navy/10 bg-navy text-cream">
            <div className="flex items-center gap-2 px-2">
              <Truck className="h-6 w-6" />
              <div className="font-bold text-lg">LogiSafe</div>
            </div>
          </SidebarHeader>
          <SidebarContent className="bg-navy text-cream">
            <SidebarGroup>
              <SidebarGroupLabel className="text-beige/70">Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeModule === "dashboard"}
                      onClick={() => setActiveModule("dashboard")}
                    >
                      <Home className="h-5 w-5" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeModule === "operations"}
                      onClick={() => setActiveModule("operations")}
                    >
                      <Truck className="h-5 w-5" />
                      <span>Operaciones</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeModule === "schedule"}
                      onClick={() => setActiveModule("schedule")}
                    >
                      <Calendar className="h-5 w-5" />
                      <span>Programación</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={activeModule === "fuel"} onClick={() => setActiveModule("fuel")}>
                      <Fuel className="h-5 w-5" />
                      <span>Combustibles</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-beige/70">Administración</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={activeModule === "users"} onClick={() => setActiveModule("users")}>
                      <Users className="h-5 w-5" />
                      <span>Usuarios</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={activeModule === "reports"} onClick={() => setActiveModule("reports")}>
                      <FileText className="h-5 w-5" />
                      <span>Reportes</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeModule === "activity"}
                      onClick={() => setActiveModule("activity")}
                    >
                      <History className="h-5 w-5" />
                      <span>Historial</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-beige/70">Sistema</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeModule === "security"}
                      onClick={() => setActiveModule("security")}
                    >
                      <Shield className="h-5 w-5" />
                      <span>Seguridad</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={activeModule === "settings"}
                      onClick={() => setActiveModule("settings")}
                    >
                      <Settings className="h-5 w-5" />
                      <span>Configuración</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-navy/10 bg-navy text-cream p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border border-beige/20">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback className="bg-crimson text-cream">
                    {user ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium">{user?.name || "Usuario"}</div>
                  <div className="text-xs text-beige/70">{user?.role || "Cargando..."}</div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-cream hover:bg-navy/80">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Ajustes</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="h-14 border-b border-navy/10 bg-cream flex items-center justify-between px-4">
            <div className="flex items-center">
              <SidebarTrigger className="mr-2" />
              <h1 className="text-navy font-semibold">
                {activeModule === "dashboard" && "Dashboard General"}
                {activeModule === "operations" && "Gestión de Operaciones"}
                {activeModule === "schedule" && "Programación de Rutas"}
                {activeModule === "fuel" && "Control de Combustibles"}
                {activeModule === "users" && "Administración de Usuarios"}
                {activeModule === "reports" && "Reportes y Análisis"}
                {activeModule === "activity" && "Historial de Actividad"}
                {activeModule === "security" && "Configuración de Seguridad"}
                {activeModule === "settings" && "Configuración del Sistema"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-navy" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-crimson text-cream">
                      3
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-auto">
                    {[1, 2, 3].map((i) => (
                      <DropdownMenuItem key={i} className="py-3 cursor-pointer">
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">Alerta de seguridad #{i}</div>
                          <div className="text-sm text-muted-foreground">
                            Se ha detectado una actividad inusual en el sistema.
                          </div>
                          <div className="text-xs text-muted-foreground">Hace 2 horas</div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
