import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { employeeDocuments, employees } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const documentId = params.id

    const document = await db
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
      .where(eq(employeeDocuments.id, documentId))
      .limit(1)

    if (!document || document.length === 0) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 })
    }

    return NextResponse.json(document[0])
  } catch (error) {
    console.error("Error al obtener documento:", error)
    return NextResponse.json({ error: "Error al obtener el documento" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const documentId = params.id
    const body = await request.json()

    // Verificar que el documento existe
    const existingDocument = await db
      .select()
      .from(employeeDocuments)
      .where(eq(employeeDocuments.id, documentId))
      .limit(1)

    if (!existingDocument || existingDocument.length === 0) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 })
    }

    // Preparar datos para actualización
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (body.name !== undefined) updateData.name = body.name
    if (body.number !== undefined) updateData.number = body.number
    if (body.issueDate !== undefined) updateData.issueDate = body.issueDate ? new Date(body.issueDate) : null
    if (body.expiryDate !== undefined) updateData.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null
    if (body.issuingAuthority !== undefined) updateData.issuingAuthority = body.issuingAuthority
    if (body.fileUrl !== undefined) updateData.fileUrl = body.fileUrl
    if (body.verified !== undefined) updateData.verified = body.verified
    if (body.notes !== undefined) updateData.notes = body.notes

    // Actualizar el documento
    const updatedDocument = await db
      .update(employeeDocuments)
      .set(updateData)
      .where(eq(employeeDocuments.id, documentId))
      .returning()

    return NextResponse.json(updatedDocument[0])
  } catch (error) {
    console.error("Error al actualizar documento:", error)
    return NextResponse.json({ error: "Error al actualizar el documento" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const documentId = params.id

    // Verificar que el documento existe
    const existingDocument = await db
      .select()
      .from(employeeDocuments)
      .where(eq(employeeDocuments.id, documentId))
      .limit(1)

    if (!existingDocument || existingDocument.length === 0) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 })
    }

    // Eliminar el documento
    await db.delete(employeeDocuments).where(eq(employeeDocuments.id, documentId))

    return NextResponse.json({ message: "Documento eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar documento:", error)
    return NextResponse.json({ error: "Error al eliminar el documento" }, { status: 500 })
  }
}
