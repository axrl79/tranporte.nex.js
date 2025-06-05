"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { MapPin, Route, Calculator } from "lucide-react"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CityCombobox } from "@/components/fleet/city-combobox"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  description: z.string().optional(),
  originName: z.string().min(1, {
    message: "El origen es obligatorio.",
  }),
  originLat: z.coerce.number().min(-90).max(90, {
    message: "La latitud debe estar entre -90 y 90.",
  }),
  originLng: z.coerce.number().min(-180).max(180, {
    message: "La longitud debe estar entre -180 y 180.",
  }),
  destinationName: z.string().min(1, {
    message: "El destino es obligatorio.",
  }),
  destinationLat: z.coerce.number().min(-90).max(90, {
    message: "La latitud debe estar entre -90 y 90.",
  }),
  destinationLng: z.coerce.number().min(-180).max(180, {
    message: "La longitud debe estar entre -180 y 180.",
  }),
  distance: z.coerce.number().positive({
    message: "La distancia debe ser un número positivo.",
  }),
  estimatedDuration: z.coerce.number().positive({
    message: "La duración debe ser un número positivo.",
  }),
  active: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface EditRouteFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  route: any
  onRouteUpdated?: (route: any) => void
}

export function EditRouteForm({ open, onOpenChange, route, onRouteUpdated }: EditRouteFormProps) {
  const [activeTab, setActiveTab] = useState("general")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      originName: "",
      originLat: 0,
      originLng: 0,
      destinationName: "",
      destinationLat: 0,
      destinationLng: 0,
      distance: 0,
      estimatedDuration: 0,
      active: true,
    },
  })

  // Cargar los datos de la ruta cuando cambia
  useEffect(() => {
    if (route) {
      form.reset({
        name: route.name,
        description: route.description || "",
        originName: route.originName,
        originLat: Number.parseFloat(route.originLat),
        originLng: Number.parseFloat(route.originLng),
        destinationName: route.destinationName,
        destinationLat: Number.parseFloat(route.destinationLat),
        destinationLng: Number.parseFloat(route.destinationLng),
        distance: Number.parseFloat(route.distance),
        estimatedDuration: route.estimatedDuration,
        active: route.active,
      })
    }
  }, [route, form])

  async function onSubmit(data: FormValues) {
    if (!route) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/routes/${route.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar la ruta")
      }

      const updatedRoute = await response.json()

      toast({
        title: "Ruta actualizada",
        description: `La ruta ${data.name} ha sido actualizada exitosamente.`,
      })

      if (onRouteUpdated) {
        onRouteUpdated(updatedRoute)
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar la ruta",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para calcular distancia aproximada (fórmula de Haversine)
  const calculateDistance = () => {
    const originLat = form.getValues("originLat")
    const originLng = form.getValues("originLng")
    const destLat = form.getValues("destinationLat")
    const destLng = form.getValues("destinationLng")

    if (originLat && originLng && destLat && destLng) {
      const R = 6371 // Radio de la Tierra en km
      const dLat = ((destLat - originLat) * Math.PI) / 180
      const dLng = ((destLng - originLng) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((originLat * Math.PI) / 180) *
          Math.cos((destLat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c

      form.setValue("distance", Math.round(distance))
      // Estimar duración (asumiendo 50 km/h promedio en Bolivia considerando terreno)
      form.setValue("estimatedDuration", Math.round((distance / 50) * 60))

      toast({
        title: "Distancia calculada",
        description: `Distancia aproximada: ${Math.round(distance)} km`,
      })
    }
  }

  // Función para manejar la selección de ciudad de origen
  const handleOriginCitySelect = (city: { name: string; lat: number; lng: number }) => {
    form.setValue("originName", city.name)
    form.setValue("originLat", city.lat)
    form.setValue("originLng", city.lng)

    // Auto-generar nombre de ruta si ambas ciudades están seleccionadas
    const destinationName = form.getValues("destinationName")
    if (destinationName) {
      form.setValue("name", `${city.name} - ${destinationName}`)
    }
  }

  // Función para manejar la selección de ciudad de destino
  const handleDestinationCitySelect = (city: { name: string; lat: number; lng: number }) => {
    form.setValue("destinationName", city.name)
    form.setValue("destinationLat", city.lat)
    form.setValue("destinationLng", city.lng)

    // Auto-generar nombre de ruta si ambas ciudades están seleccionadas
    const originName = form.getValues("originName")
    if (originName) {
      form.setValue("name", `${originName} - ${city.name}`)
    }
  }

  if (!route) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Editar Ruta</DialogTitle>
          <DialogDescription>Modifique la información de la ruta</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="locations">Ubicaciones</TabsTrigger>
                <TabsTrigger value="details">Detalles</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-[#0A2463] flex items-center justify-center">
                    <Route className="h-8 w-8 text-[#F2E9DC]" />
                  </div>
                  <div>
                    <h3 className="font-medium">Información de la Ruta</h3>
                    <p className="text-sm text-muted-foreground">Datos básicos de la ruta</p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Ruta</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: La Paz - Santa Cruz" {...field} />
                      </FormControl>
                      <FormDescription>Un nombre descriptivo para identificar la ruta</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción adicional de la ruta, puntos de interés, condiciones especiales, etc."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Ruta Activa</FormLabel>
                        <FormDescription>Determina si la ruta está disponible para asignar viajes.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="locations" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-green-600" />
                        Punto de Origen
                      </CardTitle>
                      <CardDescription>Ubicación de inicio de la ruta</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="originName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ciudad de Origen</FormLabel>
                            <FormControl>
                              <CityCombobox
                                value={field.value}
                                onValueChange={field.onChange}
                                onCitySelect={handleOriginCitySelect}
                                placeholder="Seleccionar ciudad de origen..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="originLat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Latitud</FormLabel>
                              <FormControl>
                                <Input type="number" step="any" placeholder="-16.4897" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="originLng"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Longitud</FormLabel>
                              <FormControl>
                                <Input type="number" step="any" placeholder="-68.1193" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-red-600" />
                        Punto de Destino
                      </CardTitle>
                      <CardDescription>Ubicación de llegada de la ruta</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="destinationName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ciudad de Destino</FormLabel>
                            <FormControl>
                              <CityCombobox
                                value={field.value}
                                onValueChange={field.onChange}
                                onCitySelect={handleDestinationCitySelect}
                                placeholder="Seleccionar ciudad de destino..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="destinationLat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Latitud</FormLabel>
                              <FormControl>
                                <Input type="number" step="any" placeholder="-17.7863" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="destinationLng"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Longitud</FormLabel>
                              <FormControl>
                                <Input type="number" step="any" placeholder="-63.1812" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={calculateDistance}
                    className="flex items-center gap-2"
                    disabled={!form.getValues("originLat") || !form.getValues("destinationLat")}
                  >
                    <Calculator className="h-4 w-4" />
                    Recalcular Distancia
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="distance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distancia (km)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="450" {...field} />
                        </FormControl>
                        <FormDescription>Distancia total de la ruta en kilómetros</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimatedDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duración Estimada (minutos)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="540" {...field} />
                        </FormControl>
                        <FormDescription>
                          Tiempo estimado de viaje en minutos (considerando terreno boliviano)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Card className="bg-[#F2E9DC]/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Resumen de la Ruta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Origen:</span>
                        <span className="font-medium">{form.watch("originName") || "No especificado"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Destino:</span>
                        <span className="font-medium">{form.watch("destinationName") || "No especificado"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Distancia:</span>
                        <span className="font-medium">{form.watch("distance") || 0} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duración:</span>
                        <span className="font-medium">
                          {form.watch("estimatedDuration")
                            ? `${Math.floor(form.watch("estimatedDuration") / 60)}h ${
                                form.watch("estimatedDuration") % 60
                              }m`
                            : "0h 0m"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

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
