import { pgTable, text, varchar, timestamp, boolean, pgEnum, integer, decimal } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

// Enum para roles de usuario
export const userRoleEnum = pgEnum("user_role", ["admin", "operador", "conductor"])

// Enum para estados de vehículos
export const vehicleStatusEnum = pgEnum("vehicle_status", ["disponible", "en_ruta", "mantenimiento", "inactivo"])

// Enum para tipos de vehículos
export const vehicleTypeEnum = pgEnum("vehicle_type", ["camion", "trailer", "cisterna", "furgon", "otro"])

// Tabla de usuarios
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("operador"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  active: boolean("active").default(true).notNull(),
  lastLogin: timestamp("last_login"),
})

// Tabla de sesiones
export const sessions = pgTable("sessions", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Tabla de actividad de usuarios
export const userActivity = pgTable("user_activity", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  module: varchar("module", { length: 100 }).notNull(),
  details: text("details"),
  ipAddress: varchar("ip_address", { length: 50 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
})

// Tabla de vehículos
export const vehicles = pgTable("vehicles", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  plateNumber: varchar("plate_number", { length: 20 }).notNull().unique(),
  type: vehicleTypeEnum("type").notNull(),
  brand: varchar("brand", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  capacity: decimal("capacity").notNull(),
  status: vehicleStatusEnum("status").notNull().default("disponible"),
  lastMaintenance: timestamp("last_maintenance"),
  nextMaintenance: timestamp("next_maintenance"),
  fuelType: varchar("fuel_type", { length: 50 }).notNull(),
  fuelCapacity: decimal("fuel_capacity").notNull(),
  currentFuelLevel: decimal("current_fuel_level"),
  totalKm: decimal("total_km").default("0").notNull(),
  lastLocationLat: decimal("last_location_lat"),
  lastLocationLng: decimal("last_location_lng"),
  lastLocationTimestamp: timestamp("last_location_timestamp"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  active: boolean("active").default(true).notNull(),
})

// Tabla de rutas
export const routes = pgTable("routes", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  originName: varchar("origin_name", { length: 255 }).notNull(),
  originLat: decimal("origin_lat").notNull(),
  originLng: decimal("origin_lng").notNull(),
  destinationName: varchar("destination_name", { length: 255 }).notNull(),
  destinationLat: decimal("destination_lat").notNull(),
  destinationLng: decimal("destination_lng").notNull(),
  distance: decimal("distance").notNull(), // en kilómetros
  estimatedDuration: integer("estimated_duration").notNull(), // en minutos
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  active: boolean("active").default(true).notNull(),
})

// Tabla de viajes
export const trips = pgTable("trips", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  vehicleId: text("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  driverId: text("driver_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  routeId: text("route_id")
    .notNull()
    .references(() => routes.id, { onDelete: "cascade" }),
  scheduledStart: timestamp("scheduled_start").notNull(),
  scheduledEnd: timestamp("scheduled_end").notNull(),
  actualStart: timestamp("actual_start"),
  actualEnd: timestamp("actual_end"),
  status: varchar("status", { length: 50 }).notNull().default("programado"),
  cargo: text("cargo").notNull(),
  cargoWeight: decimal("cargo_weight"), // en toneladas
  notes: text("notes"),
  fuelConsumed: decimal("fuel_consumed"),
  kmTraveled: decimal("km_traveled"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Tabla de ubicaciones de viaje (para tracking)
export const tripLocations = pgTable("trip_locations", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  tripId: text("trip_id")
    .notNull()
    .references(() => trips.id, { onDelete: "cascade" }),
  latitude: decimal("latitude").notNull(),
  longitude: decimal("longitude").notNull(),
  speed: decimal("speed"),
  heading: decimal("heading"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
})

// Tabla de mantenimientos
export const maintenances = pgTable("maintenances", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  vehicleId: text("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 100 }).notNull(),
  description: text("description").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  completedDate: timestamp("completed_date"),
  cost: decimal("cost"),
  technicianId: text("technician_id").references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default("programado"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Relaciones
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  activities: many(userActivity),
  tripsAsDriver: many(trips, { relationName: "driver" }),
  maintenancesAsTechnician: many(maintenances, { relationName: "technician" }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const userActivityRelations = relations(userActivity, ({ one }) => ({
  user: one(users, {
    fields: [userActivity.userId],
    references: [users.id],
  }),
}))

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  trips: many(trips),
  maintenances: many(maintenances),
}))

export const routesRelations = relations(routes, ({ many }) => ({
  trips: many(trips),
}))

export const tripsRelations = relations(trips, ({ one, many }) => ({
  vehicle: one(vehicles, {
    fields: [trips.vehicleId],
    references: [vehicles.id],
  }),
  driver: one(users, {
    fields: [trips.driverId],
    references: [users.id],
    relationName: "driver",
  }),
  route: one(routes, {
    fields: [trips.routeId],
    references: [routes.id],
  }),
  locations: many(tripLocations),
}))

export const tripLocationsRelations = relations(tripLocations, ({ one }) => ({
  trip: one(trips, {
    fields: [tripLocations.tripId],
    references: [trips.id],
  }),
}))

export const maintenancesRelations = relations(maintenances, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [maintenances.vehicleId],
    references: [vehicles.id],
  }),
  technician: one(users, {
    fields: [maintenances.technicianId],
    references: [users.id],
    relationName: "technician",
  }),
}))
