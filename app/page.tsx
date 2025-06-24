"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Truck,
  MapPin,
  Shield,
  BarChart3,
  Clock,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  LocateIcon as Location,
} from "lucide-react"

export default function LandingPage() {
  const services = [
    {
      icon: Truck,
      title: "Gestión Inteligente de Flotas",
      description: "Control total de tu flota con tecnología de vanguardia y análisis predictivo.",
    },
    {
      icon: MapPin,
      title: "Seguimiento GPS en Tiempo Real",
      description: "Monitoreo 24/7 de todos tus vehículos con precisión GPS de alta calidad.",
    },
    {
      icon: Shield,
      title: "Seguridad Avanzada",
      description: "Protección integral con alertas automáticas y sistemas de seguridad inteligentes.",
    },
    {
      icon: BarChart3,
      title: "Reportes y Analytics",
      description: "Informes detallados y análisis de datos para optimizar tu operación.",
    },
    {
      icon: Clock,
      title: "Mantenimiento Predictivo",
      description: "Programa mantenimientos inteligentes para evitar fallas costosas.",
    },
    {
      icon: Users,
      title: "Gestión de Personal",
      description: "Control completo de conductores, horarios y documentación.",
    },
  ]

  const testimonials = [
    {
      name: "Carlos Mendoza",
      company: "TransBolivia S.A.",
      content:
        "FleetSafe AI revolucionó nuestra operación. Reducimos costos en 30% y mejoramos la eficiencia significativamente.",
      rating: 5,
    },
    {
      name: "María González",
      company: "Logística del Sur",
      content: "El mejor sistema de gestión de flotas que hemos usado. La atención al cliente es excepcional.",
      rating: 5,
    },
    {
      name: "Roberto Silva",
      company: "Transportes Andinos",
      content:
        "Desde que implementamos FleetSafe AI, nuestros clientes están más satisfechos con los tiempos de entrega.",
      rating: 5,
    },
  ]

  const plans = [
    {
      name: "Básico",
      price: "299",
      description: "Perfecto para pequeñas empresas",
      features: ["Hasta 10 vehículos", "Seguimiento GPS básico", "Reportes mensuales", "Soporte por email"],
    },
    {
      name: "Profesional",
      price: "599",
      description: "Ideal para empresas en crecimiento",
      features: [
        "Hasta 50 vehículos",
        "Seguimiento GPS avanzado",
        "Reportes en tiempo real",
        "Mantenimiento predictivo",
        "Soporte telefónico",
      ],
      popular: true,
    },
    {
      name: "Empresarial",
      price: "1299",
      description: "Para grandes operaciones",
      features: [
        "Vehículos ilimitados",
        "IA y análisis avanzado",
        "API personalizada",
        "Integración ERP",
        "Soporte 24/7 dedicado",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2463] via-[#0E6BA8] to-[#A2D5F2]">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#F9DC5C] rounded-full flex items-center justify-center">
                <Truck className="h-6 w-6 text-[#0A2463]" />
              </div>
              <h1 className="text-2xl font-bold text-white">FleetSafe AI</h1>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#servicios" className="text-white/80 hover:text-white transition">
                Servicios
              </Link>
              <Link href="#nosotros" className="text-white/80 hover:text-white transition">
                Nosotros
              </Link>
              <Link href="#precios" className="text-white/80 hover:text-white transition">
                Precios
              </Link>
              <Link href="#contacto" className="text-white/80 hover:text-white transition">
                Contacto
              </Link>
              <Button asChild className="bg-[#F9DC5C] text-[#0A2463] hover:bg-[#F9DC5C]/90">
                <Link href="/login">Acceder al Sistema</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-[#F9DC5C] bg-clip-text text-transparent">
              Gestión Inteligente de Flotas
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Optimiza tu flota con tecnología de vanguardia, IA avanzada y control total en tiempo real
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-[#F9DC5C] text-[#0A2463] hover:bg-[#F9DC5C]/90 text-lg px-8 py-4">
                <Link href="/login">
                  Comenzar Ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#0A2463] text-lg px-8 py-4"
              >
                Ver Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/10 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold text-[#F9DC5C]">15+</div>
              <div className="text-lg">Años de Experiencia</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#F9DC5C]">500+</div>
              <div className="text-lg">Clientes Satisfechos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#F9DC5C]">1000+</div>
              <div className="text-lg">Vehículos Monitoreados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#F9DC5C]">24/7</div>
              <div className="text-lg">Soporte Técnico</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0A2463] mb-4">Nuestros Servicios</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Soluciones completas para la gestión eficiente de tu flota vehicular
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-[#0A2463] rounded-lg flex items-center justify-center mb-4">
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-[#0A2463]">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="py-20 bg-[#F2E9DC]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[#0A2463] mb-6">15 Años Transformando el Transporte</h2>
              <p className="text-lg text-gray-700 mb-6">
                Desde 2009, FleetSafe AI ha sido pionero en soluciones tecnológicas para el sector transporte. Hemos
                evolucionado junto con nuestros clientes, incorporando las últimas tecnologías como inteligencia
                artificial y análisis predictivo.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-gray-700">Tecnología de vanguardia</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-gray-700">Soporte técnico especializado</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-gray-700">Implementación personalizada</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-gray-700">ROI comprobado</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-[#0A2463] mb-6">Nuestros Logros</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Reducción de Costos</span>
                  <span className="text-2xl font-bold text-[#0A2463]">35%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Mejora en Eficiencia</span>
                  <span className="text-2xl font-bold text-[#0A2463]">40%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Satisfacción del Cliente</span>
                  <span className="text-2xl font-bold text-[#0A2463]">98%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Tiempo de Implementación</span>
                  <span className="text-2xl font-bold text-[#0A2463]">48h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0A2463] mb-4">Lo que Dicen Nuestros Clientes</h2>
            <p className="text-xl text-gray-600">Testimonios reales de empresas que confían en nosotros</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-[#0A2463]">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-20 bg-[#F2E9DC]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0A2463] mb-4">Planes y Precios</h2>
            <p className="text-xl text-gray-600">Elige el plan que mejor se adapte a tu empresa</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative hover:shadow-lg transition-shadow ${plan.popular ? "border-[#0A2463] border-2" : ""}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#0A2463]">
                    Más Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-[#0A2463]">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-[#0A2463]">
                    ${plan.price}
                    <span className="text-lg font-normal text-gray-600">/mes</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6 bg-[#0A2463] hover:bg-[#0A2463]/90">Comenzar Prueba Gratuita</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contacto" className="py-20 bg-[#0A2463] text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Contáctanos</h2>
            <p className="text-xl text-white/80">Estamos aquí para ayudarte a optimizar tu flota</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Phone className="h-12 w-12 text-[#F9DC5C] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Teléfono</h3>
              <p className="text-white/80">+591 2 123-4567</p>
              <p className="text-white/80">+591 70 123-456</p>
            </div>
            <div>
              <Mail className="h-12 w-12 text-[#F9DC5C] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p className="text-white/80">info@fleetsafe.com</p>
              <p className="text-white/80">soporte@fleetsafe.com</p>
            </div>
            <div>
              <Location className="h-12 w-12 text-[#F9DC5C] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Oficina</h3>
              <p className="text-white/80">Av. Arce 2345</p>
              <p className="text-white/80">La Paz, Bolivia</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A2463]/90 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#F9DC5C] rounded-full flex items-center justify-center">
                  <Truck className="h-5 w-5 text-[#0A2463]" />
                </div>
                <h3 className="text-xl font-bold">FleetSafe AI</h3>
              </div>
              <p className="text-white/80">Líderes en gestión inteligente de flotas desde 2009.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Servicios</h4>
              <ul className="space-y-2 text-white/80">
                <li>Gestión de Flotas</li>
                <li>Seguimiento GPS</li>
                <li>Mantenimiento</li>
                <li>Reportes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-white/80">
                <li>Nosotros</li>
                <li>Contacto</li>
                <li>Soporte</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-white/80">
                <li>Términos de Uso</li>
                <li>Privacidad</li>
                <li>Cookies</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/80">
            <p>&copy; 2024 FleetSafe AI. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
