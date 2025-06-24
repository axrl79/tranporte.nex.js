"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  className?: string
}

export function ImageUpload({ value, onChange, label, placeholder, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string>(value || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido",
        variant: "destructive",
      })
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Crear preview local
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreview(result)
      }
      reader.readAsDataURL(file)

      // Simular upload (en producción aquí iría la lógica real de upload)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Por ahora usamos el data URL como valor
      const reader2 = new FileReader()
      reader2.onload = (e) => {
        const result = e.target?.result as string
        onChange(result)
        toast({
          title: "Éxito",
          description: "Imagen cargada correctamente",
        })
      }
      reader2.readAsDataURL(file)
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Error al cargar la imagen",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview("")
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}

      <div className="flex items-center space-x-4">
        {/* Preview de la imagen */}
        {preview ? (
          <div className="relative">
            <img
              src={preview || "/placeholder.svg"}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={handleRemove}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}

        {/* Botón de carga */}
        <div className="flex-1">
          <Button type="button" variant="outline" onClick={handleClick} disabled={isUploading} className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Cargando..." : "Seleccionar Imagen"}
          </Button>
          <p className="text-xs text-muted-foreground mt-1">{placeholder || "JPG, PNG, GIF hasta 5MB"}</p>
        </div>
      </div>

      {/* Input oculto */}
      <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
    </div>
  )
}
