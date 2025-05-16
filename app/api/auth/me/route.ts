import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error en la ruta /api/auth/me:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
