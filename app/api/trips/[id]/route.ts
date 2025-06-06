import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { trips } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tripId = params.id

    const trip = await db.query.trips.findFirst({
      where: (trips, { eq }) => eq(trips.id, tripId),
      with: {
        vehicle: true,
        driver: true,
        route: true,
        loads: true,
      },
    })

    if (!trip) {
      return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 })
    }

    return NextResponse.json(trip)
  } catch (error) {
    console.error("Error al obtener viaje:", error)
    return NextResponse.json({ error: "Error al obtener el viaje" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tripId = params.id
    const body = await request.json()

    // Verificar si el viaje existe
    const existingTrip = await db.query.trips.findFirst({
      where: (trips, { eq }) => eq(trips.id, tripId),
    })

    if (!existingTrip) {
      return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 })
    }

    // Preparar los datos para actualizar
    const updateData: any = {
      updatedAt: new Date(),
    }

    // Solo incluir los campos que se están actualizando
    if (body.status !== undefined) updateData.status = body.status
    if (body.actualStart !== undefined) updateData.actualStart = new Date(body.actualStart)
    if (body.actualEnd !== undefined) updateData.actualEnd = new Date(body.actualEnd)
    if (body.fuelConsumed !== undefined) updateData.fuelConsumed = body.fuelConsumed
    if (body.kmTraveled !== undefined) updateData.kmTraveled = body.kmTraveled
    if (body.notes !== undefined) updateData.notes = body.notes

    // Actualizar el viaje
    const updatedTrip = await db.update(trips).set(updateData).where(eq(trips.id, tripId)).returning()

    return NextResponse.json(updatedTrip[0])
  } catch (error) {
    console.error("Error al actualizar viaje:", error)
    return NextResponse.json({ error: "Error al actualizar el viaje" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tripId = params.id

    // Verificar si el viaje existe
    const existingTrip = await db.query.trips.findFirst({
      where: (trips, { eq }) => eq(trips.id, tripId),
    })

    if (!existingTrip) {
      return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 })
    }

    // Verificar si el viaje puede ser eliminado (solo si está en estado programado)
    if (existingTrip.status !== "programado") {
      return NextResponse.json({ error: "Solo se pueden eliminar viajes en estado programado" }, { status: 400 })
    }

    // Eliminar el viaje
    await db.delete(trips).where(eq(trips.id, tripId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar viaje:", error)
    return NextResponse.json({ error: "Error al eliminar el viaje" }, { status: 500 })
  }
}
