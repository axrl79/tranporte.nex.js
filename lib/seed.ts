import { db } from "../db"
import { users, userActivity } from "../db/schema"
import { hashPassword } from "@/lib/auth"

export async function seed() {
  try {
    console.log("🌱 Iniciando la siembra de datos...")

    // Verificar si ya existen usuarios
    const existingUsers = await db.select().from(users).limit(1)

    if (existingUsers.length > 0) {
      console.log("Ya existen usuarios en la base de datos. Omitiendo la siembra.")
      return
    }

    // Crear usuarios de prueba
    const adminPassword = await hashPassword("admin123")
    const operadorPassword = await hashPassword("operador123")
    const conductorPassword = await hashPassword("conductor123")

    const [admin] = await db
      .insert(users)
      .values({
        email: "admin@logisafe.com",
        name: "Administrador",
        password: adminPassword,
        role: "admin",
      })
      .returning()

    const [operador] = await db
      .insert(users)
      .values({
        email: "operador@logisafe.com",
        name: "Operador Principal",
        password: operadorPassword,
        role: "operador",
      })
      .returning()

    const [conductor] = await db
      .insert(users)
      .values({
        email: "conductor@logisafe.com",
        name: "Conductor Asignado",
        password: conductorPassword,
        role: "conductor",
      })
      .returning()

    // Crear actividades de ejemplo
    await db.insert(userActivity).values([
      {
        userId: admin.id,
        action: "Creación de usuario",
        module: "Usuarios",
        details: "Creó un nuevo usuario operador",
      },
      {
        userId: operador.id,
        action: "Programación de ruta",
        module: "Programación",
        details: "Programó una nueva ruta de entrega",
      },
      {
        userId: conductor.id,
        action: "Inicio de ruta",
        module: "Operaciones",
        details: "Inició la ruta programada #123",
      },
    ])

    console.log("✅ Datos sembrados correctamente")
    console.log("Usuarios creados:")
    console.log("- Admin: admin@logisafe.com / admin123")
    console.log("- Operador: operador@logisafe.com / operador123")
    console.log("- Conductor: conductor@logisafe.com / conductor123")
  } catch (error) {
    console.error("❌ Error al sembrar datos:", error)
  }
}
