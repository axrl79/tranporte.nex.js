"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Fuel, Truck } from "lucide-react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

const formSchema = z.object({
  plateNumber: z.string().min(2, {
    message: "La placa debe tener al menos 2 caracteres.",
  }),
  type: z.enum(["camion", "trailer", "cisterna", "furgon", "otro"], {
    required_error: "Por favor seleccione un tipo de vehículo.",
  }),
  brand: z.string().min(1, {
    message: "La marca es obligatoria.",
  }),
  model: z.string().min(1, {
    message: "El modelo es obligatorio.",
  }),
  year: z.coerce
    .number()
    .int()
    .min(1900, {
      message: "El año debe ser válido.",
    })
    .max(new Date().getFullYear() + 1, {
      message: `El año no puede ser mayor a ${new Date().getFullYear() + 1}.`,
    }),
  capacity: z.coerce.number().positive({
    message: "La capacidad debe ser un número positivo.",
  }),
  status: z.enum(["disponible", "en_ruta", "mantenimiento", "inactivo"], {
    required_error: "Por favor seleccione un estado.",
  }),
  fuelType: z.string().min(1, {
    message: "El tipo de combustible es obligatorio.",
  }),
  fuelCapacity: z.coerce.number().positive({
    message: "La capacidad de combustible debe ser un número positivo.",
  }),
  currentFuelLevel: z.coerce
    .number()
    .min(0, {
      message: "El nivel de combustible no puede ser negativo.",
    })
    .optional(),
  totalKm: z.coerce
    .number()
    .min(0, {
      message: "El kilometraje no puede ser negativo.",
    })
    .optional(),
  active: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

const defaultValues: Partial<FormValues> = {
  plateNumber: "",
  type: "camion",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  capacity: 0,
  status: "disponible",
  fuelType: "Diésel",
  fuelCapacity: 0,
  currentFuelLevel: 0,
  totalKm: 0,
  active: true,
}

interface NewVehicleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVehicleCreated?: (vehicle: any) => void
}

export function NewVehicleForm({ open, onOpenChange, onVehicleCreated }: NewVehicleFormProps) {
  const [activeTab, setActiveTab] = useState("general")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear el vehículo")
      }

      const newVehicle = await response.json()

      toast({
        title: "Vehículo creado",
        description: `${data.brand} ${data.model} (${data.plateNumber}) ha sido añadido a la flota.`,
      })

      if (onVehicleCreated) {
        onVehicleCreated(newVehicle)
      }

      form.reset(defaultValues)
      onOpenChange(false)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear el vehículo",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const vehicleTypes = [
    { value: "camion", label: "Camión" },
    { value: "trailer", label: "Tráiler" },
    { value: "cisterna", label: "Cisterna" },
    { value: "furgon", label: "Furgón" },
    { value: "otro", label: "Otro" },
  ]

  const vehicleStatuses = [
    { value: "disponible", label: "Disponible" },
    { value: "en_ruta", label: "En Ruta" },
    { value: "mantenimiento", label: "En Mantenimiento" },
    { value: "inactivo", label: "Inactivo" },
  ]

  const fuelTypes = ["Diésel", "Gasolina", "Gas Natural", "Biodiesel", "Eléctrico", "Híbrido"]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Añadir Nuevo Vehículo</DialogTitle>
          <DialogDescription>Complete el formulario para añadir un nuevo vehículo a la flota.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="specs">Especificaciones</TabsTrigger>
                <TabsTrigger value="status">Estado</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-[#0A2463] flex items-center justify-center">
                    <Truck className="h-8 w-8 text-[#F2E9DC]" />
                  </div>
                  <div>
                    <h3 className="font-medium">Información del Vehículo</h3>
                    <p className="text-sm text-muted-foreground">Datos básicos del vehículo</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="plateNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Placa</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC-123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Vehículo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione un tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vehicleTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca</FormLabel>
                        <FormControl>
                          <Input placeholder="Marca del vehículo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo</FormLabel>
                        <FormControl>
                          <Input placeholder="Modelo del vehículo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Año</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacidad (Toneladas)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="specs" className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-[#F9DC5C] flex items-center justify-center">
                    <Fuel className="h-8 w-8 text-[#0A2463]" />
                  </div>
                  <div>
                    <h3 className="font-medium">Especificaciones Técnicas</h3>
                    <p className="text-sm text-muted-foreground">Detalles técnicos y de combustible</p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Combustible</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un tipo de combustible" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fuelTypes.map((type) => (
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fuelCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacidad de Combustible (L)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentFuelLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nivel Actual (L)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="totalKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kilometraje Total</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="status" className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado del Vehículo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicleStatuses.map((status) => (
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

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Vehículo Activo</FormLabel>
                        <FormDescription>Determina si el vehículo está activo en el sistema.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#0A2463] hover:bg-[#0A2463]/90" disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Crear Vehículo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
