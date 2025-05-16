"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"
import { es } from "date-fns/locale"

interface Activity {
  id: string
  userId: string
  userName: string
  userRole: string
  action: string
  module: string
  details: string | null
  timestamp: string
  ipAddress: string | null
}

interface UserActivityTableProps {
  filterRole?: string
}

export function UserActivityTable({ filterRole }: UserActivityTableProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoading(true)
        setError(null)

        const queryParams = new URLSearchParams()
        if (filterRole && filterRole !== "all") {
          queryParams.set("role", filterRole)
        }

        const response = await fetch(`/api/activity?${queryParams.toString()}`)

        if (!response.ok) {
          throw new Error("Error al cargar los datos de actividad")
        }

        const data = await response.json()
        setActivities(data.activities)
      } catch (err) {
        console.error("Error al cargar actividades:", err)
        setError(err instanceof Error ? err.message : "Error al cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [filterRole])

  const getStatusColor = (module: string) => {
    switch (module.toLowerCase()) {
      case "autenticación":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "programación":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "operaciones":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "usuarios":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "seguridad":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true, locale: es })
    } catch (error) {
      return "Fecha inválida"
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No hay registros de actividad {filterRole && filterRole !== "all" ? `para el rol ${filterRole}` : ""}
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-navy/5">
          <TableHead className="w-[250px]">Usuario</TableHead>
          <TableHead>Acción</TableHead>
          <TableHead>Módulo</TableHead>
          <TableHead>Tiempo</TableHead>
          <TableHead className="text-right">Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((activity) => (
          <TableRow key={activity.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                  <AvatarFallback className="bg-navy text-cream text-xs">
                    {getInitials(activity.userName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-navy">{activity.userName}</div>
                  <div className="text-xs text-muted-foreground capitalize">{activity.userRole}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>{activity.action}</TableCell>
            <TableCell>{activity.module}</TableCell>
            <TableCell>{formatTimeAgo(activity.timestamp)}</TableCell>
            <TableCell className="text-right">
              <Badge variant="outline" className={getStatusColor(activity.module)}>
                {activity.module}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
