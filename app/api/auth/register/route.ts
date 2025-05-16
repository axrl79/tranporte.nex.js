import { createUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// Esquema de validación
const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["admin", "operador", "conductor"]).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar los datos
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Datos de entrada inválidos", details: result.error.format() }, { status: 400 })
    }

    // Crear el usuario
    const { email, name, password, role } = result.data
    const createResult = await createUser({ email, name, password, role })

    if ("error" in createResult) {
      return NextResponse.json({ error: createResult.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: createResult.user.id,
        name: createResult.user.name,
        email: createResult.user.email,
        role: createResult.user.role,
      },
    })
  } catch (error) {
    console.error("Error en la ruta de registro:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
