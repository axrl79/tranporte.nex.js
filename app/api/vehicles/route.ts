import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { vehicles } from "@/db/schema"
import { createId } from "@paralleldrive/cuid2"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar los datos recibidos
    if (!body.plateNumber || !body.type || !body.brand || !body.model || !body.year) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    // Verificar si la placa ya existe
    const existingVehicle = await db.query.vehicles.findFirst({
      where: (vehicles, { eq }) => eq(vehicles.plateNumber, body.plateNumber),
    })

    if (existingVehicle) {
      return NextResponse.json({ error: "La placa ya está registrada" }, { status: 409 })
    }

    // Crear el vehículo
    const newVehicle = await db
      .insert(vehicles)
      .values({
        id: createId(),
        plateNumber: body.plateNumber,
        type: body.type,
        brand: body.brand,
        model: body.model,
        year: body.year,
        capacity: body.capacity,
        status: body.status || "disponible",
        fuelType: body.fuelType,
        fuelCapacity: body.fuelCapacity,
        currentFuelLevel: body.currentFuelLevel || 0,
        totalKm: body.totalKm || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        active: body.active !== undefined ? body.active : true,
      })
      .returning()

    return NextResponse.json(newVehicle[0], { status: 201 })
  } catch (error) {
    console.error("Error al crear vehículo:", error)
    return NextResponse.json({ error: "Error al crear el vehículo" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const type = searchParams.get("type")

    const query = db.query.vehicles

    // Aplicar filtros si existen
    if (status || type) {
      const allVehicles = await db.query.vehicles.findMany()

      return NextResponse.json(
        allVehicles.filter((vehicle) => (!status || vehicle.status === status) && (!type || vehicle.type === type)),
      )
    } else {
      const allVehicles = await query.findMany({
        orderBy: (vehicles, { desc }) => [desc(vehicles.createdAt)],
      })

      return NextResponse.json(allVehicles)
    }
  } catch (error) {
    console.error("Error al obtener vehículos:", error)
    return NextResponse.json({ error: "Error al obtener los vehículos" }, { status: 500 })
  }
}
