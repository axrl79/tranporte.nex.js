"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { Send, Bot, User, Truck, Route, Wrench, Package, Loader2, Download, FileText } from "lucide-react"
import { saveAs } from 'file-saver'

interface AIAssistantProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  actions?: Array<{
    type: string
    label: string
    data: any
  }>
}

interface Report {
  type: string
  format: string
  data: string
  filename: string
}

export function AIAssistant({ open, onOpenChange }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente virtual para la gestión de flota. Puedo ayudarte con:\n\n• 🚛 Gestión de vehículos y viajes\n• 🛣️ Optimización de rutas\n• 📦 Control de cargas\n• 🔧 Programación de mantenimientos\n• 📊 Generación de reportes en PDF\n\n¿En qué puedo ayudarte hoy?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [availableReports, setAvailableReports] = useState<Report[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickActions = [
    { icon: Truck, label: "Estado de vehículos", query: "¿Cuál es el estado actual de todos los vehículos?" },
    { icon: Route, label: "Rutas disponibles", query: "Muéstrame las rutas activas disponibles" },
    { icon: Wrench, label: "Mantenimientos pendientes", query: "¿Qué mantenimientos están programados?" },
    { icon: Package, label: "Cargas en tránsito", query: "¿Cuáles son las cargas que están en tránsito?" },
    { icon: FileText, label: "Reporte de flota", query: "Genera un reporte PDF de los vehículos" },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setAvailableReports([])

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          context: "fleet-management",
        }),
      })

      if (!response.ok) {
        throw new Error("Error al comunicarse con el asistente")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        actions: data.actions || [],
      }

      setMessages((prev) => [...prev, assistantMessage])
      
      if (data.reports && data.reports.length > 0) {
        setAvailableReports(data.reports)
      }
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, hubo un error al procesar tu consulta. Por favor intenta nuevamente.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (query: string) => {
    handleSendMessage(query)
  }

  const handleActionClick = async (action: any) => {
    try {
      switch (action.type) {
        case "schedule_maintenance":
          toast({
            title: "Acción ejecutada",
            description: "Abriendo formulario de mantenimiento...",
          })
          break
        case "create_route":
          toast({
            title: "Acción ejecutada",
            description: "Abriendo formulario de ruta...",
          })
          break
        case "view_details":
          toast({
            title: "Acción ejecutada",
            description: `Mostrando detalles de ${action.data.type}...`,
          })
          break
        case "generate_report":
          handleSendMessage(action.label)
          break
        default:
          console.log("Acción no reconocida:", action)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al ejecutar la acción",
        variant: "destructive",
      })
    }
  }

  const downloadReport = (report: Report) => {
    try {
      // Convertir base64 a Blob
      const byteCharacters = atob(report.data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })
      
      // Usar file-saver para la descarga
      saveAs(blob, report.filename)
      
      toast({
        title: "Descarga iniciada",
        description: `El reporte ${report.type} se está descargando`,
      })
    } catch (error) {
      console.error('Error al descargar el reporte:', error)
      toast({
        title: "Error",
        description: "No se pudo descargar el reporte",
        variant: "destructive",
      })
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Asistente Virtual IA
          </DialogTitle>
          <DialogDescription>Tu asistente inteligente para la gestión de flota</DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 px-6">
          {/* Acciones rápidas */}
          <div className="py-4 border-b">
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.query)}
                  className="justify-start"
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Reportes disponibles */}
          {availableReports.length > 0 && (
            <div className="py-3 border-b bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Reportes disponibles</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableReports.map((report, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => downloadReport(report)}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    {report.filename.replace('.pdf', '')}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          <div className="flex-1 min-h-0 py-4">
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === "assistant" && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        {message.role === "user" && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="whitespace-pre-wrap text-sm break-words">{message.content}</div>
                          <div className="text-xs opacity-70 mt-1">{formatTime(message.timestamp)}</div>
                        </div>
                      </div>

                      {/* Acciones sugeridas */}
                      {message.actions && message.actions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.actions.map((action, index) => (
                            <Button
                              key={index}
                              variant="secondary"
                              size="sm"
                              onClick={() => handleActionClick(action)}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Pensando...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Input area */}
          <div className="py-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu consulta aquí..."
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(input)
                  }
                }}
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={() => handleSendMessage(input)} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}