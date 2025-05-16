import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Validación de URL
if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL no definida en .env.local");
}

// Crear pool de conexión
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Crear instancia de drizzle
export const db = drizzle(pool, { schema });
export { pool };
