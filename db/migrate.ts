// db/migrate.ts
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });


dotenv.config(); 

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function runMigrations() {
  try {
    console.log("⏳ Ejecutando migraciones...");
    await migrate(db, { migrationsFolder: "drizzle/migrations" });
    console.log("✅ Migraciones completadas exitosamente");
  } catch (error) {
    console.error("❌ Error al ejecutar migraciones:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
