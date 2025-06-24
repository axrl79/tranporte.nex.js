import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

// Tipos de intención que puede detectar
enum IntentType {
  VEHICLE_STATUS = "vehicle_status",
  TRIP_MANAGEMENT = "trip_management", 
  MAINTENANCE = "maintenance",
  ROUTES = "routes",
  LOADS = "loads",
  GENERAL_HELP = "general_help",
  REPORT_GENERATION = "report_generation",
  UNKNOWN = "unknown"
}

// Patrones para detectar intenciones
const INTENT_PATTERNS = {
  [IntentType.VEHICLE_STATUS]: [
    /\b(vehículos?|estado|camiones?|flota)\b/i,
    /\b(disponibles?|ocupados?|en ruta)\b/i,
    /\b(placa|matrícula)\b/i
  ],
  [IntentType.TRIP_MANAGEMENT]: [
    /\b(viajes?|trayectos?|envío|envíos)\b/i,
    /\b(programar|planificar|crear viaje)\b/i,
    /\b(en curso|completados?|pendientes?)\b/i
  ],
  [IntentType.MAINTENANCE]: [
    /\b(mantenimiento|reparación|revisión)\b/i,
    /\b(programar|agendar|pendiente)\b/i,
    /\b(mecánico|taller|servicio)\b/i
  ],
  [IntentType.ROUTES]: [
    /\b(rutas?|caminos?|trayectorias?)\b/i,
    /\b(origen|destino|distancia)\b/i,
    /\b(optimizar|mejor ruta)\b/i
  ],
  [IntentType.LOADS]: [
    /\b(cargas?|mercancía|productos?)\b/i,
    /\b(tránsito|entregado|pendiente)\b/i,
    /\b(peso|volumen|contenido)\b/i
  ],
  [IntentType.REPORT_GENERATION]: [
    /\b(reporte|informe|exportar|descargar)\b/i,
    /\b(pdf|excel|csv|documento)\b/i,
    /\b(generar|crear|sacar)\b/i
  ]
}

// Clase principal del asistente personalizado
class CustomFleetAssistant {
  private vehicles: any[] = []
  private trips: any[] = []
  private maintenances: any[] = []
  private routes: any[] = []
  private loads: any[] = []

  constructor(data: {
    vehicles: any[]
    trips: any[]
    maintenances: any[]
    routes: any[]
    loads: any[]
  }) {
    this.vehicles = data.vehicles
    this.trips = data.trips
    this.maintenances = data.maintenances
    this.routes = data.routes
    this.loads = data.loads
  }

  // Detectar la intención del usuario
  detectIntent(message: string): IntentType {
    const lowerMessage = message.toLowerCase()
    
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(lowerMessage)) {
          return intent as IntentType
        }
      }
    }
    
    return IntentType.UNKNOWN
  }

  // Generar respuesta basada en la intención
  async generateResponse(message: string): Promise<{ response: string; actions: any[]; reports?: any[] }> {
    const intent = this.detectIntent(message)
    
    switch (intent) {
      case IntentType.VEHICLE_STATUS:
        return this.handleVehicleStatus(message)
      case IntentType.TRIP_MANAGEMENT:
        return this.handleTripManagement(message)
      case IntentType.MAINTENANCE:
        return this.handleMaintenance(message)
      case IntentType.ROUTES:
        return this.handleRoutes(message)
      case IntentType.LOADS:
        return this.handleLoads(message)
      case IntentType.REPORT_GENERATION:
        return this.handleReportGeneration(message)
      case IntentType.GENERAL_HELP:
        return this.handleGeneralHelp()
      default:
        return this.handleUnknown(message)
    }
  }

  private async generatePdfReport(title: string, content: string, data: any[]): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([600, 800])
    const { width, height } = page.getSize()
    
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    
    // Title
    page.drawText(title, {
      x: 50,
      y: height - 50,
      size: 20,
      font,
      color: rgb(0, 0, 0.5),
    })
    
    // Content
    page.drawText(content, {
      x: 50,
      y: height - 80,
      size: 12,
      font: regularFont,
      color: rgb(0, 0, 0),
    })
    
    // Data table
    let yPosition = height - 120
    if (data.length > 0) {
      const headers = Object.keys(data[0])
      
      // Draw headers
      let xPosition = 50
      headers.forEach(header => {
        page.drawText(header, {
          x: xPosition,
          y: yPosition,
          size: 12,
          font,
          color: rgb(0, 0, 0),
        })
        xPosition += 120
      })
      
      yPosition -= 20
      
      // Draw data rows
      data.slice(0, 15).forEach(item => {
        xPosition = 50
        headers.forEach(header => {
          page.drawText(String(item[header] || ''), {
            x: xPosition,
            y: yPosition,
            size: 10,
            font: regularFont,
            color: rgb(0, 0, 0),
          })
          xPosition += 120
        })
        yPosition -= 15
      })
    }
    
    // Footer
    page.drawText(`Generado el: ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: 30,
      size: 10,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    })
    
    const pdfBytes = await pdfDoc.save()
    return Buffer.from(pdfBytes)
  }

  private async handleReportGeneration(message: string): Promise<{ response: string; actions: any[]; reports?: any[] }> {
    const lowerMessage = message.toLowerCase()
    let response = "📊 **Opciones de generación de reportes:**\n\n"
    const reports = []
    
    // Check what type of report is being requested
    const vehicleReportRequested = lowerMessage.includes('vehículo') || lowerMessage.includes('flota')
    const tripReportRequested = lowerMessage.includes('viaje') || lowerMessage.includes('trayecto')
    const maintenanceReportRequested = lowerMessage.includes('mantenimiento')
    const loadReportRequested = lowerMessage.includes('carga') || lowerMessage.includes('mercancía')
    
    if (vehicleReportRequested) {
      response += "• 🚗 **Reporte de vehículos**: Estado actual de la flota\n"
      const pdfBuffer = await this.generatePdfReport(
        'Reporte de Estado de Flota',
        `Resumen de vehículos al ${new Date().toLocaleDateString()}`,
        this.vehicles.map(v => ({
          'Placa': v.plateNumber,
          'Marca': v.brand,
          'Modelo': v.model,
          'Estado': v.status,
          'Última revisión': v.lastMaintenanceDate
        }))
      )
      reports.push({
        type: 'vehicle_report',
        format: 'pdf',
        data: pdfBuffer.toString('base64'),
        filename: `reporte_vehiculos_${new Date().toISOString().slice(0, 10)}.pdf`
      })
    }
    
    if (tripReportRequested) {
      response += "• 🚛 **Reporte de viajes**: Viajes activos y completados\n"
      const pdfBuffer = await this.generatePdfReport(
        'Reporte de Viajes',
        `Resumen de viajes al ${new Date().toLocaleDateString()}`,
        this.trips.map(t => ({
          'ID': t.id,
          'Vehículo': t.vehicle?.plateNumber || 'N/A',
          'Ruta': t.route?.name || 'N/A',
          'Estado': t.status,
          'Inicio': t.startDate,
          'Fin': t.endDate || 'En curso'
        }))
      )
      reports.push({
        type: 'trip_report',
        format: 'pdf',
        data: pdfBuffer.toString('base64'),
        filename: `reporte_viajes_${new Date().toISOString().slice(0, 10)}.pdf`
      })
    }
    
    if (maintenanceReportRequested) {
      response += "• 🔧 **Reporte de mantenimientos**: Programados y completados\n"
      const pdfBuffer = await this.generatePdfReport(
        'Reporte de Mantenimientos',
        `Resumen de mantenimientos al ${new Date().toLocaleDateString()}`,
        this.maintenances.map(m => ({
          'ID': m.id,
          'Vehículo': m.vehicle?.plateNumber || 'N/A',
          'Tipo': m.type,
          'Estado': m.status,
          'Fecha': m.scheduledDate,
          'Descripción': m.description
        }))
      )
      reports.push({
        type: 'maintenance_report',
        format: 'pdf',
        data: pdfBuffer.toString('base64'),
        filename: `reporte_mantenimientos_${new Date().toISOString().slice(0, 10)}.pdf`
      })
    }
    
    if (loadReportRequested) {
      response += "• 📦 **Reporte de cargas**: Estado y seguimiento\n"
      const pdfBuffer = await this.generatePdfReport(
        'Reporte de Cargas',
        `Resumen de cargas al ${new Date().toLocaleDateString()}`,
        this.loads.map(l => ({
          'Código': l.code,
          'Estado': l.status,
          'Origen': l.origin,
          'Destino': l.destination,
          'Viaje': l.trip?.id || 'N/A',
          'Fecha estimada': l.estimatedDelivery
        }))
      )
      reports.push({
        type: 'load_report',
        format: 'pdf',
        data: pdfBuffer.toString('base64'),
        filename: `reporte_cargas_${new Date().toISOString().slice(0, 10)}.pdf`
      })
    }
    
    if (reports.length === 0) {
      response += "\nPor favor especifica qué tipo de reporte necesitas:\n"
      response += "- Reporte de vehículos\n"
      response += "- Reporte de viajes\n"
      response += "- Reporte de mantenimientos\n"
      response += "- Reporte de cargas\n"
    } else {
      response += "\nHe generado los reportes solicitados. Puedes descargarlos a continuación."
    }
    
    const actions = [
      {
        type: "generate_report",
        label: "Generar reporte completo",
        data: { type: "full_report" }
      }
    ]
    
    return { response, actions, reports }
  }

  private handleVehicleStatus(message: string): { response: string; actions: any[] } {
    const availableVehicles = this.vehicles.filter(v => v.status === 'disponible')
    const inRouteVehicles = this.vehicles.filter(v => v.status === 'en_ruta')
    const maintenanceVehicles = this.vehicles.filter(v => v.status === 'mantenimiento')

    let response = `📊 **Estado actual de la flota:**\n\n`
    response += `• ✅ **Disponibles:** ${availableVehicles.length} vehículos\n`
    response += `• 🚛 **En ruta:** ${inRouteVehicles.length} vehículos\n`
    response += `• 🔧 **En mantenimiento:** ${maintenanceVehicles.length} vehículos\n\n`

    if (availableVehicles.length > 0) {
      response += `**Vehículos disponibles:**\n`
      availableVehicles.slice(0, 5).forEach(v => {
        response += `• ${v.plateNumber} (${v.brand} ${v.model})\n`
      })
    }

    const actions = [
      {
        type: "view_details",
        label: "Ver detalles completos",
        data: { type: "vehicles" }
      },
      {
        type: "generate_report",
        label: "Descargar reporte PDF",
        data: { type: "vehicle_report" }
      }
    ]

    if (availableVehicles.length > 0) {
      actions.push({
        type: "schedule_trip",
        label: "Programar viaje",
        data: { type: "trip" }
      })
    }

    return { response, actions }
  }

  private handleTripManagement(message: string): { response: string; actions: any[] } {
    const activeTrips = this.trips.filter(t => t.status === 'en_curso')
    const pendingTrips = this.trips.filter(t => t.status === 'programado')
    const completedTrips = this.trips.filter(t => t.status === 'completado')

    let response = `🚛 **Gestión de viajes:**\n\n`
    response += `• 🟢 **En curso:** ${activeTrips.length} viajes\n`
    response += `• 🟡 **Programados:** ${pendingTrips.length} viajes\n`
    response += `• ✅ **Completados hoy:** ${completedTrips.length} viajes\n\n`

    if (activeTrips.length > 0) {
      response += `**Viajes activos:**\n`
      activeTrips.slice(0, 3).forEach(t => {
        response += `• ${t.vehicle?.plateNumber || 'N/A'} - ${t.route?.name || 'Ruta N/A'}\n`
      })
    }

    const actions = [
      {
        type: "schedule_trip",
        label: "Programar nuevo viaje",
        data: { type: "trip" }
      },
      {
        type: "view_details",
        label: "Ver todos los viajes",
        data: { type: "trips" }
      },
      {
        type: "generate_report",
        label: "Descargar reporte PDF",
        data: { type: "trip_report" }
      }
    ]

    return { response, actions }
  }

  private handleMaintenance(message: string): { response: string; actions: any[] } {
    const pendingMaintenance = this.maintenances.filter(m => m.status === 'programado')
    const inProgressMaintenance = this.maintenances.filter(m => m.status === 'en_proceso')

    let response = `🔧 **Estado de mantenimientos:**\n\n`
    response += `• ⏳ **Programados:** ${pendingMaintenance.length} mantenimientos\n`
    response += `• 🔄 **En proceso:** ${inProgressMaintenance.length} mantenimientos\n\n`

    if (pendingMaintenance.length > 0) {
      response += `**Próximos mantenimientos:**\n`
      pendingMaintenance.slice(0, 3).forEach(m => {
        response += `• ${m.vehicle?.plateNumber || 'N/A'} - ${m.type}\n`
      })
    }

    const actions = [
      {
        type: "schedule_maintenance",
        label: "Programar mantenimiento",
        data: { type: "maintenance" }
      },
      {
        type: "view_details",
        label: "Ver historial completo",
        data: { type: "maintenance" }
      },
      {
        type: "generate_report",
        label: "Descargar reporte PDF",
        data: { type: "maintenance_report" }
      }
    ]

    return { response, actions }
  }

  private handleRoutes(message: string): { response: string; actions: any[] } {
    let response = `🗺️ **Rutas disponibles:**\n\n`
    
    if (this.routes.length > 0) {
      this.routes.slice(0, 5).forEach(r => {
        response += `• **${r.name}**: ${r.originName} → ${r.destinationName}\n`
        response += `  📏 Distancia: ${r.distance}km\n\n`
      })
    } else {
      response += `No hay rutas registradas en el sistema.`
    }

    const actions = [
      {
        type: "create_route",
        label: "Crear nueva ruta",
        data: { type: "route" }
      },
      {
        type: "optimize_route",
        label: "Optimizar rutas",
        data: { type: "optimization" }
      },
      {
        type: "generate_report",
        label: "Descargar reporte PDF",
        data: { type: "route_report" }
      }
    ]

    return { response, actions }
  }

  private handleLoads(message: string): { response: string; actions: any[] } {
    const inTransitLoads = this.loads.filter(l => l.status === 'en_transito')
    const deliveredLoads = this.loads.filter(l => l.status === 'entregado')
    const pendingLoads = this.loads.filter(l => l.status === 'pendiente')

    let response = `📦 **Estado de cargas:**\n\n`
    response += `• 🚛 **En tránsito:** ${inTransitLoads.length} cargas\n`
    response += `• ✅ **Entregadas:** ${deliveredLoads.length} cargas\n`
    response += `• ⏳ **Pendientes:** ${pendingLoads.length} cargas\n\n`

    if (inTransitLoads.length > 0) {
      response += `**Cargas en tránsito:**\n`
      inTransitLoads.slice(0, 3).forEach(l => {
        response += `• ${l.code} - ${l.status}\n`
      })
    }

    const actions = [
      {
        type: "track_load",
        label: "Rastrear carga",
        data: { type: "tracking" }
      },
      {
        type: "view_details",
        label: "Ver todas las cargas",
        data: { type: "loads" }
      },
      {
        type: "generate_report",
        label: "Descargar reporte PDF",
        data: { type: "load_report" }
      }
    ]

    return { response, actions }
  }

  private handleGeneralHelp(): { response: string; actions: any[] } {
    const response = `¡Hola! 👋 Soy tu asistente de gestión de flota. Puedo ayudarte con:

🚛 **Vehículos**: Estado, disponibilidad, información general
🗺️ **Rutas**: Consultar, crear y optimizar rutas
📦 **Cargas**: Seguimiento y estado de mercancías
🔧 **Mantenimiento**: Programar y consultar servicios
📊 **Viajes**: Gestionar y programar trayectos
📄 **Reportes**: Generar PDFs con información detallada

**Ejemplos de preguntas:**
• "¿Cuántos vehículos están disponibles?"
• "¿Qué mantenimientos están programados?"
• "Muéstrame las rutas activas"
• "¿Cuáles cargas están en tránsito?"
• "Genera un reporte PDF de viajes"

¿En qué puedo ayudarte específicamente?`

    return { 
      response, 
      actions: [
        {
          type: "quick_help",
          label: "Guía rápida",
          data: { type: "help" }
        }
      ] 
    }
  }

  private handleUnknown(message: string): { response: string; actions: any[] } {
    const response = `🤔 No estoy seguro de cómo ayudarte con esa consulta específica.

Puedo ayudarte con:
• Estado de vehículos y flota
• Gestión de viajes y rutas
• Programación de mantenimientos
• Seguimiento de cargas
• Generación de reportes en PDF

¿Podrías reformular tu pregunta o elegir uno de estos temas?`

    return { 
      response, 
      actions: [
        {
          type: "general_help",
          label: "Ver opciones disponibles",
          data: { type: "help" }
        }
      ] 
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    // Obtener datos del sistema para contexto
    const [vehicles, trips, maintenances, routes, loads] = await Promise.all([
      db.query.vehicles.findMany({ limit: 10 }),
      db.query.trips.findMany({
        limit: 10,
        with: { vehicle: true, driver: true, route: true },
      }),
      db.query.maintenances.findMany({
        limit: 10,
        with: { vehicle: true },
      }),
      db.query.routes.findMany({ limit: 10 }),
      db.query.loads.findMany({
        limit: 10,
        with: { trip: true },
      }),
    ])

    // Crear instancia del asistente personalizado
    const assistant = new CustomFleetAssistant({
      vehicles,
      trips,
      maintenances,
      routes,
      loads
    })

    // Generar respuesta personalizada
    const result = await assistant.generateResponse(message)

    return NextResponse.json({
      response: result.response,
      actions: result.actions,
      reports: result.reports || [],
      timestamp: new Date().toISOString(),
      model: "custom-fleet-assistant-v2"
    })

  } catch (error) {
    console.error("Error in custom AI assistant:", error)
    return NextResponse.json(
      {
        error: "Error al procesar la consulta",
        response: "Lo siento, hubo un error al procesar tu consulta. Por favor intenta nuevamente.",
      },
      { status: 500 }
    )
  }
}