import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { employeeDocuments } from "@/db/schema"
import { createId } from "@paralleldrive/cuid2"
import { and, eq, lte, gte, isNotNull } from "drizzle-orm"

// 1. Definición de tipos seguros
const documentTypes = [
  "otro",
  "licencia",
  "cedula",
  "pasaporte",
  "certificado",
  "contrato",
] as const

type DocumentType = typeof documentTypes[number]
type APIResponse<T> = { data?: T; error?: string }

function isDocumentType(type: string): type is DocumentType {
  return documentTypes.includes(type as DocumentType)
}

// 2. Configuración de CORS (si es necesario)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// 3. Handler principal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validación robusta
    if (!body.employeeId || !body.type || !body.name) {
      return NextResponse.json(
        { error: "Missing required fields: employeeId, type, name" },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!isDocumentType(body.type)) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400, headers: corsHeaders }
      )
    }

    // Formateo de fechas
    const issueDate = body.issueDate ? new Date(body.issueDate) : null
    const expiryDate = body.expiryDate ? new Date(body.expiryDate) : null

    // Validación de fechas
    if (issueDate && isNaN(issueDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid issueDate format" },
        { status: 400, headers: corsHeaders }
      )
    }

    if (expiryDate && isNaN(expiryDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid expiryDate format" },
        { status: 400, headers: corsHeaders }
      )
    }

    // Inserción en base de datos
    const [newDocument] = await db
      .insert(employeeDocuments)
      .values({
        id: createId(),
        employeeId: body.employeeId,
        type: body.type,
        name: body.name,
        number: body.number || null,
        issueDate,
        expiryDate,
        issuingAuthority: body.issuingAuthority || null,
        fileUrl: body.fileUrl || null,
        verified: Boolean(body.verified),
        notes: body.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return NextResponse.json(
      { data: newDocument },
      { status: 201, headers: corsHeaders }
    )

  } catch (error) {
    console.error("[DOCUMENTS_POST]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId")
    const type = searchParams.get("type")
    const expiring = searchParams.get("expiring") === "true"

    // Construcción de condiciones de consulta
    const conditions = []
    
    if (employeeId) {
      conditions.push(eq(employeeDocuments.employeeId, employeeId))
    }

    if (type && isDocumentType(type)) {
      conditions.push(eq(employeeDocuments.type, type))
    }

    // Filtro de documentos próximos a vencer
    if (expiring) {
      const today = new Date()
      const thirtyDaysLater = new Date()
      thirtyDaysLater.setDate(today.getDate() + 30)

      conditions.push(
        isNotNull(employeeDocuments.expiryDate),
        gte(employeeDocuments.expiryDate, today),
        lte(employeeDocuments.expiryDate, thirtyDaysLater)
      )
    }

    // Consulta base
    const baseQuery = db.select().from(employeeDocuments)
    const query =
      conditions.length > 0
        ? baseQuery.where(and(...conditions))
        : baseQuery

    // Ordenamiento y ejecución
    const documents = await query.orderBy(employeeDocuments.createdAt).execute()

    return NextResponse.json(
      { data: documents },
      { status: 200, headers: corsHeaders }
    )

  } catch (error) {
    console.error("[DOCUMENTS_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    )
  }
}

// Manejo de OPTIONS para CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}