// app/api/employees/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { employees } from "@/db/schema"
import { createId } from "@paralleldrive/cuid2"
import { eq, desc, and, sql } from "drizzle-orm"

export const dynamic = 'force-dynamic' // Necesario si usas cookies o headers

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")

    // Consulta base y filtros
    const allowedTypes = ["conductor", "mecanico", "administrativo", "supervisor", "gerente"] as const
    const allowedStatuses = ["inactivo", "activo", "vacaciones", "licencia", "suspendido"] as const

    const whereClauses = []
    if (type && type !== "all" && allowedTypes.includes(type as any)) {
      whereClauses.push(eq(employees.type, type as typeof allowedTypes[number]))
    }
    if (status && status !== "all" && allowedStatuses.includes(status as any)) {
      whereClauses.push(eq(employees.status, status as typeof allowedStatuses[number]))
    }

    // Ordenar y ejecutar
    const result = await db
      .select()
      .from(employees)
      .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
      .orderBy(desc(employees.createdAt))
      .execute()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error al obtener empleados:", error)
    return NextResponse.json(
      { error: "Error al obtener los empleados" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.firstName || !body.lastName || !body.position || !body.type) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      )
    }

    // Verificar email si existe
    if (body.email) {
      const existing = await db
        .select()
        .from(employees)
        .where(eq(employees.email, body.email))
        .execute()

      if (existing.length > 0) {
        return NextResponse.json(
          { error: "Ya existe un empleado con este email" },
          { status: 409 }
        )
      }
    }

    // Generar código
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(employees)
      .execute()
    const employeeCode = `EMP-${String(countResult[0].count + 1).padStart(3, "0")}`

    // Crear empleado
    const newEmployee = {
      id: createId(),
      code: employeeCode,
      firstName: body.firstName,
      lastName: body.lastName,
      fullName: `${body.firstName} ${body.lastName}`,
      email: body.email || null,
      phone: body.phone || null,
      position: body.position,
      type: body.type,
      status: body.status || "activo",
      hireDate: body.hireDate ? new Date(body.hireDate) : new Date(), // Asegúrate de ajustar esto según tu lógica
      createdAt: new Date(),
      updatedAt: new Date(),
      // ...otros campos
    }

    await db.insert(employees).values(newEmployee).execute()

    return NextResponse.json(newEmployee, { status: 201 })
  } catch (error) {
    console.error("Error al crear empleado:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}