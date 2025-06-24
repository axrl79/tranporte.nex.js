"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { MoreHorizontal, Eye, Play, CheckCircle, XCircle, Trash2 } from "lucide-react"

interface TripActionsProps {
  trip: any
  onTripUpdated: (trip: any) => void
  onTripDeleted: (tripId: string) => void
  onViewDetails: (trip: any) => void
}

export function TripActions({ trip, onTripUpdated, onTripDeleted, onViewDetails }: TripActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/trips/${trip.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el estado del viaje")
      }

      const updatedTrip = await response.json()
      onTripUpdated(updatedTrip)

      toast({
        title: "Éxito",
        description: `Estado del viaje actualizado a ${newStatus}`,
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del viaje",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/trips/${trip.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el viaje")
      }

      onTripDeleted(trip.id)

      toast({
        title: "Éxito",
        description: "Viaje eliminado correctamente",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el viaje",
        variant: "destructive",
      })
    }
    setShowDeleteDialog(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdating}>
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => onViewDetails(trip)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalles
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {trip.status === "programado" && (
            <DropdownMenuItem onClick={() => handleStatusChange("en_curso")}>
              <Play className="mr-2 h-4 w-4" />
              Iniciar Viaje
            </DropdownMenuItem>
          )}

          {trip.status === "en_curso" && (
            <DropdownMenuItem onClick={() => handleStatusChange("completado")}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Completar Viaje
            </DropdownMenuItem>
          )}

          {(trip.status === "programado" || trip.status === "en_curso") && (
            <DropdownMenuItem onClick={() => handleStatusChange("cancelado")}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar Viaje
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el viaje y todos los datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
