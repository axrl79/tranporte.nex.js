import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",        
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.PGHOST!,
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
    user: process.env.PGUSER!,
    password: process.env.PGPASSWORD!,
    database: process.env.PGDATABASE!,
    // ssl: true, // Uncomment if SSL is required
  },
} satisfies Config;