"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  ChevronDown,
  ClipboardList,
  Home,
  LogOut,
  Menu,
  Settings,
  Truck,
  User,
  Users,
  X,
  Package,
  Boxes,
  MapPin,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const routes = [
    {
      label: "Inicio",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Flota",
      icon: Truck,
      href: "/dashboard/fleet",
      active: pathname === "/dashboard/fleet",
    },
    {
      label: "Almacén",
      icon: Package,
      href: "/dashboard/warehouse",
      active: pathname.startsWith("/dashboard/warehouse"),
    },
    
    {
      label: "Viajes",  
      icon: MapPin,   
      href: "/dashboard/trips",
      active: pathname.startsWith("/dashboard/trips"),
    },
    {
      label: "Administración",
      icon: ClipboardList,
      href: "/dashboard/admin",
      active: pathname.startsWith("/dashboard/admin"),
    },
    {
      label: "RRHH",
      icon: Users,
      href: "/dashboard/hr",
      active: pathname.startsWith("/dashboard/hr"),
    },
    {
      label: "Reportes",
      icon: ClipboardList,
      href: "/dashboard/reports",
      active: pathname === "/dashboard/reports",
    },
    {
      label: "Usuarios",
      icon: Users,
      href: "/dashboard/users",
      active: pathname === "/dashboard/users",
    },
    {
      label: "Configuración",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
  ]

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-[#0A2463]">
        <div className="flex flex-col h-full">
          <div className="h-20 flex items-center justify-center border-b border-[#F2E9DC]/10">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="relative w-8 h-8 mr-2 bg-[#F9DC5C] rounded-full flex items-center justify-center">
                <Truck className="h-5 w-5 text-[#0A2463]" />
              </div>
              <h1 className="text-xl font-bold text-[#F2E9DC]">FleetSafe AI</h1>
            </Link>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-3 py-4">
              <div className="space-y-1">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "flex items-center gap-x-2 text-[#F2E9DC]/70 text-sm font-medium pl-3 pr-4 py-3 rounded-md hover:text-[#F2E9DC] hover:bg-[#0A2463]/60 transition",
                      route.active && "text-[#F2E9DC] bg-[#0A2463]/80",
                    )}
                  >
                    <route.icon className="h-5 w-5" />
                    {route.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
          <div className="p-4 border-t border-[#F2E9DC]/10">
            <div className="flex items-center gap-x-3">
              <div className="h-10 w-10 rounded-full bg-[#F2E9DC]/10 flex items-center justify-center">
                <User className="h-5 w-5 text-[#F2E9DC]" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#F2E9DC]">Admin User</span>
                <span className="text-xs text-[#F2E9DC]/70">Administrador</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <main className="md:pl-72 h-full">
        <div className="h-full flex flex-col">
          <header className="h-20 flex items-center border-b bg-white px-6">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
            <div className="ml-auto flex items-center gap-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[#D90429]" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-x-2">
                    <div className="h-8 w-8 rounded-full bg-[#0A2463] flex items-center justify-center">
                      <User className="h-4 w-4 text-[#F2E9DC]" />
                    </div>
                    <span>Admin User</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <div className="flex-1 overflow-auto bg-[#F2E9DC]/20">{children}</div>
        </div>
      </main>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 bg-[#0A2463]">
          <div className="h-20 flex items-center justify-between px-6 border-b border-[#F2E9DC]/10">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="relative w-8 h-8 mr-2 bg-[#F9DC5C] rounded-full flex items-center justify-center">
                <Truck className="h-5 w-5 text-[#0A2463]" />
              </div>
              <h1 className="text-xl font-bold text-[#F2E9DC]">FleetSafe AI</h1>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="text-[#F2E9DC]">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex flex-col overflow-y-auto">
            <nav className="flex-1 px-3 py-4">
              <div className="space-y-1">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-x-2 text-[#F2E9DC]/70 text-sm font-medium pl-3 pr-4 py-3 rounded-md hover:text-[#F2E9DC] hover:bg-[#0A2463]/60 transition",
                      route.active && "text-[#F2E9DC] bg-[#0A2463]/80",
                    )}
                  >
                    <route.icon className="h-5 w-5" />
                    {route.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
          <div className="p-4 border-t border-[#F2E9DC]/10">
            <div className="flex items-center gap-x-3">
              <div className="h-10 w-10 rounded-full bg-[#F2E9DC]/10 flex items-center justify-center">
                <User className="h-5 w-5 text-[#F2E9DC]" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#F2E9DC]">Admin User</span>
                <span className="text-xs text-[#F2E9DC]/70">Administrador</span>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
