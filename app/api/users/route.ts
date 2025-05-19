import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { hashPassword } from "@/lib/utils"
import { createId } from "@paralleldrive/cuid2"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar los datos recibidos
    if (!body.name || !body.email || !body.password || !body.role) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    // Verificar si el correo ya existe
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, body.email),
    })

    if (existingUser) {
      return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 409 })
    }

    // Hashear la contraseña
    const hashedPassword = await hashPassword(body.password)

    // Crear el usuario
    const newUser = await db
      .insert(users)
      .values({
        id: createId(),
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: body.role,
        active: body.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    // Eliminar la contraseña del objeto de respuesta
    const userResponse: Omit<typeof newUser[0], "password"> & { password?: string } = { ...newUser[0] }
    delete userResponse.password

    return NextResponse.json(userResponse, { status: 201 })
  } catch (error) {
    console.error("Error al crear usuario:", error)
    return NextResponse.json({ error: "Error al crear el usuario" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const allUsers = await db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    })

    // Eliminar las contraseñas de los objetos de respuesta
    const usersResponse = allUsers.map((user) => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    return NextResponse.json(usersResponse)
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return NextResponse.json({ error: "Error al obtener los usuarios" }, { status: 500 })
  }
}
