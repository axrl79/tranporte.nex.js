import { login } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import jwt from "jsonwebtoken"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

const JWT_SECRET = process.env.JWT_SECRET || "mi_secreto_super_seguro"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = loginSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos de entrada inválidos", details: result.error.format() },
        { status: 400 }
      )
    }

    const { email, password } = result.data
    const loginResult = await login(email, password)

    if ("error" in loginResult) {
      return NextResponse.json(
        { error: loginResult.error },
        { status: 401 }
      )
    }

    const user = loginResult.user

    // Generar token JWT con datos esenciales
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    )

    // Crear respuesta y añadir cookie HTTP-only
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    )

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response

  } catch (error) {
    console.error("Error en la ruta de login:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
