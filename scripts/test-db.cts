import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // Asegúrate de que esté en la raíz

import { Pool } from "pg";

// Verifica si la variable está definida
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL no definida en .env.local");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ Conectado a PostgreSQL correctamente");

    const res = await client.query("SELECT NOW()");
    console.log("🕒 Fecha actual desde la DB:", res.rows[0]);

    client.release();
    await pool.end(); // Cierra el pool
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al conectar con PostgreSQL:", error);
    process.exit(1);
  }
}

testConnection();
