import { db } from "@/db"
import { users, userActivity } from "@/db/schema"
import { eq, desc, count } from "drizzle-orm"
import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const offset = (page - 1) * limit

    // Construir la consulta base
    let baseQuery = db
      .select({
        id: userActivity.id,
        userId: userActivity.userId,
        userName: users.name,
        userRole: users.role,
        action: userActivity.action,
        module: userActivity.module,
        details: userActivity.details,
        timestamp: userActivity.timestamp,
        ipAddress: userActivity.ipAddress,
      })
      .from(userActivity)
      .innerJoin(users, eq(userActivity.userId, users.id))

    // Aplicar filtro por rol si se proporciona
    const whereRole = role && role !== "all" ? eq(users.role, role as "admin" | "operador" | "conductor") : undefined;

    // Ejecutar la consulta con paginación
    const activities = await baseQuery
      .where(whereRole)
      .orderBy(desc(userActivity.timestamp))
      .limit(limit)
      .offset(offset)

    // Contar el total de registros para la paginación
    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(userActivity)
      .innerJoin(users, eq(userActivity.userId, users.id))
      .where(role && role !== "all" ? eq(users.role, role as "admin" | "operador" | "conductor") : undefined)

    return NextResponse.json({
      activities,
      pagination: {
        total: Number(totalCount),
        page,
        limit,
        totalPages: Math.ceil(Number(totalCount) / limit),
      },
    })
  } catch (error) {
    console.error("Error al obtener actividades:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
