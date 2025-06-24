import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { trips, vehicles, users, routes } from "@/db/schema"
import { createId } from "@paralleldrive/cuid2"
import { eq, desc, and, or, lte, gte } from "drizzle-orm"

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
    const conflictingTrip = await db
      .select()
      .from(trips)
      .where(
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
      )
      .limit(1)

    if (conflictingTrip.length > 0) {
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
        cargoWeight: body.cargoWeight ? body.cargoWeight.toString() : null,
        notes: body.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    // Obtener el viaje completo con relaciones
    const tripWithRelations = await db
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
      .where(eq(trips.id, newTrip[0].id))
      .limit(1)

    return NextResponse.json(tripWithRelations[0], { status: 201 })
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
    const limit = searchParams.get("limit")

    const whereConditions = []
    if (status) {
      whereConditions.push(eq(trips.status, status))
    }
    if (vehicleId) {
      whereConditions.push(eq(trips.vehicleId, vehicleId))
    }
    if (driverId) {
      whereConditions.push(eq(trips.driverId, driverId))
    }

    const tripsQueryBase = db
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
      .from(trips);

    const tripsQueryWithWhere =
      whereConditions.length > 0
        ? tripsQueryBase.where(and(...whereConditions))
        : tripsQueryBase;

    const tripsQuery = tripsQueryWithWhere
      .leftJoin(vehicles, eq(trips.vehicleId, vehicles.id))
      .leftJoin(users, eq(trips.driverId, users.id))
      .leftJoin(routes, eq(trips.routeId, routes.id))
      .orderBy(desc(trips.createdAt));

    const limitedTripsQuery = limit
      ? tripsQuery.limit(Number.parseInt(limit))
      : tripsQuery;

    const allTrips = await limitedTripsQuery;

    return NextResponse.json(allTrips)
  } catch (error) {
    console.error("Error al obtener viajes:", error)
    return NextResponse.json({ error: "Error al obtener los viajes" }, { status: 500 })
  }
}
