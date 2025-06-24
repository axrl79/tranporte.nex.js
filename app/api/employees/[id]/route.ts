import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { employees } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const employeeId = params.id

    const employee = await db.query.employees.findFirst({
      where: (employees, { eq }) => eq(employees.id, employeeId),
      with: {
        documents: true,
        attendances: {
          orderBy: (attendances, { desc }) => [desc(attendances.timestamp)],
          limit: 10,
        },
      },
    })

    if (!employee) {
      return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error("Error al obtener empleado:", error)
    return NextResponse.json({ error: "Error al obtener el empleado" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const employeeId = params.id
    const body = await request.json()

    // Verificar si el empleado existe
    const existingEmployee = await db.query.employees.findFirst({
      where: (employees, { eq }) => eq(employees.id, employeeId),
    })

    if (!existingEmployee) {
      return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
    }

    // Preparar los datos para actualizar
    const updateData: any = {
      updatedAt: new Date(),
    }

    // Solo incluir los campos que se están actualizando
    if (body.firstName !== undefined) updateData.firstName = body.firstName
    if (body.lastName !== undefined) updateData.lastName = body.lastName
    if (body.firstName !== undefined || body.lastName !== undefined) {
      updateData.fullName = `${body.firstName || existingEmployee.firstName} ${body.lastName || existingEmployee.lastName}`
    }
    if (body.email !== undefined) updateData.email = body.email
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.address !== undefined) updateData.address = body.address
    if (body.city !== undefined) updateData.city = body.city
    if (body.birthDate !== undefined) updateData.birthDate = body.birthDate ? new Date(body.birthDate) : null
    if (body.hireDate !== undefined) updateData.hireDate = new Date(body.hireDate)
    if (body.terminationDate !== undefined)
      updateData.terminationDate = body.terminationDate ? new Date(body.terminationDate) : null
    if (body.type !== undefined) updateData.type = body.type
    if (body.status !== undefined) updateData.status = body.status
    if (body.position !== undefined) updateData.position = body.position
    if (body.department !== undefined) updateData.department = body.department
    if (body.salary !== undefined) updateData.salary = body.salary ? body.salary.toString() : null
    if (body.emergencyContact !== undefined) updateData.emergencyContact = body.emergencyContact
    if (body.emergencyPhone !== undefined) updateData.emergencyPhone = body.emergencyPhone
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.photo !== undefined) updateData.photo = body.photo
    if (body.active !== undefined) updateData.active = body.active

    // Actualizar el empleado
    const updatedEmployee = await db.update(employees).set(updateData).where(eq(employees.id, employeeId)).returning()

    return NextResponse.json(updatedEmployee[0])
  } catch (error) {
    console.error("Error al actualizar empleado:", error)
    return NextResponse.json({ error: "Error al actualizar el empleado" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const employeeId = params.id

    // Verificar si el empleado existe
    const existingEmployee = await db.query.employees.findFirst({
      where: (employees, { eq }) => eq(employees.id, employeeId),
    })

    if (!existingEmployee) {
      return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
    }

    // En lugar de eliminar, marcar como inactivo
    const updatedEmployee = await db
      .update(employees)
      .set({
        status: "inactivo",
        active: false,
        updatedAt: new Date(),
      })
      .where(eq(employees.id, employeeId))
      .returning()

    return NextResponse.json({ success: true, employee: updatedEmployee[0] })
  } catch (error) {
    console.error("Error al eliminar empleado:", error)
    return NextResponse.json({ error: "Error al eliminar el empleado" }, { status: 500 })
  }
}
