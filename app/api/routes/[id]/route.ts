import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { routes } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const routeId = params.id

    const route = await db.query.routes.findFirst({
      where: (routes, { eq }) => eq(routes.id, routeId),
    })

    if (!route) {
      return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 })
    }

    return NextResponse.json(route)
  } catch (error) {
    console.error("Error al obtener ruta:", error)
    return NextResponse.json({ error: "Error al obtener la ruta" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const routeId = params.id
    const body = await request.json()

    // Verificar si la ruta existe
    const existingRoute = await db.query.routes.findFirst({
      where: (routes, { eq }) => eq(routes.id, routeId),
    })

    if (!existingRoute) {
      return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 })
    }

    // Preparar los datos para actualizar
    const updateData: any = {
      updatedAt: new Date(),
    }

    // Solo incluir los campos que se están actualizando
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.originName !== undefined) updateData.originName = body.originName
    if (body.originLat !== undefined) updateData.originLat = body.originLat.toString()
    if (body.originLng !== undefined) updateData.originLng = body.originLng.toString()
    if (body.destinationName !== undefined) updateData.destinationName = body.destinationName
    if (body.destinationLat !== undefined) updateData.destinationLat = body.destinationLat.toString()
    if (body.destinationLng !== undefined) updateData.destinationLng = body.destinationLng.toString()
    if (body.distance !== undefined) updateData.distance = body.distance.toString()
    if (body.estimatedDuration !== undefined) updateData.estimatedDuration = body.estimatedDuration
    if (body.active !== undefined) updateData.active = body.active

    // Actualizar la ruta
    const updatedRoute = await db.update(routes).set(updateData).where(eq(routes.id, routeId)).returning()

    return NextResponse.json(updatedRoute[0])
  } catch (error) {
    console.error("Error al actualizar ruta:", error)
    return NextResponse.json({ error: "Error al actualizar la ruta" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const routeId = params.id

    // Verificar si la ruta existe
    const existingRoute = await db.query.routes.findFirst({
      where: (routes, { eq }) => eq(routes.id, routeId),
    })

    if (!existingRoute) {
      return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 })
    }

    // Eliminar la ruta
    await db.delete(routes).where(eq(routes.id, routeId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar ruta:", error)
    return NextResponse.json({ error: "Error al eliminar la ruta" }, { status: 500 })
  }
}
