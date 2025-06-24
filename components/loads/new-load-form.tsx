"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Plus, Trash2, Package, Truck, MapPin, Loader2 } from "lucide-react"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Esquemas de validación
const formSchema = z.object({
  vehicleId: z.string().optional(),
  tripId: z.string().optional(),
  origin: z.string().min(1, {
    message: "El origen es obligatorio",
  }),
  destination: z.string().min(1, {
    message: "El destino es obligatorio",
  }),
  client: z.string().min(1, {
    message: "El cliente es obligatorio",
  }),
  notes: z.string().optional(),
})

const itemSchema = z.object({
  productId: z.string({
    required_error: "Debe seleccionar un producto",
  }),
  quantity: z.coerce.number().min(0.01, {
    message: "La cantidad debe ser mayor a 0",
  }),
  unitValue: z.coerce.number().min(0).optional(),
})

type FormValues = z.infer<typeof formSchema>
type ItemValues = z.infer<typeof itemSchema>

// Tipos para los datos de la API
type Vehicle = {
  id: string
  plateNumber: string
  type: string
  capacity: number
  status: 'disponible' | 'en_viaje' | 'mantenimiento'
}

type Trip = {
  id: string
  code: string
  route: string
  vehicleId: string
  status: 'programado' | 'en_curso' | 'completado'
}

type Product = {
  id: string
  code: string
  name: string
  unit: string
  availableStock: number
  unitWeight: number
  unitVolume: number
}

interface NewLoadFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoadCreated?: (load: any) => void
  availableVehicles?: Vehicle[]
}

export function NewLoadForm({ open, onOpenChange, onLoadCreated, availableVehicles = [] }: NewLoadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [items, setItems] = useState<(ItemValues & { id: string; product?: Product })[]>([])
  const [currentItem, setCurrentItem] = useState<ItemValues>({
    productId: "",
    quantity: 0,
    unitValue: 0,
  })
  const [trips, setTrips] = useState<Trip[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleId: "",
      tripId: "",
      origin: "Almacén Central",
      destination: "",
      client: "",
      notes: "",
    },
  })

  // Cargar datos iniciales de la API
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!open) return
      
      try {
        setIsLoadingData(true)
        
        // Cargar viajes programados
        const tripsResponse = await fetch("/api/trips?status=programado")
        if (!tripsResponse.ok) throw new Error("Error al cargar viajes")
        const tripsData = await tripsResponse.json()
        setTrips(tripsData)

        // Cargar productos disponibles
        const productsResponse = await fetch("/api/products?minStock=1")
        if (!productsResponse.ok) throw new Error("Error al cargar productos")
        const productsData = await productsResponse.json()
        setProducts(productsData)

      } catch (error) {
        console.error("Error loading initial data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos iniciales",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchInitialData()
  }, [open])

  // Generar código automático
  const generateCode = () => {
    const timestamp = Date.now().toString().slice(-6)
    return `CARGA-${timestamp}`
  }

  // Agregar item a la carga
  const addItem = () => {
    try {
      itemSchema.parse(currentItem)
      const product = products.find((p) => p.id === currentItem.productId)

      if (!product) {
        toast({
          title: "Error",
          description: "Producto no encontrado",
          variant: "destructive",
        })
        return
      }

      if (currentItem.quantity > product.availableStock) {
        toast({
          title: "Stock insuficiente",
          description: `Solo hay ${product.availableStock} ${product.unit} disponibles`,
          variant: "destructive",
        })
        return
      }

      const newItem = {
        ...currentItem,
        id: `item-${Math.random().toString(36).substr(2, 9)}`,
        product,
      }

      setItems([...items, newItem])
      setCurrentItem({
        productId: "",
        quantity: 0,
        unitValue: 0,
      })

      toast({
        title: "Item agregado",
        description: `${product.name} agregado a la carga`,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Error de validación",
          description: error.errors[0].message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Verifique los datos del item",
          variant: "destructive",
        })
      }
    }
  }

  // Remover item de la carga
  const removeItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId))
  }

  // Calcular totales
  const calculateTotals = () => {
    return items.reduce(
      (totals, item) => {
        const weight = (item.product?.unitWeight || 0) * item.quantity
        const volume = (item.product?.unitVolume || 0) * item.quantity
        const value = (item.unitValue || 0) * item.quantity

        return {
          totalWeight: totals.totalWeight + weight,
          totalVolume: totals.totalVolume + volume,
          totalValue: totals.totalValue + value,
        }
      },
      { totalWeight: 0, totalVolume: 0, totalValue: 0 },
    )
  }

  // Enviar formulario
  async function onSubmit(data: FormValues) {
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un item a la carga",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const totals = calculateTotals()
      const code = generateCode()

      const payload = {
        code,
        ...data,
        ...totals,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitValue: item.unitValue || 0,
        })),
        itemsCount: items.length,
        status: "pendiente",
      }

      const response = await fetch("/api/loads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(response.statusText)
      }

      const createdLoad = await response.json()

      toast({
        title: "Carga creada",
        description: `La carga ${code} ha sido creada exitosamente.`,
      })

      if (onLoadCreated) {
        onLoadCreated(createdLoad)
      }

      // Resetear formulario
      form.reset()
      setItems([])
      setActiveTab("general")
      onOpenChange(false)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Error al crear la carga. Por favor, intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const totals = calculateTotals()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Nueva Carga</DialogTitle>
          <DialogDescription>Crear una nueva carga de mercancía</DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#0A2463]" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="items">Items ({items.length})</TabsTrigger>
                  <TabsTrigger value="summary">Resumen</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="vehicleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehículo (Opcional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar vehículo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableVehicles.length > 0 ? (
                                availableVehicles.map((vehicle) => (
                                  <SelectItem key={vehicle.id} value={vehicle.id}>
                                    <div className="flex items-center gap-2">
                                      <Truck className="h-4 w-4 text-[#0A2463]" />
                                      <span>
                                        {vehicle.plateNumber} ({vehicle.type})
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-2 text-sm text-muted-foreground">
                                  No hay vehículos disponibles
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>Asignar vehículo para la carga</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tripId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Viaje (Opcional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar viaje" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {trips.length > 0 ? (
                                trips.map((trip) => (
                                  <SelectItem key={trip.id} value={trip.id}>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-[#0A2463]" />
                                      <span>
                                        {trip.code} - {trip.route}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-2 text-sm text-muted-foreground">
                                  No hay viajes programados
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>Asociar con un viaje programado</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="origin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origen</FormLabel>
                          <FormControl>
                            <Input placeholder="Almacén Central" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destino</FormLabel>
                          <FormControl>
                            <Input placeholder="Ciudad de destino" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="client"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del cliente o empresa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Instrucciones especiales, observaciones..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="items" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Agregar Item</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                          <label className="text-sm font-medium">Producto</label>
                          <Select
                            value={currentItem.productId}
                            onValueChange={(value) => setCurrentItem({ ...currentItem, productId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.length > 0 ? (
                                products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    <div className="flex items-center gap-2">
                                      <Package className="h-4 w-4 text-[#0A2463]" />
                                      <span>
                                        {product.code} - {product.name}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-2 text-sm text-muted-foreground">
                                  No hay productos disponibles
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Cantidad</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0"
                            value={currentItem.quantity}
                            onChange={(e) => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Valor Unitario</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={currentItem.unitValue}
                            onChange={(e) => setCurrentItem({ ...currentItem, unitValue: Number(e.target.value) })}
                          />
                        </div>

                        <Button 
                          type="button" 
                          onClick={addItem} 
                          size="sm"
                          disabled={!currentItem.productId || currentItem.quantity <= 0}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {items.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Items de la Carga</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Producto</TableHead>
                              <TableHead>Cantidad</TableHead>
                              <TableHead>Peso</TableHead>
                              <TableHead>Volumen</TableHead>
                              <TableHead>Valor</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.map((item) => {
                              const product = products.find(p => p.id === item.productId)
                              return (
                                <TableRow key={item.id}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{product?.name}</p>
                                      <p className="text-xs text-muted-foreground">{product?.code}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {item.quantity} {product?.unit}
                                  </TableCell>
                                  <TableCell>{((product?.unitWeight || 0) * item.quantity).toFixed(2)} kg</TableCell>
                                  <TableCell>{((product?.unitVolume || 0) * item.quantity).toFixed(3)} m³</TableCell>
                                  <TableCell>${((item.unitValue || 0) * item.quantity).toFixed(2)}</TableCell>
                                  <TableCell>
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => removeItem(item.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="summary" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-[#0A2463]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Peso Total</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totals.totalWeight.toFixed(2)} kg</div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-[#F9DC5C]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Volumen Total</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totals.totalVolume.toFixed(3)} m³</div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Valor Total</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${totals.totalValue.toFixed(2)}</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Resumen de la Carga</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Origen:</span>
                          <p>{form.getValues("origin") || "No especificado"}</p>
                        </div>
                        <div>
                          <span className="font-medium">Destino:</span>
                          <p>{form.getValues("destination") || "No especificado"}</p>
                        </div>
                        <div>
                          <span className="font-medium">Cliente:</span>
                          <p>{form.getValues("client") || "No especificado"}</p>
                        </div>
                        <div>
                          <span className="font-medium">Total Items:</span>
                          <p>{items.length}</p>
                        </div>
                        {form.getValues("vehicleId") && (
                          <div>
                            <span className="font-medium">Vehículo:</span>
                            <p>
                              {availableVehicles.find(v => v.id === form.getValues("vehicleId"))?.plateNumber || "No especificado"}
                            </p>
                          </div>
                        )}
                        {form.getValues("tripId") && (
                          <div>
                            <span className="font-medium">Viaje:</span>
                            <p>
                              {trips.find(t => t.id === form.getValues("tripId"))?.code || "No especificado"}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    form.reset()
                    setItems([])
                    setActiveTab("general")
                    onOpenChange(false)
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#0A2463] hover:bg-[#0A2463]/90" 
                  disabled={isSubmitting || items.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : "Crear Carga"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}