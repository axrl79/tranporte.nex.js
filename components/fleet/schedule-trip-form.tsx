"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Calendar, Clock, MapPin, Route, Truck, User } from "lucide-react"

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const formSchema = z.object({
  vehicleId: z.string({
    required_error: "Debe seleccionar un vehículo",
  }),
  driverId: z.string({
    required_error: "Debe seleccionar un conductor",
  }),
  scheduledStart: z.string({
    required_error: "Debe especificar la fecha y hora de inicio",
  }),
  scheduledEnd: z.string({
    required_error: "Debe especificar la fecha y hora de finalización",
  }),
  cargo: z.string().min(1, {
    message: "Debe especificar la carga",
  }),
  cargoWeight: z.coerce
    .number()
    .min(0, {
      message: "El peso no puede ser negativo",
    })
    .optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

// Datos simulados
const vehicles = [
  { id: "v1", plateNumber: "ABC-123", type: "camion", status: "disponible" },
  { id: "v2", plateNumber: "XYZ-789", type: "cisterna", status: "disponible" },
  { id: "v3", plateNumber: "DEF-456", type: "trailer", status: "disponible" },
]

const drivers = [
  { id: "d1", name: "Carlos Méndez", role: "conductor", active: true },
  { id: "d2", name: "Ana Gutiérrez", role: "conductor", active: true },
  { id: "d3", name: "Roberto Sánchez", role: "conductor", active: true },
]

interface ScheduleTripFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  route: any
  onTripScheduled?: (trip: any) => void
}

export function ScheduleTripForm({ open, onOpenChange, route, onTripScheduled }: ScheduleTripFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleId: "",
      driverId: "",
      scheduledStart: "",
      scheduledEnd: "",
      cargo: "",
      cargoWeight: 0,
      notes: "",
    },
  })

  // Calcular fecha de finalización automáticamente
  const updateEndDate = (startDate: string) => {
    if (startDate && route) {
      const start = new Date(startDate)
      const durationInMinutes = route.estimatedDuration
      const end = new Date(start.getTime() + durationInMinutes * 60 * 1000)

      // Formatear para input datetime-local
      const endFormatted = end.toISOString().slice(0, 16)
      form.setValue("scheduledEnd", endFormatted)
    }
  }

  async function onSubmit(data: FormValues) {
    if (!route) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          routeId: route.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al programar viaje")
      }

      const newTrip = await response.json()

      toast({
        title: "Viaje programado",
        description: `El viaje ha sido programado exitosamente para la ruta ${route.name}.`,
      })

      if (onTripScheduled) {
        onTripScheduled(newTrip)
      }

      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al programar viaje",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!route) return null

  // Formatear distancia
  const formatDistance = (distance: string | number) => {
    const dist = typeof distance === "string" ? Number.parseFloat(distance) : distance
    return dist.toLocaleString() + " km"
  }

  // Formatear duración
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Programar Viaje</DialogTitle>
          <DialogDescription>Programe un nuevo viaje para la ruta seleccionada</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información de la ruta */}
            <Card className="bg-[#F2E9DC]/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Route className="h-4 w-4 text-[#0A2463]" />
                  Información de la Ruta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{route.name}</span>
                    <Badge variant="outline">{formatDistance(route.distance)}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3 w-3 text-green-600" />
                    <span>{route.originName}</span>
                    <span className="mx-1">→</span>
                    <MapPin className="h-3 w-3 text-red-600" />
                    <span>{route.destinationName}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Duración estimada: {formatDuration(route.estimatedDuration)}
                  </div>
                </div>
              </CardContent>
            </Card>

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
                              <Truck className="h-4 w-4 text-[#0A2463]" />
                              <span>
                                {vehicle.plateNumber} ({vehicle.type})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Seleccione el vehículo para este viaje</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Selección de conductor */}
              <FormField
                control={form.control}
                name="driverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conductor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar conductor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {drivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-[#0A2463]" />
                              <span>{driver.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Seleccione el conductor para este viaje</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha y hora de inicio */}
              <FormField
                control={form.control}
                name="scheduledStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha y Hora de Inicio</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-[#0A2463]" />
                        <Input
                          type="datetime-local"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            updateEndDate(e.target.value)
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fecha y hora de finalización */}
              <FormField
                control={form.control}
                name="scheduledEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha y Hora de Finalización</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-[#0A2463]" />
                        <Input type="datetime-local" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>Se calcula automáticamente según la duración de la ruta</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Carga */}
              <FormField
                control={form.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carga</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Mercancía general, Combustible, etc." {...field} />
                    </FormControl>
                    <FormDescription>Tipo de carga a transportar</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Peso de la carga */}
              <FormField
                control={form.control}
                name="cargoWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso de la Carga (Toneladas)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="0" {...field} />
                    </FormControl>
                    <FormDescription>Opcional: Peso aproximado en toneladas</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Instrucciones especiales, detalles de la carga, contactos, etc."
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
                {isSubmitting ? "Programando..." : "Programar Viaje"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
