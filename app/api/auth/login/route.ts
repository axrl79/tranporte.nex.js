import { login } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// Esquema de validación
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar los datos
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Datos de entrada inválidos", details: result.error.format() }, { status: 400 })
    }

    const { email, password } = result.data

    // Intentar iniciar sesión
    const loginResult = await login(email, password)

    if ("error" in loginResult) {
      return NextResponse.json({ error: loginResult.error }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: loginResult.user,
    })
  } catch (error) {
    console.error("Error en la ruta de login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
