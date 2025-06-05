"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { QrCode } from "lucide-react"

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

const formSchema = z.object({
  code: z.string().min(1, {
    message: "El código es obligatorio",
  }),
  name: z.string().min(1, {
    message: "El nombre es obligatorio",
  }),
  description: z.string().optional(),
  type: z.enum(["liquido", "solido", "fragil", "peligroso", "perecedero", "general"], {
    required_error: "Debe seleccionar un tipo",
  }),
  unit: z.string().min(1, {
    message: "La unidad es obligatoria",
  }),
  unitWeight: z.coerce.number().min(0).optional(),
  unitVolume: z.coerce.number().min(0).optional(),
  minStock: z.coerce.number().min(0, {
    message: "El stock mínimo no puede ser negativo",
  }),
  maxStock: z.coerce.number().min(1, {
    message: "El stock máximo debe ser mayor a 0",
  }),
  currentStock: z.coerce.number().min(0, {
    message: "El stock actual no puede ser negativo",
  }),
  location: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface NewProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductCreated?: (product: any) => void
}

export function NewProductForm({ open, onOpenChange, onProductCreated }: NewProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      type: "general",
      unit: "",
      unitWeight: 0,
      unitVolume: 0,
      minStock: 0,
      maxStock: 100,
      currentStock: 0,
      location: "",
    },
  })

  // Generar código automático
  const generateCode = () => {
    const prefix = "PROD"
    const timestamp = Date.now().toString().slice(-6)
    const code = `${prefix}-${timestamp}`
    form.setValue("code", code)
  }

  // Generar código QR automático
  const generateQRCode = () => {
    const code = form.getValues("code")
    if (code) {
      return `QR-${code}`
    }
    return ""
  }

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    try {
      // Calcular stock disponible
      const availableStock = data.currentStock
      const reservedStock = 0

      // Generar QR code
      const qrCode = generateQRCode()

      const newProduct = {
        id: `product-${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        availableStock,
        reservedStock,
        qrCode,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // En una implementación real, aquí haríamos el fetch a la API
      // const response = await fetch("/api/products", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(data),
      // })
      // const newProduct = await response.json()

      toast({
        title: "Producto creado",
        description: `El producto ${data.name} ha sido creado exitosamente.`,
      })

      if (onProductCreated) {
        onProductCreated(newProduct)
      }

      form.reset()
      setActiveTab("general")
      onOpenChange(false)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "Error al crear el producto",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Nuevo Producto</DialogTitle>
          <DialogDescription>Registre un nuevo producto en el inventario</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="specifications">Especificaciones</TabsTrigger>
                <TabsTrigger value="stock">Stock</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código del Producto</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input placeholder="PROD-001" {...field} />
                          </FormControl>
                          <Button type="button" variant="outline" size="sm" onClick={generateCode}>
                            Auto
                          </Button>
                        </div>
                        <FormDescription>Código único para identificar el producto</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Producto</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="liquido">Líquido</SelectItem>
                            <SelectItem value="solido">Sólido</SelectItem>
                            <SelectItem value="fragil">Frágil</SelectItem>
                            <SelectItem value="peligroso">Peligroso</SelectItem>
                            <SelectItem value="perecedero">Perecedero</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Producto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Aceite Motor 20W-50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción detallada del producto..."
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
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ubicación en Almacén</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: A-01-15" {...field} />
                      </FormControl>
                      <FormDescription>Pasillo-Estante-Posición</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="specifications" className="space-y-4">
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidad de Medida</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar unidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                          <SelectItem value="L">Litros (L)</SelectItem>
                          <SelectItem value="unidad">Unidad</SelectItem>
                          <SelectItem value="caja">Caja</SelectItem>
                          <SelectItem value="pallet">Pallet</SelectItem>
                          <SelectItem value="m3">Metro cúbico (m³)</SelectItem>
                          <SelectItem value="tonelada">Tonelada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="unitWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Peso por Unidad (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormDescription>Peso en kilogramos por unidad</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unitVolume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volumen por Unidad (m³)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.001" placeholder="0.000" {...field} />
                        </FormControl>
                        <FormDescription>Volumen en metros cúbicos por unidad</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="stock" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="currentStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Inicial</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0" {...field} />
                        </FormControl>
                        <FormDescription>Cantidad inicial en inventario</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Mínimo</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0" {...field} />
                        </FormControl>
                        <FormDescription>Nivel mínimo para alertas</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Máximo</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="100" {...field} />
                        </FormControl>
                        <FormDescription>Capacidad máxima de almacenamiento</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="p-4 bg-[#F2E9DC]/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode className="h-4 w-4 text-[#0A2463]" />
                    <span className="font-medium">Código QR</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Se generará automáticamente un código QR único para este producto que permitirá su identificación
                    rápida durante los procesos de carga y descarga.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#0A2463] hover:bg-[#0A2463]/90" disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Crear Producto"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
