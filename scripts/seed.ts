import { seed } from "../lib/seed"

// Ejecutar la función de siembra
seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error al sembrar la base de datos:", error)
    process.exit(1)
  })
