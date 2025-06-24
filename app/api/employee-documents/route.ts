import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { employeeDocuments, employees } from "@/db/schema"
import { createId } from "@paralleldrive/cuid2"
import { eq, and, SQL } from "drizzle-orm"

// Tipos para validación
type DocumentType = "otro" | "licencia" | "cedula" | "pasaporte" | "certificado" | "contrato"
const validDocumentTypes: DocumentType[] = ["otro", "licencia", "cedula", "pasaporte", "certificado", "contrato"]

interface DocumentInput {
  employeeId: string
  type: DocumentType
  name: string
  number?: string | null
  issueDate?: string | null
  expiryDate?: string | null
  issuingAuthority?: string | null
  fileUrl?: string | null
  verified?: boolean
  notes?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<DocumentInput>

    // Validación robusta de campos obligatorios
    if (!body.employeeId || !body.type || !body.name) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: employeeId, type o name" },
        { status: 400 }
      )
    }

    // Validación del tipo de documento
    if (!validDocumentTypes.includes(body.type)) {
      return NextResponse.json(
        { error: "Tipo de documento no válido" },
        { status: 400 }
      )
    }

    // Crear el documento con valores por defecto
    const now = new Date()
    const [newDocument] = await db
      .insert(employeeDocuments)
      .values({
        id: createId(),
        employeeId: body.employeeId,
        type: body.type,
        name: body.name,
        number: body.number ?? null,
        issueDate: body.issueDate ? new Date(body.issueDate) : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        issuingAuthority: body.issuingAuthority ?? null,
        fileUrl: body.fileUrl ?? null,
        verified: body.verified ?? false,
        notes: body.notes ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    return NextResponse.json(newDocument, { status: 201 })
  } catch (error) {
    console.error("Error al crear documento:", error)
    return NextResponse.json(
      { error: "Error interno al crear el documento" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId")
    const type = searchParams.get("type")
    const expiring = searchParams.get("expiring") === "true"

    // Inicializar condiciones WHERE
    const whereConditions: SQL[] = []

    if (employeeId) {
      whereConditions.push(eq(employeeDocuments.employeeId, employeeId))
    }
    
    if (type && validDocumentTypes.includes(type as DocumentType)) {
      whereConditions.push(eq(employeeDocuments.type, type as DocumentType))
    }

    // Construir consulta base
    const baseQuery = db
      .select({
        id: employeeDocuments.id,
        employeeId: employeeDocuments.employeeId,
        type: employeeDocuments.type,
        name: employeeDocuments.name,
        number: employeeDocuments.number,
        issueDate: employeeDocuments.issueDate,
        expiryDate: employeeDocuments.expiryDate,
        issuingAuthority: employeeDocuments.issuingAuthority,
        fileUrl: employeeDocuments.fileUrl,
        verified: employeeDocuments.verified,
        notes: employeeDocuments.notes,
        createdAt: employeeDocuments.createdAt,
        updatedAt: employeeDocuments.updatedAt,
        employee: {
          id: employees.id,
          code: employees.code,
          fullName: employees.fullName,
          firstName: employees.firstName,
          lastName: employees.lastName,
          email: employees.email,
          type: employees.type,
          position: employees.position,
        },
      })
      .from(employeeDocuments)
      .leftJoin(employees, eq(employeeDocuments.employeeId, employees.id))

    // Aplicar condiciones WHERE si existen
    const finalQuery = whereConditions.length > 0
      ? baseQuery.where(and(...whereConditions))
      : baseQuery

    // Ejecutar consulta
    const documents = await finalQuery

    // Filtrar documentos próximos a vencer si es necesario
    const filteredDocuments = expiring
      ? filterExpiringDocuments(documents)
      : documents

    return NextResponse.json(filteredDocuments)
  } catch (error) {
    console.error("Error al obtener documentos:", error)
    return NextResponse.json(
      { error: "Error interno al obtener los documentos" },
      { status: 500 }
    )
  }
}

// Función auxiliar para filtrar documentos próximos a vencer
function filterExpiringDocuments(documents: any[]) {
  const today = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(today.getDate() + 30)

  return documents.filter(doc => {
    if (!doc.expiryDate) return false
    const expiryDate = new Date(doc.expiryDate)
    return expiryDate >= today && expiryDate <= thirtyDaysFromNow
  })
}