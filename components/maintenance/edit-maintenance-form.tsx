"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Calendar, Wrench, DollarSign, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  type: z.string().min(1, {
    message: "El tipo de mantenimiento es obligatorio",
  }),
  description: z.string().min(1, {
    message: "La descripción es obligatoria",
  }),
  scheduledDate: z.string({
    required_error: "Debe especificar la fecha programada",
  }),
  completedDate: z.string().optional(),
  cost: z.coerce.number().min(0).optional(),
  technicianId: z.string().optional(),
  status: z.enum(["programado", "en_proceso", "completado", "cancelado"]),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface EditMaintenanceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  maintenance: any
  onMaintenanceUpdated?: (maintenance: any) => void
}

export function EditMaintenanceForm({
  open,
  onOpenChange,
  maintenance,
  onMaintenanceUpdated,
}: EditMaintenanceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<any[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      description: "",
      scheduledDate: "",
      completedDate: "",
      cost: 0,
      technicianId: "",
      status: "programado",
      notes: "",
    },
  })

  // Cargar datos cuando cambia el mantenimiento
  useEffect(() => {
    if (maintenance) {
      form.reset({
        type: maintenance.type,
        description: maintenance.description,
        scheduledDate: maintenance.scheduledDate ? new Date(maintenance.scheduledDate).toISOString().slice(0, 16) : "",
        completedDate: maintenance.completedDate ? new Date(maintenance.completedDate).toISOString().slice(0, 16) : "",
        cost: maintenance.cost ? Number(maintenance.cost) : 0,
        technicianId: maintenance.technicianId || "",
        status: maintenance.status,
        notes: maintenance.notes || "",
      })
    }
  }, [maintenance, form])

  // Cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users")
        if (response.ok) {
          const data = await response.json()
          setUsers(data.filter((user: any) => user.role === "admin" || user.role === "operador"))
        }
      } catch (error) {
        console.error("Error al cargar usuarios:", error)
      }
    }

    if (open) {
      fetchUsers()
    }
  }, [open])

  async function onSubmit(data: FormValues) {
    if (!maintenance) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/maintenances/${maintenance.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar mantenimiento")
      }

      const updatedMaintenance = await response.json()

      toast({
        title: "Mantenimiento actualizado",
        description: "El mantenimiento ha sido actualizado exitosamente",
      })

      if (onMaintenanceUpdated) {
        onMaintenanceUpdated(updatedMaintenance)
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar mantenimiento",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const maintenanceTypes = [
    "Mantenimiento Preventivo",
    "Mantenimiento Correctivo",
    "Cambio de Aceite",
    "Revisión de Frenos",
    "Alineación y Balanceo",
    "Cambio de Filtros",
    "Revisión de Motor",
    "Mantenimiento de Transmisión",
    "Revisión Eléctrica",
    "Inspección General",
    "Reparación de Carrocería",
    "Otro",
  ]

  const statusOptions = [
    { value: "programado", label: "Programado" },
    { value: "en_proceso", label: "En Proceso" },
    { value: "completado", label: "Completado" },
    { value: "cancelado", label: "Cancelado" },
  ]

  if (!maintenance) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Editar Mantenimiento</DialogTitle>
          <DialogDescription>Modifique la información del mantenimiento</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-[#0A2463] flex items-center justify-center">
                <Wrench className="h-8 w-8 text-[#F2E9DC]" />
              </div>
              <div>
                <h3 className="font-medium">Editar Mantenimiento</h3>
                <p className="text-sm text-muted-foreground">
                  Vehículo: {maintenance.vehicle?.plateNumber} - {maintenance.vehicle?.brand}{" "}
                  {maintenance.vehicle?.model}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de mantenimiento */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Mantenimiento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {maintenanceTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estado */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa detalladamente el mantenimiento..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha programada */}
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha Programada</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-[#0A2463]" />
                        <Input type="datetime-local" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fecha completada */}
              <FormField
                control={form.control}
                name="completedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha Completada (Opcional)</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-green-600" />
                        <Input type="datetime-local" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>Solo para mantenimientos completados</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Técnico asignado */}
              <FormField
                control={form.control}
                name="technicianId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Técnico Asignado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar técnico" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sin asignar</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-[#0A2463]" />
                              <span>{user.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Costo */}
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-[#0A2463]" />
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>Costo en bolivianos</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notas adicionales */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observaciones, instrucciones especiales, etc."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#0A2463] hover:bg-[#0A2463]/90" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
