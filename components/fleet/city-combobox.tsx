"use client"

import * as React from "react"
import { Check, ChevronsUpDown, MapPin } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const bolivianCities = [
  { name: "La Paz", lat: -16.4897, lng: -68.1193, department: "La Paz" },
  { name: "Santa Cruz de la Sierra", lat: -17.7863, lng: -63.1812, department: "Santa Cruz" },
  { name: "Cochabamba", lat: -17.3895, lng: -66.1568, department: "Cochabamba" },
  { name: "Sucre", lat: -19.0368, lng: -65.2592, department: "Chuquisaca" },
  { name: "Oruro", lat: -17.9833, lng: -67.15, department: "Oruro" },
  { name: "Potosí", lat: -19.5836, lng: -65.7531, department: "Potosí" },
  { name: "Tarija", lat: -21.5355, lng: -64.7296, department: "Tarija" },
  { name: "Trinidad", lat: -14.8333, lng: -64.9, department: "Beni" },
  { name: "Cobija", lat: -11.0226, lng: -68.7666, department: "Pando" },
  { name: "El Alto", lat: -16.5, lng: -68.1667, department: "La Paz" },
  { name: "Montero", lat: -17.3667, lng: -63.25, department: "Santa Cruz" },
  { name: "Quillacollo", lat: -17.4, lng: -66.2833, department: "Cochabamba" },
  { name: "Sacaba", lat: -17.4, lng: -66.0333, department: "Cochabamba" },
  { name: "Riberalta", lat: -11.0167, lng: -66.0667, department: "Beni" },
  { name: "Warnes", lat: -17.5167, lng: -63.1667, department: "Santa Cruz" },
  { name: "Yacuiba", lat: -22.0167, lng: -63.6833, department: "Tarija" },
  { name: "Camiri", lat: -20.0333, lng: -63.5167, department: "Santa Cruz" },
  { name: "Villazón", lat: -22.0833, lng: -65.5833, department: "Potosí" },
]

interface CityComboboxProps {
  value?: string
  onValueChange?: (value: string) => void
  onCitySelect?: (city: { name: string; lat: number; lng: number }) => void
  placeholder?: string
  className?: string
}

export function CityCombobox({
  value,
  onValueChange,
  onCitySelect,
  placeholder = "Seleccionar ciudad...",
  className,
}: CityComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  const selectedCity = bolivianCities.find((city) => city.name === value)

  const filteredCities = bolivianCities.map(city => ({
    ...city,
    matchesSearch: searchTerm === "" || 
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      city.department.toLowerCase().includes(searchTerm.toLowerCase())
  }))

  const handleSelect = (cityName: string) => {
    const city = bolivianCities.find((c) => c.name === cityName)
    if (city) {
      onValueChange?.(cityName)
      onCitySelect?.(city)
      setOpen(false)
      setSearchTerm("")
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedCity ? (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{selectedCity.name}</span>
              <span className="text-xs text-muted-foreground">({selectedCity.department})</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Buscar ciudad..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandGroup>
              {filteredCities.map((city) => (
                <CommandItem
                  key={city.name}
                  value={city.name}
                  onSelect={() => handleSelect(city.name)}
                  className={cn(
                    "flex items-center gap-2 transition-opacity",
                    !city.matchesSearch ? "opacity-50" : "opacity-100"
                  )}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", selectedCity?.name === city.name ? "opacity-100" : "opacity-0")}
                  />
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{city.name}</span>
                    <span className="text-xs text-muted-foreground">{city.department}</span>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    {city.lat.toFixed(4)}, {city.lat.toFixed(4)}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}