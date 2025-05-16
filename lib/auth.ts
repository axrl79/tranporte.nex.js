import { db } from "@/db"
import { users, sessions, userActivity } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { createId } from "@paralleldrive/cuid2"
import { PgColumn } from "drizzle-orm/pg-core"

// Duración de la sesión: 7 días
const SESSION_DURATION = 1000 * 60 * 60 * 24 * 7

// Función para crear un hash de la contraseña
export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
}

// Función para verificar la contraseña
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
}

// Función para crear un usuario
export async function createUser(userData: {
    email: string
    name: string
    password: string
    role?: "admin" | "operador" | "conductor"
}) {
    const hashedPassword = await hashPassword(userData.password)

    try {
        const [user] = await db
            .insert(users)
            .values({
                email: userData.email,
                name: userData.name,
                password: hashedPassword,
                role: userData.role || "operador",
            })
            .returning()

        return { user }
    } catch (error) {
        console.error("Error al crear usuario:", error)
        return { error: "No se pudo crear el usuario" }
    }
}

// Función para iniciar sesión
export async function login(email: string, password: string) {
    // Buscar el usuario por email
    const [user] = await db.select().from(users).where(eq(users.email, email))

    if (!user) {
        return { error: "Credenciales inválidas" }
    }

    // Verificar la contraseña
    const passwordValid = await verifyPassword(password, user.password)
    if (!passwordValid) {
        return { error: "Credenciales inválidas" }
    }

    // Crear una sesión
    const sessionId = createId()
    const expiresAt = new Date(Date.now() + SESSION_DURATION)

    await db.insert(sessions).values({
        id: sessionId,
        userId: user.id,
        expiresAt,
    })

    // Actualizar último login
    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id))

    // Registrar actividad
    await db.insert(userActivity).values({
        userId: user.id,
        action: "Inicio de sesión",
        module: "Autenticación",
        details: "Inicio de sesión exitoso",
        ipAddress: "0.0.0.0", // En una implementación real, obtener la IP del cliente
    })

    // Establecer cookie de sesión
    const cookieStore = await cookies();
    cookieStore.set("session_id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: expiresAt,
        path: "/",
    })

    return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
}

// Función para cerrar sesión
export async function logout() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value

    if (sessionId) {
        // Eliminar la sesión de la base de datos
        await db.delete(sessions).where(eq(sessions.id, sessionId))

        // Eliminar la cookie
        const cookieStore = await cookies();
        cookieStore.delete("session_id")
    }

    redirect("/")
}

// Función para obtener el usuario actual
export async function getCurrentUser() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value

    if (!sessionId) {
        return null
    }

    // Buscar la sesión
    const [session] = await db
        .select()
        .from(sessions)
        .where(and(eq(sessions.id, sessionId), get(sessions.expiresAt, new Date())))

    if (!session) {
        const cookieStore = await cookies();
        cookieStore.delete("session_id")
        return null
    }

    // Buscar el usuario
    const [user] = await db
        .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
        })
        .from(users)
        .where(eq(users.id, session.userId))

    if (!user) {
        const cookieStore = await cookies();
        cookieStore.delete("session_id")
        return null
    }

    return user
}

// Middleware para proteger rutas
export async function requireAuth() {
    const user = await getCurrentUser()

    if (!user) {
        redirect("/")
    }

    return user
}

// Middleware para verificar roles
export async function requireRole(allowedRoles: ("admin" | "operador" | "conductor")[]) {
    const user = await requireAuth()

    if (!allowedRoles.includes(user.role)) {
        redirect("/dashboard")
    }

    return user
}

// Helper para verificar que la sesión no esté expirada
import { gt } from "drizzle-orm";

function get(
    expiresAt: PgColumn<{ name: "expires_at"; tableName: "sessions"; dataType: "date"; columnType: "PgTimestamp"; data: Date; driverParam: string; notNull: true; hasDefault: false; isPrimaryKey: false; isAutoincrement: false; hasRuntimeDefault: false; enumValues: undefined; baseColumn: never; identity: undefined; generated: undefined }, {}, {}>,
    now: Date
) {
    // Retorna una condición SQL para verificar que expiresAt sea mayor que now
    return gt(expiresAt, now)
}

