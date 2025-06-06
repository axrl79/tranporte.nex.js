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
  vehicleId: z.string({
    required_error: "Debe seleccionar un vehículo",
  }),
  type: z.string().min(1, {
    message: "El tipo de mantenimiento es obligatorio",
  }),
  description: z.string().min(1, {
    message: "La descripción es obligatoria",
  }),
  scheduledDate: z.string({
    required_error: "Debe especificar la fecha programada",
  }),
  cost: z.coerce.number().min(0).optional(),
  technicianId: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface NewMaintenanceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMaintenanceCreated?: (maintenance: any) => void
}

export function NewMaintenanceForm({ open, onOpenChange, onMaintenanceCreated }: NewMaintenanceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleId: "",
      type: "",
      description: "",
      scheduledDate: "",
      cost: 0,
      technicianId: "",
      notes: "",
    },
  })

  // Cargar vehículos y usuarios
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesRes, usersRes] = await Promise.all([fetch("/api/vehicles"), fetch("/api/users")])

        if (vehiclesRes.ok) {
          const vehiclesData = await vehiclesRes.json()
          setVehicles(vehiclesData)
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData.filter((user: any) => user.role === "admin" || user.role === "operador"))
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
      }
    }

    if (open) {
      fetchData()
    }
  }, [open])

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/maintenances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear mantenimiento")
      }

      const newMaintenance = await response.json()

      toast({
        title: "Mantenimiento programado",
        description: "El mantenimiento ha sido programado exitosamente",
      })

      if (onMaintenanceCreated) {
        onMaintenanceCreated(newMaintenance)
      }

      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear mantenimiento",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Programar Mantenimiento</DialogTitle>
          <DialogDescription>Programe un nuevo mantenimiento para un vehículo</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-[#0A2463] flex items-center justify-center">
                <Wrench className="h-8 w-8 text-[#F2E9DC]" />
              </div>
              <div>
                <h3 className="font-medium">Información del Mantenimiento</h3>
                <p className="text-sm text-muted-foreground">Complete los detalles del mantenimiento</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Selección de vehículo */}
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehículo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar vehículo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            <div className="flex items-center gap-2">
                              <span>
                                {vehicle.plateNumber} - {vehicle.brand} {vehicle.model}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      placeholder="Describa detalladamente el mantenimiento a realizar..."
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

              {/* Técnico asignado */}
              <FormField
                control={form.control}
                name="technicianId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Técnico Asignado (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar técnico" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                    <FormDescription>Opcional: Asignar un técnico responsable</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Costo estimado */}
            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo Estimado (Opcional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-[#0A2463]" />
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>Costo estimado en bolivianos</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isSubmitting ? "Programando..." : "Programar Mantenimiento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
