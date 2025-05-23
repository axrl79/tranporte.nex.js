import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { routes } from "@/db/schema"
import { createId } from "@paralleldrive/cuid2"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar los datos recibidos
    if (
      !body.name ||
      !body.originName ||
      !body.destinationName ||
      body.originLat === undefined ||
      body.originLng === undefined ||
      body.destinationLat === undefined ||
      body.destinationLng === undefined ||
      !body.distance ||
      !body.estimatedDuration
    ) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    // Crear la ruta
    const newRoute = await db
      .insert(routes)
      .values({
        id: createId(),
        name: body.name,
        description: body.description || null,
        originName: body.originName,
        originLat: body.originLat.toString(),
        originLng: body.originLng.toString(),
        destinationName: body.destinationName,
        destinationLat: body.destinationLat.toString(),
        destinationLng: body.destinationLng.toString(),
        distance: body.distance.toString(),
        estimatedDuration: body.estimatedDuration,
        createdAt: new Date(),
        updatedAt: new Date(),
        active: body.active !== undefined ? body.active : true,
      })
      .returning()

    return NextResponse.json(newRoute[0], { status: 201 })
  } catch (error) {
    console.error("Error al crear ruta:", error)
    return NextResponse.json({ error: "Error al crear la ruta" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get("active")

    const query = db.query.routes

    if (active !== null) {
      const allRoutes = await db.query.routes.findMany()
      return NextResponse.json(allRoutes.filter((route) => route.active === (active === "true")))
    } else {
      const allRoutes = await query.findMany({
        orderBy: (routes, { desc }) => [desc(routes.createdAt)],
      })

      return NextResponse.json(allRoutes)
    }
  } catch (error) {
    console.error("Error al obtener rutas:", error)
    return NextResponse.json({ error: "Error al obtener las rutas" }, { status: 500 })
  }
}
