import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { trips, vehicles, users, routes } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tripId = params.id

    const trip = await db
      .select({
        id: trips.id,
        vehicleId: trips.vehicleId,
        driverId: trips.driverId,
        routeId: trips.routeId,
        scheduledStart: trips.scheduledStart,
        scheduledEnd: trips.scheduledEnd,
        actualStart: trips.actualStart,
        actualEnd: trips.actualEnd,
        status: trips.status,
        cargo: trips.cargo,
        cargoWeight: trips.cargoWeight,
        notes: trips.notes,
        fuelConsumed: trips.fuelConsumed,
        kmTraveled: trips.kmTraveled,
        createdAt: trips.createdAt,
        updatedAt: trips.updatedAt,
        vehicle: {
          id: vehicles.id,
          plateNumber: vehicles.plateNumber,
          type: vehicles.type,
          status: vehicles.status,
        },
        driver: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        route: {
          id: routes.id,
          name: routes.name,
          originName: routes.originName,
          destinationName: routes.destinationName,
          distance: routes.distance,
        },
      })
      .from(trips)
      .leftJoin(vehicles, eq(trips.vehicleId, vehicles.id))
      .leftJoin(users, eq(trips.driverId, users.id))
      .leftJoin(routes, eq(trips.routeId, routes.id))
      .where(eq(trips.id, tripId))
      .limit(1)

    if (trip.length === 0) {
      return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 })
    }

    return NextResponse.json(trip[0])
  } catch (error) {
    console.error("Error al obtener viaje:", error)
    return NextResponse.json({ error: "Error al obtener el viaje" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tripId = params.id
    const body = await request.json()

    // Actualizar campos permitidos
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (body.status) updateData.status = body.status
    if (body.actualStart) updateData.actualStart = new Date(body.actualStart)
    if (body.actualEnd) updateData.actualEnd = new Date(body.actualEnd)
    if (body.fuelConsumed) updateData.fuelConsumed = body.fuelConsumed.toString()
    if (body.kmTraveled) updateData.kmTraveled = body.kmTraveled.toString()
    if (body.notes !== undefined) updateData.notes = body.notes

    const updatedTrip = await db.update(trips).set(updateData).where(eq(trips.id, tripId)).returning()

    if (updatedTrip.length === 0) {
      return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 })
    }

    return NextResponse.json(updatedTrip[0])
  } catch (error) {
    console.error("Error al actualizar viaje:", error)
    return NextResponse.json({ error: "Error al actualizar el viaje" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tripId = params.id

    const deletedTrip = await db.delete(trips).where(eq(trips.id, tripId)).returning()

    if (deletedTrip.length === 0) {
      return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ message: "Viaje eliminado exitosamente" })
  } catch (error) {
    console.error("Error al eliminar viaje:", error)
    return NextResponse.json({ error: "Error al eliminar el viaje" }, { status: 500 })
  }
}
