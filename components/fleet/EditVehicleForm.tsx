"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { toast } from "@/components/ui/use-toast"
import { useEffect, useState } from "react"
import { Truck, Fuel, Gauge, CalendarCheck, CalendarX, Check } from "lucide-react"

type VehicleFormData = {
  plateNumber: string
  brand: string
  model: string
  year: number
  type: string
  capacity: number
  fuelType: string
  fuelCapacity: number
  currentFuelLevel: number
  totalKm: number
  status: string
  active: boolean
}

export function EditVehicleForm({ open, onOpenChange, vehicle, onVehicleUpdated }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: any
  onVehicleUpdated: (vehicle: any) => void
}) {
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<VehicleFormData>()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar datos del vehículo cuando se abre el diálogo
  useEffect(() => {
    if (open && vehicle) {
      const fetchVehicleData = async () => {
        try {
          setIsLoading(true)
          const response = await fetch(`/api/vehicles/${vehicle.id}`)
          if (!response.ok) {
            throw new Error('Error al cargar datos del vehículo')
          }
          const vehicleData = await response.json()
          
          // Establecer valores en el formulario
          setValue('plateNumber', vehicleData.plateNumber)
          setValue('brand', vehicleData.brand)
          setValue('model', vehicleData.model)
          setValue('year', vehicleData.year)
          setValue('type', vehicleData.type)
          setValue('capacity', vehicleData.capacity)
          setValue('fuelType', vehicleData.fuelType)
          setValue('fuelCapacity', vehicleData.fuelCapacity)
          setValue('currentFuelLevel', vehicleData.currentFuelLevel)
          setValue('totalKm', vehicleData.totalKm)
          setValue('status', vehicleData.status)
          setValue('active', vehicleData.active)
          
        } catch (error) {
          console.error('Error:', error)
          toast({
            title: "Error",
            description: "No se pudieron cargar los datos del vehículo",
            variant: "destructive",
          })
          onOpenChange(false)
        } finally {
          setIsLoading(false)
        }
      }

      fetchVehicleData()
    }
  }, [open, vehicle, setValue, onOpenChange])

  const onSubmit = async (data: VehicleFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar el vehículo')
      }

      const updatedVehicle = await response.json()
      onVehicleUpdated(updatedVehicle)
      onOpenChange(false)
      toast({
        title: "Vehículo actualizado",
        description: "Los cambios se han guardado correctamente.",
      })
    } catch (error: any) {
      console.error('Error updating vehicle:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el vehículo",
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
    { value: "pickup", label: "Pickup" },
    { value: "otro", label: "Otro" },
  ]

  const fuelTypes = [
    { value: "gasolina", label: "Gasolina" },
    { value: "diesel", label: "Diésel" },
    { value: "electrico", label: "Eléctrico" },
    { value: "hibrido", label: "Híbrido" },
  ]

  const statusOptions = [
    { value: "disponible", label: "Disponible" },
    { value: "en_ruta", label: "En ruta" },
    { value: "mantenimiento", label: "Mantenimiento" },
    { value: "inactivo", label: "Inactivo" },
  ]

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Cargando vehículo...</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Vehículo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plateNumber">Placa *</Label>
              <Input
                id="plateNumber"
                {...register("plateNumber", { required: "La placa es requerida" })}
                disabled={isSubmitting}
              />
              {errors.plateNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.plateNumber.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="brand">Marca *</Label>
              <Input
                id="brand"
                {...register("brand", { required: "La marca es requerida" })}
                disabled={isSubmitting}
              />
              {errors.brand && (
                <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="model">Modelo *</Label>
              <Input
                id="model"
                {...register("model", { required: "El modelo es requerido" })}
                disabled={isSubmitting}
              />
              {errors.model && (
                <p className="text-red-500 text-sm mt-1">{errors.model.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="year">Año *</Label>
              <Input
                id="year"
                type="number"
                {...register("year", { 
                  required: "El año es requerido",
                  min: { value: 1900, message: "Año inválido" },
                  max: { value: new Date().getFullYear() + 1, message: "Año inválido" }
                })}
                disabled={isSubmitting}
              />
              {errors.year && (
                <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo de vehículo *</Label>
              <Select 
                onValueChange={(value) => setValue("type", value)}
                defaultValue={vehicle?.type}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="capacity">Capacidad (kg) *</Label>
              <Input
                id="capacity"
                type="number"
                step="0.01"
                {...register("capacity", { 
                  required: "La capacidad es requerida",
                  min: { value: 0.1, message: "Capacidad inválida" }
                })}
                disabled={isSubmitting}
              />
              {errors.capacity && (
                <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fuelType">Tipo de combustible *</Label>
              <Select 
                onValueChange={(value) => setValue("fuelType", value)}
                defaultValue={vehicle?.fuelType}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione combustible" />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypes.map((fuel) => (
                    <SelectItem key={fuel.value} value={fuel.value}>
                      <div className="flex items-center gap-2">
                        <Fuel className="h-4 w-4" />
                        {fuel.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fuelCapacity">Capacidad combustible (L) *</Label>
              <Input
                id="fuelCapacity"
                type="number"
                step="0.1"
                {...register("fuelCapacity", { 
                  required: "La capacidad es requerida",
                  min: { value: 0, message: "Capacidad inválida" }
                })}
                disabled={isSubmitting}
              />
              {errors.fuelCapacity && (
                <p className="text-red-500 text-sm mt-1">{errors.fuelCapacity.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentFuelLevel">Nivel actual combustible (%)</Label>
              <Input
                id="currentFuelLevel"
                type="number"
                step="1"
                min="0"
                max="100"
                {...register("currentFuelLevel", { 
                  min: { value: 0, message: "Mínimo 0%" },
                  max: { value: 100, message: "Máximo 100%" }
                })}
                disabled={isSubmitting}
              />
              {errors.currentFuelLevel && (
                <p className="text-red-500 text-sm mt-1">{errors.currentFuelLevel.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="totalKm">Kilometraje total *</Label>
              <Input
                id="totalKm"
                type="number"
                step="1"
                {...register("totalKm", { 
                  required: "El kilometraje es requerido",
                  min: { value: 0, message: "Kilometraje inválido" }
                })}
                disabled={isSubmitting}
              />
              {errors.totalKm && (
                <p className="text-red-500 text-sm mt-1">{errors.totalKm.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Estado *</Label>
              <Select 
                onValueChange={(value) => setValue("status", value)}
                defaultValue={vehicle?.status}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        {status.value === "disponible" && <Check className="h-4 w-4 text-green-500" />}
                        {status.value === "en_ruta" && <Gauge className="h-4 w-4 text-blue-500" />}
                        {status.value === "mantenimiento" && <CalendarCheck className="h-4 w-4 text-yellow-500" />}
                        {status.value === "inactivo" && <CalendarX className="h-4 w-4 text-gray-500" />}
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  {...register("active")}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  disabled={isSubmitting}
                />
                <Label htmlFor="active">Vehículo activo</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}