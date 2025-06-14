"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Bell, Shield, Database, Mail, Smartphone, Globe, Download, Upload, Trash2, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState({
    general: {
      companyName: "TransLogística S.A.",
      companyAddress: "Av. Principal 123, La Paz, Bolivia",
      companyPhone: "+591 2 1234567",
      companyEmail: "info@translogistica.com",
      timezone: "America/La_Paz",
      currency: "BOB",
      language: "es",
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      maintenanceAlerts: true,
      tripAlerts: true,
      inventoryAlerts: true,
      documentExpiry: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAttempts: 5,
      ipWhitelist: "",
    },
    system: {
      autoBackup: true,
      backupFrequency: "daily",
      dataRetention: 365,
      maintenanceMode: false,
      debugMode: false,
    },
    integrations: {
      gpsProvider: "none",
      paymentGateway: "none",
      emailProvider: "smtp",
      smsProvider: "none",
    },
  })

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }))
  }

  const saveSettings = async (category: string) => {
    try {
      // Simular guardado de configuración
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Configuración guardada",
        description: `La configuración de ${category} ha sido guardada exitosamente`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      })
    }
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = "configuracion-sistema.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Configuración exportada",
      description: "La configuración ha sido exportada exitosamente",
    })
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string)
        setSettings(importedSettings)
        toast({
          title: "Configuración importada",
          description: "La configuración ha sido importada exitosamente",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "El archivo de configuración no es válido",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const resetSettings = (category: string) => {
    if (!confirm("¿Está seguro de que desea restablecer esta configuración?")) return

    // Restablecer a valores por defecto
    const defaultSettings = {
      general: {
        companyName: "",
        companyAddress: "",
        companyPhone: "",
        companyEmail: "",
        timezone: "America/La_Paz",
        currency: "BOB",
        language: "es",
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        maintenanceAlerts: true,
        tripAlerts: true,
        inventoryAlerts: true,
        documentExpiry: true,
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordExpiry: 90,
        loginAttempts: 5,
        ipWhitelist: "",
      },
      system: {
        autoBackup: true,
        backupFrequency: "daily",
        dataRetention: 365,
        maintenanceMode: false,
        debugMode: false,
      },
      integrations: {
        gpsProvider: "none",
        paymentGateway: "none",
        emailProvider: "smtp",
        smsProvider: "none",
      },
    }

    setSettings((prev) => ({
      ...prev,
      [category]: defaultSettings[category as keyof typeof defaultSettings],
    }))

    toast({
      title: "Configuración restablecida",
      description: `La configuración de ${category} ha sido restablecida`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
          <p className="text-muted-foreground">Administra la configuración general del sistema</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportSettings}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" onClick={() => document.getElementById("import-settings")?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <input id="import-settings" type="file" accept=".json" onChange={importSettings} className="hidden" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración General
              </CardTitle>
              <CardDescription>Información básica de la empresa y configuración regional</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nombre de la Empresa</Label>
                  <Input
                    id="companyName"
                    value={settings.general.companyName}
                    onChange={(e) => handleSettingChange("general", "companyName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email de la Empresa</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={settings.general.companyEmail}
                    onChange={(e) => handleSettingChange("general", "companyEmail", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">Dirección</Label>
                <Textarea
                  id="companyAddress"
                  value={settings.general.companyAddress}
                  onChange={(e) => handleSettingChange("general", "companyAddress", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Teléfono</Label>
                  <Input
                    id="companyPhone"
                    value={settings.general.companyPhone}
                    onChange={(e) => handleSettingChange("general", "companyPhone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) => handleSettingChange("general", "timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/La_Paz">La Paz (GMT-4)</SelectItem>
                      <SelectItem value="America/Santa_Cruz">Santa Cruz (GMT-4)</SelectItem>
                      <SelectItem value="America/Lima">Lima (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Select
                    value={settings.general.currency}
                    onValueChange={(value) => handleSettingChange("general", "currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BOB">Boliviano (BOB)</SelectItem>
                      <SelectItem value="USD">Dólar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => resetSettings("general")}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Restablecer
                </Button>
                <Button onClick={() => saveSettings("general")}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configuración de Notificaciones
              </CardTitle>
              <CardDescription>Configura cómo y cuándo recibir notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Canales de Notificación</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <Label htmlFor="emailNotifications">Notificaciones por Email</Label>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange("notifications", "emailNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <Label htmlFor="smsNotifications">Notificaciones por SMS</Label>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={settings.notifications.smsNotifications}
                      onCheckedChange={(checked) => handleSettingChange("notifications", "smsNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4" />
                      <Label htmlFor="pushNotifications">Notificaciones Push</Label>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={settings.notifications.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange("notifications", "pushNotifications", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Tipos de Alertas</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenanceAlerts">Alertas de Mantenimiento</Label>
                    <Switch
                      id="maintenanceAlerts"
                      checked={settings.notifications.maintenanceAlerts}
                      onCheckedChange={(checked) => handleSettingChange("notifications", "maintenanceAlerts", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tripAlerts">Alertas de Viajes</Label>
                    <Switch
                      id="tripAlerts"
                      checked={settings.notifications.tripAlerts}
                      onCheckedChange={(checked) => handleSettingChange("notifications", "tripAlerts", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inventoryAlerts">Alertas de Inventario</Label>
                    <Switch
                      id="inventoryAlerts"
                      checked={settings.notifications.inventoryAlerts}
                      onCheckedChange={(checked) => handleSettingChange("notifications", "inventoryAlerts", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="documentExpiry">Vencimiento de Documentos</Label>
                    <Switch
                      id="documentExpiry"
                      checked={settings.notifications.documentExpiry}
                      onCheckedChange={(checked) => handleSettingChange("notifications", "documentExpiry", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => resetSettings("notifications")}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Restablecer
                </Button>
                <Button onClick={() => saveSettings("notifications")}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configuración de Seguridad
              </CardTitle>
              <CardDescription>Configura las políticas de seguridad del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactorAuth">Autenticación de Dos Factores</Label>
                    <p className="text-sm text-muted-foreground">Requiere verificación adicional al iniciar sesión</p>
                  </div>
                  <Switch
                    id="twoFactorAuth"
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) => handleSettingChange("security", "twoFactorAuth", checked)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleSettingChange("security", "sessionTimeout", Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiry">Expiración de Contraseña (días)</Label>
                    <Input
                      id="passwordExpiry"
                      type="number"
                      value={settings.security.passwordExpiry}
                      onChange={(e) => handleSettingChange("security", "passwordExpiry", Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginAttempts">Intentos de Login Máximos</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    value={settings.security.loginAttempts}
                    onChange={(e) => handleSettingChange("security", "loginAttempts", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ipWhitelist">Lista Blanca de IPs</Label>
                  <Textarea
                    id="ipWhitelist"
                    placeholder="192.168.1.1, 10.0.0.1"
                    value={settings.security.ipWhitelist}
                    onChange={(e) => handleSettingChange("security", "ipWhitelist", e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Separar múltiples IPs con comas. Dejar vacío para permitir todas las IPs.
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => resetSettings("security")}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Restablecer
                </Button>
                <Button onClick={() => saveSettings("security")}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configuración del Sistema
              </CardTitle>
              <CardDescription>Configuración técnica y de mantenimiento del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoBackup">Respaldo Automático</Label>
                    <p className="text-sm text-muted-foreground">Crear respaldos automáticos de la base de datos</p>
                  </div>
                  <Switch
                    id="autoBackup"
                    checked={settings.system.autoBackup}
                    onCheckedChange={(checked) => handleSettingChange("system", "autoBackup", checked)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Frecuencia de Respaldo</Label>
                    <Select
                      value={settings.system.backupFrequency}
                      onValueChange={(value) => handleSettingChange("system", "backupFrequency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Cada hora</SelectItem>
                        <SelectItem value="daily">Diario</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataRetention">Retención de Datos (días)</Label>
                    <Input
                      id="dataRetention"
                      type="number"
                      value={settings.system.dataRetention}
                      onChange={(e) => handleSettingChange("system", "dataRetention", Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenanceMode">Modo de Mantenimiento</Label>
                      <p className="text-sm text-muted-foreground">
                        Deshabilita el acceso al sistema para mantenimiento
                      </p>
                    </div>
                    <Switch
                      id="maintenanceMode"
                      checked={settings.system.maintenanceMode}
                      onCheckedChange={(checked) => handleSettingChange("system", "maintenanceMode", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="debugMode">Modo de Depuración</Label>
                      <p className="text-sm text-muted-foreground">Habilita logs detallados para desarrollo</p>
                    </div>
                    <Switch
                      id="debugMode"
                      checked={settings.system.debugMode}
                      onCheckedChange={(checked) => handleSettingChange("system", "debugMode", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => resetSettings("system")}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Restablecer
                </Button>
                <Button onClick={() => saveSettings("system")}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Integraciones Externas
              </CardTitle>
              <CardDescription>Configura las integraciones con servicios externos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gpsProvider">Proveedor GPS</Label>
                  <Select
                    value={settings.integrations.gpsProvider}
                    onValueChange={(value) => handleSettingChange("integrations", "gpsProvider", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguno</SelectItem>
                      <SelectItem value="google">Google Maps</SelectItem>
                      <SelectItem value="mapbox">Mapbox</SelectItem>
                      <SelectItem value="here">HERE Maps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentGateway">Pasarela de Pago</Label>
                  <Select
                    value={settings.integrations.paymentGateway}
                    onValueChange={(value) => handleSettingChange("integrations", "paymentGateway", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguno</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="mercadopago">MercadoPago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailProvider">Proveedor de Email</Label>
                  <Select
                    value={settings.integrations.emailProvider}
                    onValueChange={(value) => handleSettingChange("integrations", "emailProvider", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smtp">SMTP</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="ses">Amazon SES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smsProvider">Proveedor de SMS</Label>
                  <Select
                    value={settings.integrations.smsProvider}
                    onValueChange={(value) => handleSettingChange("integrations", "smsProvider", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguno</SelectItem>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="nexmo">Nexmo</SelectItem>
                      <SelectItem value="local">Proveedor Local</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => resetSettings("integrations")}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Restablecer
                </Button>
                <Button onClick={() => saveSettings("integrations")}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
