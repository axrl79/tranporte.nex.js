"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Shield, ShieldAlert, User } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Ingrese un correo electrónico válido.",
  }),
  password: z.string().optional(),
  role: z.enum(["admin", "operador", "conductor"], {
    required_error: "Por favor seleccione un rol.",
  }),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  active: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface EditUserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
  onUserUpdated?: (user: any) => void
}

export function EditUserForm({ open, onOpenChange, user, onUserUpdated }: EditUserFormProps) {
  const [activeTab, setActiveTab] = useState("general")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "operador",
      phone: "",
      address: "",
      notes: "",
      active: true,
    },
  })

  // Actualizar el formulario cuando cambia el usuario
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        phone: user.phone || "",
        address: user.address || "",
        notes: user.notes || "",
        active: user.active,
      })
    }
  }, [user, form])

  async function onSubmit(data: FormValues) {
    if (!user) return

    setIsSubmitting(true)
    try {
      // Si la contraseña está vacía, la eliminamos para no actualizarla
      const dataToSend = { ...data }
      if (!dataToSend.password) {
        delete dataToSend.password
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar el usuario")
      }

      const updatedUser = await response.json()

      toast({
        title: "Usuario actualizado",
        description: `${data.name} ha sido actualizado correctamente.`,
      })

      if (onUserUpdated) {
        onUserUpdated(updatedUser)
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar el usuario",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const roles = [
    { value: "admin", label: "Administrador", icon: ShieldAlert, description: "Acceso completo al sistema" },
    { value: "operador", label: "Operador", icon: Shield, description: "Monitoreo y gestión de flota" },
    { value: "conductor", label: "Conductor", icon: User, description: "Acceso a rutas y reportes" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Editar Usuario</DialogTitle>
          <DialogDescription>Modifique la información del usuario</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="role">Rol y Permisos</TabsTrigger>
                <TabsTrigger value="details">Detalles</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-[#F2E9DC]">
                    <AvatarFallback className="bg-[#0A2463] text-[#F2E9DC] text-xl">
                      {form.watch("name") ? form.watch("name").charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">Foto de Perfil</h3>
                    <p className="text-sm text-muted-foreground">Opcional: Suba una foto para el usuario</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Subir Imagen
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre del usuario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input placeholder="correo@ejemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña (opcional)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Dejar en blanco para mantener la actual" {...field} />
                      </FormControl>
                      <FormDescription>Solo complete este campo si desea cambiar la contraseña actual.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="role" className="space-y-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol del Usuario</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              <div className="flex items-center gap-2">
                                <role.icon className="h-4 w-4" />
                                <span>{role.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-[#F2E9DC]/30 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Descripción del Rol</h3>
                  {form.watch("role") ? (
                    <div className="flex items-start gap-3">
                      {roles.find((r) => r.value === form.watch("role"))?.icon && (
                        <div className="mt-0.5">
                          {(() => {
                            const RoleIcon = roles.find((r) => r.value === form.watch("role"))?.icon || User
                            return <RoleIcon className="h-5 w-5 text-[#0A2463]" />
                          })()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm">
                          {roles.find((r) => r.value === form.watch("role"))?.description ||
                            "Seleccione un rol para ver su descripción."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Seleccione un rol para ver su descripción.</p>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Estado de la Cuenta</FormLabel>
                        <FormDescription>
                          {field.value
                            ? "La cuenta está activa y el usuario puede acceder al sistema."
                            : "La cuenta está inactiva y el usuario no puede acceder al sistema."}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input placeholder="Dirección completa" {...field} />
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
                      <FormLabel>Notas Adicionales</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Información adicional sobre el usuario"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
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
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
