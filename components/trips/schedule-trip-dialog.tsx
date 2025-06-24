"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Calendar, Clock, MapPin, Route, Truck, User, Package } from "lucide-react"

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
  routeId: z.string({
    required_error: "Debe seleccionar una ruta",
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

interface ScheduleTripDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTripScheduled?: (trip: any) => void
}

export function ScheduleTripDialog({ open, onOpenChange, onTripScheduled }: ScheduleTripDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [routes, setRoutes] = useState<any[]>([])
  const [selectedRoute, setSelectedRoute] = useState<any>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleId: "",
      driverId: "",
      routeId: "",
      scheduledStart: "",
      scheduledEnd: "",
      cargo: "",
      cargoWeight: 0,
      notes: "",
    },
  })

  // Cargar datos necesarios
  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    try {
      const [vehiclesRes, driversRes, routesRes] = await Promise.all([
        fetch("/api/vehicles?status=disponible"),
        fetch("/api/users?role=conductor&active=true"),
        fetch("/api/routes?active=true"),
      ])

      const [vehiclesData, driversData, routesData] = await Promise.all([
        vehiclesRes.json(),
        driversRes.json(),
        routesRes.json(),
      ])

      setVehicles(vehiclesData)
      setDrivers(driversData)
      setRoutes(routesData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos necesarios",
        variant: "destructive",
      })
    }
  }

  // Calcular fecha de finalización automáticamente
  const updateEndDate = (startDate: string, routeId: string) => {
    if (startDate && routeId) {
      const route = routes.find((r) => r.id === routeId)
      if (route) {
        const start = new Date(startDate)
        const durationInMinutes = route.estimatedDuration || 480 // 8 horas por defecto
        const end = new Date(start.getTime() + durationInMinutes * 60 * 1000)

        const endFormatted = end.toISOString().slice(0, 16)
        form.setValue("scheduledEnd", endFormatted)
        setSelectedRoute(route)
      }
    }
  }

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al programar viaje")
      }

      const newTrip = await response.json()

      toast({
        title: "Viaje programado",
        description: "El viaje ha sido programado exitosamente.",
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

  const formatDistance = (distance: string | number) => {
    const dist = typeof distance === "string" ? Number.parseFloat(distance) : distance
    return dist.toLocaleString() + " km"
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Programar Nuevo Viaje</DialogTitle>
          <DialogDescription>Complete la información para programar un nuevo viaje</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información de la ruta seleccionada */}
            {selectedRoute && (
              <Card className="bg-[#F2E9DC]/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Route className="h-4 w-4 text-[#0A2463]" />
                    Ruta Seleccionada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{selectedRoute.name}</span>
                      <Badge variant="outline">{formatDistance(selectedRoute.distance || 0)}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3 w-3 text-green-600" />
                      <span>{selectedRoute.originName}</span>
                      <span className="mx-1">→</span>
                      <MapPin className="h-3 w-3 text-red-600" />
                      <span>{selectedRoute.destinationName}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Duración estimada: {formatDuration(selectedRoute.estimatedDuration || 480)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Selección de ruta */}
              <FormField
                control={form.control}
                name="routeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ruta</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        const startDate = form.getValues("scheduledStart")
                        if (startDate) {
                          updateEndDate(startDate, value)
                        }
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar ruta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {routes.map((route) => (
                          <SelectItem key={route.id} value={route.id}>
                            <div className="flex items-center gap-2">
                              <Route className="h-4 w-4 text-[#0A2463]" />
                              <span>{route.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Seleccione la ruta para este viaje</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

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
                            const routeId = form.getValues("routeId")
                            if (routeId) {
                              updateEndDate(e.target.value, routeId)
                            }
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
                    <FormLabel>Descripción de la Carga</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-[#0A2463]" />
                        <Input placeholder="Ej: Mercancía general, Combustible, etc." {...field} />
                      </div>
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
