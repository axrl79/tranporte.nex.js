import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { vehicles } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicleId = params.id

    const vehicle = await db.query.vehicles.findFirst({
      where: (vehicles, { eq }) => eq(vehicles.id, vehicleId),
      with: {
        trips: {
          with: {
            route: true,
            driver: true,
          },
          orderBy: (trips, { desc }) => [desc(trips.createdAt)],
          limit: 10,
        },
        maintenances: {
          orderBy: (maintenances, { desc }) => [desc(maintenances.createdAt)],
          limit: 5,
        },
      },
    })

    if (!vehicle) {
      return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 })
    }

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error("Error al obtener vehículo:", error)
    return NextResponse.json({ error: "Error al obtener el vehículo" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicleId = params.id
    const body = await request.json()

    // Verificar si el vehículo existe
    const existingVehicle = await db.query.vehicles.findFirst({
      where: (vehicles, { eq }) => eq(vehicles.id, vehicleId),
    })

    if (!existingVehicle) {
      return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 })
    }

    // Preparar los datos para actualizar
    const updateData: any = {
      updatedAt: new Date(),
    }

    // Solo incluir los campos que se están actualizando
    if (body.plateNumber !== undefined) updateData.plateNumber = body.plateNumber
    if (body.type !== undefined) updateData.type = body.type
    if (body.brand !== undefined) updateData.brand = body.brand
    if (body.model !== undefined) updateData.model = body.model
    if (body.year !== undefined) updateData.year = body.year
    if (body.capacity !== undefined) updateData.capacity = body.capacity
    if (body.status !== undefined) updateData.status = body.status
    if (body.fuelType !== undefined) updateData.fuelType = body.fuelType
    if (body.fuelCapacity !== undefined) updateData.fuelCapacity = body.fuelCapacity
    if (body.currentFuelLevel !== undefined) updateData.currentFuelLevel = body.currentFuelLevel
    if (body.totalKm !== undefined) updateData.totalKm = body.totalKm
    if (body.active !== undefined) updateData.active = body.active

    // Actualizar el vehículo
    const updatedVehicle = await db.update(vehicles).set(updateData).where(eq(vehicles.id, vehicleId)).returning()

    return NextResponse.json(updatedVehicle[0])
  } catch (error) {
    console.error("Error al actualizar vehículo:", error)
    return NextResponse.json({ error: "Error al actualizar el vehículo" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicleId = params.id

    // Verificar si el vehículo existe
    const existingVehicle = await db.query.vehicles.findFirst({
      where: (vehicles, { eq }) => eq(vehicles.id, vehicleId),
    })

    if (!existingVehicle) {
      return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 })
    }

    // Verificar si el vehículo tiene viajes activos
    const activeTrips = await db.query.trips.findMany({
      where: (trips, { and, eq, or }) =>
        and(eq(trips.vehicleId, vehicleId), or(eq(trips.status, "programado"), eq(trips.status, "en_curso"))),
    })

    if (activeTrips.length > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un vehículo con viajes activos o programados" },
        { status: 400 },
      )
    }

    // Marcar como inactivo en lugar de eliminar
    await db.update(vehicles).set({ active: false, updatedAt: new Date() }).where(eq(vehicles.id, vehicleId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar vehículo:", error)
    return NextResponse.json({ error: "Error al eliminar el vehículo" }, { status: 500 })
  }
}
