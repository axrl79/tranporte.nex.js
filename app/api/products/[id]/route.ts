import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { products } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    const product = await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.id, productId),
      with: {
        inventoryMovements: {
          with: {
            user: true,
          },
          orderBy: (movements, { desc }) => [desc(movements.timestamp)],
          limit: 10,
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error al obtener producto:", error)
    return NextResponse.json({ error: "Error al obtener el producto" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id
    const body = await request.json()

    // Verificar si el producto existe
    const existingProduct = await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.id, productId),
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Preparar los datos para actualizar
    const updateData: any = {
      updatedAt: new Date(),
    }

    // Solo incluir los campos que se están actualizando
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.type !== undefined) updateData.type = body.type
    if (body.unit !== undefined) updateData.unit = body.unit
    if (body.unitWeight !== undefined) updateData.unitWeight = body.unitWeight
    if (body.unitVolume !== undefined) updateData.unitVolume = body.unitVolume
    if (body.minStock !== undefined) updateData.minStock = body.minStock
    if (body.maxStock !== undefined) updateData.maxStock = body.maxStock
    if (body.location !== undefined) updateData.location = body.location
    if (body.active !== undefined) updateData.active = body.active

    // Actualizar el producto
    const updatedProduct = await db.update(products).set(updateData).where(eq(products.id, productId)).returning()

    return NextResponse.json(updatedProduct[0])
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    return NextResponse.json({ error: "Error al actualizar el producto" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id

    // Verificar si el producto existe
    const existingProduct = await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.id, productId),
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Verificar si el producto tiene stock
    if (Number(existingProduct.currentStock) > 0) {
      return NextResponse.json({ error: "No se puede eliminar un producto con stock" }, { status: 400 })
    }

    // Marcar como inactivo en lugar de eliminar
    await db.update(products).set({ active: false, updatedAt: new Date() }).where(eq(products.id, productId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    return NextResponse.json({ error: "Error al eliminar el producto" }, { status: 500 })
  }
}
