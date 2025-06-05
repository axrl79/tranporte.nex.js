"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowUpDown, Package, TrendingUp, TrendingDown } from "lucide-react"

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

const formSchema = z.object({
  productId: z.string({
    required_error: "Debe seleccionar un producto",
  }),
  type: z.enum(["entrada", "salida", "ajuste", "transferencia"], {
    required_error: "Debe seleccionar un tipo de movimiento",
  }),
  quantity: z.coerce.number().min(0.01, {
    message: "La cantidad debe ser mayor a 0",
  }),
  unitCost: z.coerce.number().min(0).optional(),
  reason: z.string().min(1, {
    message: "Debe especificar la razón del movimiento",
  }),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

// Datos simulados de productos
const products = [
  {
    id: "1",
    code: "PROD-001",
    name: "Aceite Motor 20W-50",
    unit: "L",
    currentStock: 150,
    availableStock: 120,
  },
  {
    id: "2",
    code: "PROD-002",
    name: "Filtro de Aire",
    unit: "unidad",
    currentStock: 25,
    availableStock: 25,
  },
  {
    id: "3",
    code: "PROD-003",
    name: "Gasolina Premium",
    unit: "L",
    currentStock: 2500,
    availableStock: 2200,
  },
]

interface InventoryMovementFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMovementCreated?: (movement: any) => void
}

export function InventoryMovementForm({ open, onOpenChange, onMovementCreated }: InventoryMovementFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: "",
      type: "entrada",
      quantity: 0,
      unitCost: 0,
      reason: "",
      reference: "",
      notes: "",
    },
  })

  const watchedType = form.watch("type")
  const watchedQuantity = form.watch("quantity")

  // Actualizar producto seleccionado
  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    setSelectedProduct(product)
  }

  // Calcular nuevo stock
  const calculateNewStock = () => {
    if (!selectedProduct || !watchedQuantity) return selectedProduct?.currentStock || 0

    const currentStock = selectedProduct.currentStock
    const quantity = Number(watchedQuantity)

    switch (watchedType) {
      case "entrada":
        return currentStock + quantity
      case "salida":
        return currentStock - quantity
      case "ajuste":
        return quantity // En ajuste, la cantidad es el nuevo stock total
      default:
        return currentStock
    }
  }

  // Validar disponibilidad para salidas
  const validateAvailability = () => {
    if (!selectedProduct || watchedType !== "salida") return true
    return Number(watchedQuantity) <= selectedProduct.availableStock
  }

  async function onSubmit(data: FormValues) {
    if (!selectedProduct) return

    // Validar disponibilidad para salidas
    if (data.type === "salida" && data.quantity > selectedProduct.availableStock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${selectedProduct.availableStock} ${selectedProduct.unit} disponibles`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const newStock = calculateNewStock()
      const totalCost = data.unitCost ? data.quantity * data.unitCost : 0

      const newMovement = {
        id: `movement-${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        productName: selectedProduct.name,
        productCode: selectedProduct.code,
        unit: selectedProduct.unit,
        previousStock: selectedProduct.currentStock,
        newStock,
        totalCost,
        userId: "current-user-id",
        userName: "Usuario Actual",
        timestamp: new Date().toISOString(),
      }

      // En una implementación real, aquí haríamos el fetch a la API
      // const response = await fetch("/api/inventory-movements", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(data),
      // })
      // const newMovement = await response.json()

      toast({
        title: "Movimiento registrado",
        description: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} de ${data.quantity} ${
          selectedProduct.unit
        } registrada exitosamente.`,
      })

      if (onMovementCreated) {
        onMovementCreated(newMovement)
      }

      form.reset()
      setSelectedProduct(null)
      onOpenChange(false)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Error al registrar el movimiento",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "entrada":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "salida":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <ArrowUpDown className="h-4 w-4 text-blue-600" />
    }
  }

  const getMovementColor = (type: string) => {
    switch (type) {
      case "entrada":
        return "bg-green-100 text-green-800"
      case "salida":
        return "bg-red-100 text-red-800"
      case "ajuste":
        return "bg-blue-100 text-blue-800"
      case "transferencia":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Movimiento de Inventario</DialogTitle>
          <DialogDescription>Registre entradas, salidas o ajustes de inventario</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Selección de producto */}
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Producto</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        handleProductChange(value)
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar producto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-[#0A2463]" />
                              <span>
                                {product.code} - {product.name}
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

              {/* Tipo de movimiento */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Movimiento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="entrada">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            Entrada
                          </div>
                        </SelectItem>
                        <SelectItem value="salida">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-red-600" />
                            Salida
                          </div>
                        </SelectItem>
                        <SelectItem value="ajuste">
                          <div className="flex items-center gap-2">
                            <ArrowUpDown className="h-4 w-4 text-blue-600" />
                            Ajuste
                          </div>
                        </SelectItem>
                        <SelectItem value="transferencia">
                          <div className="flex items-center gap-2">
                            <ArrowUpDown className="h-4 w-4 text-purple-600" />
                            Transferencia
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Información del producto seleccionado */}
            {selectedProduct && (
              <Card className="bg-[#F2E9DC]/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Información del Producto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Stock Actual:</span>
                      <p>
                        {selectedProduct.currentStock} {selectedProduct.unit}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Disponible:</span>
                      <p>
                        {selectedProduct.availableStock} {selectedProduct.unit}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cantidad */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad {selectedProduct && `(${selectedProduct.unit})`}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        {...field}
                        className={!validateAvailability() ? "border-red-500 focus:border-red-500" : ""}
                      />
                    </FormControl>
                    {watchedType === "ajuste" && (
                      <FormDescription>Para ajustes, ingrese el stock total final</FormDescription>
                    )}
                    {!validateAvailability() && (
                      <p className="text-sm text-red-600">
                        Stock insuficiente. Disponible: {selectedProduct?.availableStock} {selectedProduct?.unit}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Costo unitario */}
              <FormField
                control={form.control}
                name="unitCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo Unitario (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormDescription>Costo por unidad en bolivianos</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Razón del movimiento */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón del Movimiento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar razón" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {watchedType === "entrada" && (
                        <>
                          <SelectItem value="compra">Compra</SelectItem>
                          <SelectItem value="devolucion">Devolución</SelectItem>
                          <SelectItem value="produccion">Producción</SelectItem>
                          <SelectItem value="transferencia_entrada">Transferencia (Entrada)</SelectItem>
                        </>
                      )}
                      {watchedType === "salida" && (
                        <>
                          <SelectItem value="venta">Venta</SelectItem>
                          <SelectItem value="carga_vehiculo">Carga a Vehículo</SelectItem>
                          <SelectItem value="consumo_interno">Consumo Interno</SelectItem>
                          <SelectItem value="transferencia_salida">Transferencia (Salida)</SelectItem>
                          <SelectItem value="merma">Merma</SelectItem>
                        </>
                      )}
                      {watchedType === "ajuste" && (
                        <>
                          <SelectItem value="inventario_fisico">Inventario Físico</SelectItem>
                          <SelectItem value="correccion_error">Corrección de Error</SelectItem>
                          <SelectItem value="ajuste_sistema">Ajuste de Sistema</SelectItem>
                        </>
                      )}
                      {watchedType === "transferencia" && (
                        <>
                          <SelectItem value="cambio_ubicacion">Cambio de Ubicación</SelectItem>
                          <SelectItem value="transferencia_almacen">Transferencia entre Almacenes</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Referencia */}
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referencia</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: FAC-001, ORDEN-123" {...field} />
                    </FormControl>
                    <FormDescription>Número de factura, orden, etc.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nuevo stock calculado */}
              {selectedProduct && watchedQuantity > 0 && (
                <div className="flex flex-col justify-end">
                  <div className="p-3 bg-[#F2E9DC]/30 rounded-md">
                    <div className="flex items-center gap-2">
                      {getMovementIcon(watchedType)}
                      <span className="text-sm font-medium">Nuevo Stock:</span>
                    </div>
                    <p className="text-lg font-bold">
                      {calculateNewStock()} {selectedProduct.unit}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Notas */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observaciones, detalles adicionales..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#0A2463] hover:bg-[#0A2463]/90"
                disabled={isSubmitting || !validateAvailability()}
              >
                {isSubmitting ? "Registrando..." : "Registrar Movimiento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
