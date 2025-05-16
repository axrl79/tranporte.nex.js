import { db } from "@/db"
import { sessions } from "@/db/schema"
import { eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value

    if (sessionId) {
      // Eliminar la sesión de la base de datos
      await db.delete(sessions).where(eq(sessions.id, sessionId))

      // Eliminar la cookie
      cookieStore.delete("session_id")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en la ruta de logout:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
