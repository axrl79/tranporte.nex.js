import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { trips } from "@/db/schema"
import { createId } from "@paralleldrive/cuid2"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar los datos recibidos
    if (
      !body.vehicleId ||
      !body.driverId ||
      !body.routeId ||
      !body.scheduledStart ||
      !body.scheduledEnd ||
      !body.cargo
    ) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    // Verificar disponibilidad del vehículo
    const conflictingTrip = await db.query.trips.findFirst({
      where: (trips, { and, eq, or, lte, gte }) =>
        and(
          eq(trips.vehicleId, body.vehicleId),
          or(
            and(
              lte(trips.scheduledStart, new Date(body.scheduledStart)),
              gte(trips.scheduledEnd, new Date(body.scheduledStart)),
            ),
            and(
              lte(trips.scheduledStart, new Date(body.scheduledEnd)),
              gte(trips.scheduledEnd, new Date(body.scheduledEnd)),
            ),
            and(
              gte(trips.scheduledStart, new Date(body.scheduledStart)),
              lte(trips.scheduledEnd, new Date(body.scheduledEnd)),
            ),
          ),
        ),
    })

    if (conflictingTrip) {
      return NextResponse.json({ error: "El vehículo ya tiene un viaje programado en ese horario" }, { status: 409 })
    }

    // Crear el viaje
    const newTrip = await db
      .insert(trips)
      .values({
        id: createId(),
        vehicleId: body.vehicleId,
        driverId: body.driverId,
        routeId: body.routeId,
        scheduledStart: new Date(body.scheduledStart),
        scheduledEnd: new Date(body.scheduledEnd),
        status: body.status || "programado",
        cargo: body.cargo,
        cargoWeight: body.cargoWeight || null,
        notes: body.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return NextResponse.json(newTrip[0], { status: 201 })
  } catch (error) {
    console.error("Error al crear viaje:", error)
    return NextResponse.json({ error: "Error al crear el viaje" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const vehicleId = searchParams.get("vehicleId")
    const driverId = searchParams.get("driverId")

    const whereConditions: any[] = []

    if (status) {
      whereConditions.push((trips: any, { eq }: any) => eq(trips.status, status))
    }
    if (vehicleId) {
      whereConditions.push((trips: any, { eq }: any) => eq(trips.vehicleId, vehicleId))
    }
    if (driverId) {
      whereConditions.push((trips: any, { eq }: any) => eq(trips.driverId, driverId))
    }

    const allTrips = await db.query.trips.findMany({
      with: {
        vehicle: true,
        driver: true,
        route: true,
      },
      orderBy: (trips, { desc }) => [desc(trips.createdAt)],
    })

    return NextResponse.json(allTrips)
  } catch (error) {
    console.error("Error al obtener viajes:", error)
    return NextResponse.json({ error: "Error al obtener los viajes" }, { status: 500 })
  }
}
