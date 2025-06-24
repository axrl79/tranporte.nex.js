import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { loads } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const loadId = params.id

    const load = await db.query.loads.findFirst({
      where: (loads, { eq }) => eq(loads.id, loadId),
      with: {
        trip: {
          with: {
            vehicle: true,
            driver: true,
            route: true,
          },
        },
      },
    })

    if (!load) {
      return NextResponse.json({ error: "Carga no encontrada" }, { status: 404 })
    }

    return NextResponse.json(load)
  } catch (error) {
    console.error("Error al obtener carga:", error)
    return NextResponse.json({ error: "Error al obtener la carga" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const loadId = params.id
    const body = await request.json()

    // Verificar si la carga existe
    const existingLoad = await db.query.loads.findFirst({
      where: (loads, { eq }) => eq(loads.id, loadId),
    })

    if (!existingLoad) {
      return NextResponse.json({ error: "Carga no encontrada" }, { status: 404 })
    }

    // Preparar los datos para actualizar
    const updateData: any = {
      updatedAt: new Date(),
    }

    // Solo incluir los campos que se están actualizando
    if (body.status !== undefined) updateData.status = body.status
    if (body.description !== undefined) updateData.description = body.description
    if (body.weight !== undefined) updateData.weight = body.weight.toString()
    if (body.volume !== undefined) updateData.volume = body.volume.toString()
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.specialInstructions !== undefined) updateData.specialInstructions = body.specialInstructions
    if (body.actualLoadTime !== undefined) updateData.actualLoadTime = new Date(body.actualLoadTime)
    if (body.actualUnloadTime !== undefined) updateData.actualUnloadTime = new Date(body.actualUnloadTime)
    if (body.responsiblePerson !== undefined) updateData.responsiblePerson = body.responsiblePerson

    // Actualizar la carga
    const updatedLoad = await db.update(loads).set(updateData).where(eq(loads.id, loadId)).returning()

    return NextResponse.json(updatedLoad[0])
  } catch (error) {
    console.error("Error al actualizar carga:", error)
    return NextResponse.json({ error: "Error al actualizar la carga" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const loadId = params.id

    // Verificar si la carga existe
    const existingLoad = await db.query.loads.findFirst({
      where: (loads, { eq }) => eq(loads.id, loadId),
    })

    if (!existingLoad) {
      return NextResponse.json({ error: "Carga no encontrada" }, { status: 404 })
    }

    // Verificar si la carga puede ser eliminada
    if (existingLoad.status === "cargado" || existingLoad.status === "descargado" || existingLoad.status === "completado") {
      return NextResponse.json({ error: "No se puede eliminar una carga que ya ha sido procesada" }, { status: 400 })
    }

    // Eliminar la carga
    await db.delete(loads).where(eq(loads.id, loadId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar carga:", error)
    return NextResponse.json({ error: "Error al eliminar la carga" }, { status: 500 })
  }
}
