import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("session_id")?.value
  const { pathname } = request.nextUrl

  // Rutas protegidas que requieren autenticación
  const protectedRoutes = ["/dashboard"]

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/", "/api/auth/login", "/api/auth/register"]

  // Verificar si la ruta actual es protegida
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some((route) => pathname === route)

  // Si es una ruta protegida y no hay sesión, redirigir al login
  if (isProtectedRoute && !sessionId) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Si es la página de inicio y hay sesión, redirigir al dashboard
  if (pathname === "/" && sessionId) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configurar las rutas que deben ser procesadas por el middleware
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * 1. Archivos estáticos (_next/static, favicon.ico, etc.)
     * 2. Rutas de API que no son de autenticación
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
