import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { maintenances } from "@/db/schema"
import { createId } from "@paralleldrive/cuid2"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar los datos recibidos
    if (!body.vehicleId || !body.type || !body.description || !body.scheduledDate) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    // Crear el mantenimiento
    const newMaintenance = await db
      .insert(maintenances)
      .values({
        id: createId(),
        vehicleId: body.vehicleId,
        type: body.type,
        description: body.description,
        scheduledDate: new Date(body.scheduledDate),
        cost: body.cost || null,
        technicianId: body.technicianId || null,
        status: body.status || "programado",
        notes: body.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return NextResponse.json(newMaintenance[0], { status: 201 })
  } catch (error) {
    console.error("Error al crear mantenimiento:", error)
    return NextResponse.json({ error: "Error al crear el mantenimiento" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const vehicleId = searchParams.get("vehicleId")
    const type = searchParams.get("type")

    const allMaintenances = await db.query.maintenances.findMany({
      with: {
        vehicle: true,
        technician: true,
      },
      orderBy: (maintenances, { desc }) => [desc(maintenances.createdAt)],
    })

    // Aplicar filtros
    let filteredMaintenances = allMaintenances

    if (status) {
      filteredMaintenances = filteredMaintenances.filter((m) => m.status === status)
    }
    if (vehicleId) {
      filteredMaintenances = filteredMaintenances.filter((m) => m.vehicleId === vehicleId)
    }
    if (type) {
      filteredMaintenances = filteredMaintenances.filter((m) => m.type === type)
    }

    return NextResponse.json(filteredMaintenances)
  } catch (error) {
    console.error("Error al obtener mantenimientos:", error)
    return NextResponse.json({ error: "Error al obtener los mantenimientos" }, { status: 500 })
  }
}
