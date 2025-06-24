import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { attendances } from "@/db/schema"
import { createId } from "@paralleldrive/cuid2"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar los datos recibidos
    if (!body.employeeId || !body.date || !body.type) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    // Crear el registro de asistencia
    const newAttendance = await db
      .insert(attendances)
      .values({
        id: createId(),
        employeeId: body.employeeId,
        date: new Date(body.date),
        type: body.type,
        timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
        location: body.location || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        notes: body.notes || null,
        verifiedBy: body.verifiedBy || null,
        tripId: body.tripId || null,
      })
      .returning()

    return NextResponse.json(newAttendance[0], { status: 201 })
  } catch (error) {
    console.error("Error al registrar asistencia:", error)
    return NextResponse.json({ error: "Error al registrar la asistencia" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const type = searchParams.get("type")

    // Enum values for attendance type
    const allowedTypes = ["entrada", "salida", "descanso_inicio", "descanso_fin"] as const
    type AttendanceType = typeof allowedTypes[number]

    const attendanceRecords = await db.query.attendances.findMany({
      where: (attendances, { eq, and, gte, lte }) => {
        const conditions = []
        if (employeeId && employeeId !== "all") conditions.push(eq(attendances.employeeId, employeeId))
        if (startDate) conditions.push(gte(attendances.date, new Date(startDate)))
        if (endDate) conditions.push(lte(attendances.date, new Date(endDate)))
        if (type && type !== "all" && allowedTypes.includes(type as AttendanceType)) {
          conditions.push(eq(attendances.type, type as AttendanceType))
        }
        return conditions.length > 0 ? and(...conditions) : undefined
      },
      with: {
        employee: true,
        verifiedByUser: true,
        trip: true,
      },
      orderBy: (attendances, { desc }) => [desc(attendances.date), desc(attendances.timestamp)],
    })

    return NextResponse.json(attendanceRecords)
  } catch (error) {
    console.error("Error al obtener asistencias:", error)
    return NextResponse.json({ error: "Error al obtener las asistencias" }, { status: 500 })
  }
}
