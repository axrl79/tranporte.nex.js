import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { products } from "@/db/schema"
import { createId } from "@paralleldrive/cuid2"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar los datos recibidos
    if (!body.code || !body.name || !body.type || !body.unit) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    // Verificar si el código ya existe
    const existingProduct = await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.code, body.code),
    })

    if (existingProduct) {
      return NextResponse.json({ error: "El código de producto ya existe" }, { status: 409 })
    }

    // Generar QR code
    const qrCode = `QR-${body.code}`

    // Crear el producto
    const newProduct = await db
      .insert(products)
      .values({
        code: body.code,
        name: body.name,
        description: body.description || null,
        type: body.type,
        unit: body.unit,
        unitWeight: body.unitWeight || null,
        unitVolume: body.unitVolume || null,
        minStock: body.minStock ? String(body.minStock) : "0",
        maxStock: body.maxStock ? String(body.maxStock) : null,
        currentStock: body.currentStock ? String(body.currentStock) : "0",
        reservedStock: "0",
        availableStock: body.currentStock ? String(body.currentStock) : "0",
        location: body.location || null,
        qrCode,
        active: body.active !== undefined ? body.active : true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return NextResponse.json(newProduct[0], { status: 201 })
  } catch (error) {
    console.error("Error al crear producto:", error)
    return NextResponse.json({ error: "Error al crear el producto" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const active = searchParams.get("active")
    const lowStock = searchParams.get("lowStock")

    const allProducts = await db.query.products.findMany({
      orderBy: (products, { desc }) => [desc(products.createdAt)],
    })

    // Aplicar filtros
    let filteredProducts = allProducts

    if (type) {
      filteredProducts = filteredProducts.filter((p) => p.type === type)
    }
    if (active !== null) {
      filteredProducts = filteredProducts.filter((p) => p.active === (active === "true"))
    }
    if (lowStock === "true") {
      filteredProducts = filteredProducts.filter((p) => Number(p.currentStock) <= Number(p.minStock))
    }

    return NextResponse.json(filteredProducts)
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return NextResponse.json({ error: "Error al obtener los productos" }, { status: 500 })
  }
}
