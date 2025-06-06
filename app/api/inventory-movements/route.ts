import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { inventoryMovements, products } from "@/db/schema"
import { createId } from "@paralleldrive/cuid2"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar los datos recibidos
    if (!body.productId || !body.type || !body.quantity || !body.reason || !body.userId) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    // Obtener el producto actual
    const product = await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.id, body.productId),
    })

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    const currentStock = Number(product.currentStock)
    const quantity = Number(body.quantity)
    let newStock = currentStock

    // Calcular nuevo stock según el tipo de movimiento
    switch (body.type) {
      case "entrada":
        newStock = currentStock + quantity
        break
      case "salida":
        if (quantity > Number(product.availableStock)) {
          return NextResponse.json({ error: "Stock insuficiente" }, { status: 400 })
        }
        newStock = currentStock - quantity
        break
      case "ajuste":
        newStock = quantity // En ajuste, la cantidad es el nuevo stock total
        break
      case "transferencia":
        // Para transferencias, manejar según si es entrada o salida
        if (body.reason.includes("entrada")) {
          newStock = currentStock + quantity
        } else {
          newStock = currentStock - quantity
        }
        break
    }

    // Calcular costo total
    const totalCost = body.unitCost ? quantity * Number(body.unitCost) : null

    // Crear el movimiento
    const newMovement = await db
      .insert(inventoryMovements)
      .values({
        id: createId(),
        productId: body.productId,
        type: body.type,
        quantity: quantity.toString(),
        unitCost: body.unitCost || null,
        totalCost: totalCost?.toString() || null,
        reason: body.reason,
        reference: body.reference || null,
        userId: body.userId,
        loadId: body.loadId || null,
        previousStock: currentStock.toString(),
        newStock: newStock.toString(),
        timestamp: new Date(),
        notes: body.notes || null,
      })
      .returning()

    // Actualizar el stock del producto
    await db
      .update(products)
      .set({
        currentStock: newStock.toString(),
        availableStock: newStock.toString(), // Simplificado, en producción calcular reservas
        updatedAt: new Date(),
      })
      .where(eq(products.id, body.productId))

    return NextResponse.json(newMovement[0], { status: 201 })
  } catch (error) {
    console.error("Error al crear movimiento:", error)
    return NextResponse.json({ error: "Error al crear el movimiento de inventario" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const type = searchParams.get("type")
    const limit = searchParams.get("limit")

    const allMovements = await db.query.inventoryMovements.findMany({
      with: {
        product: true,
        user: true,
      },
      orderBy: (movements, { desc }) => [desc(movements.timestamp)],
      limit: limit ? Number.parseInt(limit) : undefined,
    })

    // Aplicar filtros
    let filteredMovements = allMovements

    if (productId) {
      filteredMovements = filteredMovements.filter((m) => m.productId === productId)
    }
    if (type) {
      filteredMovements = filteredMovements.filter((m) => m.type === type)
    }

    return NextResponse.json(filteredMovements)
  } catch (error) {
    console.error("Error al obtener movimientos:", error)
    return NextResponse.json({ error: "Error al obtener los movimientos" }, { status: 500 })
  }
}
