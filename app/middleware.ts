import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

// Clave secreta del token
const JWT_SECRET = process.env.JWT_SECRET || "mi_secreto_super_seguro"

export function middleware(request: NextRequest) {
  // Leer token desde cookie o header
  const token = request.cookies.get("token")?.value || 
                request.headers.get("Authorization")?.split(" ")[1]

  if (!token) {
    console.warn("⚠️ No se encontró token")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      sub: string
      email: string
      role: string
      iat: number
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", decoded.sub)
    requestHeaders.set("x-user-email", decoded.email)
    requestHeaders.set("x-user-role", decoded.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error("❌ Token inválido o expirado:", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",      // Rutas del dashboard protegidas
    "/api/protected/:path*",  // API protegida
  ],
  runtime: "nodejs", 
}
