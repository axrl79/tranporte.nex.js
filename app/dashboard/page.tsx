import DashboardOverview from "@/components/dashboard-overview"

export default function DashboardPage() {
  // Aquí podrías verificar la autenticación y redirigir si es necesario
  // const isAuthenticated = ...
  // if (!isAuthenticated) redirect('/login')

  return <DashboardOverview />
}
