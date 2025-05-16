"use client"

// Archivo simplificado para el ejemplo
import { useState } from "react"

type ToastProps = {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: ToastProps) => {
    setToasts((prev) => [...prev, props])

    // En una implementación real, esto mostraría un toast en la UI
    console.log("Toast:", props.title, props.description)

    // Eliminar el toast después de 3 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t !== props))
    }, 3000)
  }

  return { toast, toasts }
}
