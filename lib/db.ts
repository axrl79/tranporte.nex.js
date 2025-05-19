import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "@/db/schema"

// Crear un pool de conexiones a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Crear una instancia de Drizzle con el pool y el esquema
export const db = drizzle(pool, { schema })
