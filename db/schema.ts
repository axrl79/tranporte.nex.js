import { pgTable, text, varchar, timestamp, boolean, pgEnum, integer, decimal } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"

// Enum para roles de usuario
export const userRoleEnum = pgEnum("user_role", ["admin", "operador", "conductor", "almacenista"])

// Enum para estados de vehículos
export const vehicleStatusEnum = pgEnum("vehicle_status", ["disponible", "en_ruta", "mantenimiento", "inactivo"])

// Enum para tipos de vehículos
export const vehicleTypeEnum = pgEnum("vehicle_type", ["camion", "trailer", "cisterna", "furgon", "otro"])

// Enum para tipos de movimiento de inventario
export const movementTypeEnum = pgEnum("movement_type", ["entrada", "salida", "ajuste", "transferencia"])

// Enum para estados de carga
export const loadStatusEnum = pgEnum("load_status", [
  "pendiente",
  "en_proceso",
  "cargado",
  "en_transito",
  "descargado",
  "completado",
])

// Enum para tipos de producto
export const productTypeEnum = pgEnum("product_type", [
  "liquido",
  "solido",
  "fragil",
  "peligroso",
  "perecedero",
  "general",
])

// ===== ENUMS ADICIONALES =====

// Enum para tipos de contrato
export const contractTypeEnum = pgEnum("contract_type", ["servicio", "kilometraje", "peso", "tiempo", "mixto"])

// Enum para estados de factura
export const invoiceStatusEnum = pgEnum("invoice_status", ["borrador", "enviada", "pagada", "vencida", "cancelada"])

// Enum para tipos de pago
export const paymentTypeEnum = pgEnum("payment_type", ["efectivo", "transferencia", "cheque", "tarjeta"])

// Enum para estados de pago
export const paymentStatusEnum = pgEnum("payment_status", ["pendiente", "procesando", "completado", "fallido"])

// Enum para tipos de empleado
export const employeeTypeEnum = pgEnum("employee_type", [
  "conductor",
  "mecanico",
  "administrativo",
  "supervisor",
  "gerente",
])

// Enum para estados de empleado
export const employeeStatusEnum = pgEnum("employee_status", [
  "activo",
  "inactivo",
  "vacaciones",
  "licencia",
  "suspendido",
])

// Enum para tipos de documento
export const documentTypeEnum = pgEnum("document_type", [
  "licencia",
  "cedula",
  "pasaporte",
  "certificado",
  "contrato",
  "otro",
])

// Enum para tipos de asistencia
export const attendanceTypeEnum = pgEnum("attendance_type", ["entrada", "salida", "descanso_inicio", "descanso_fin"])

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

// ===== NUEVAS TABLAS PARA ALMACÉN Y CARGA =====

// Tabla de productos
export const products = pgTable("products", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: productTypeEnum("type").notNull(),
  unit: varchar("unit", { length: 20 }).notNull(), // kg, L, unidad, etc.
  unitWeight: decimal("unit_weight"), // peso por unidad en kg
  unitVolume: decimal("unit_volume"), // volumen por unidad en m³
  minStock: decimal("min_stock").default("0").notNull(),
  maxStock: decimal("max_stock"),
  currentStock: decimal("current_stock").default("0").notNull(),
  reservedStock: decimal("reserved_stock").default("0").notNull(),
  availableStock: decimal("available_stock").default("0").notNull(),
  location: varchar("location", { length: 100 }), // ubicación en almacén
  qrCode: text("qr_code").unique(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Tabla de movimientos de inventario
export const inventoryMovements = pgTable("inventory_movements", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  type: movementTypeEnum("type").notNull(),
  quantity: decimal("quantity").notNull(),
  unitCost: decimal("unit_cost"),
  totalCost: decimal("total_cost"),
  reason: text("reason").notNull(),
  reference: varchar("reference", { length: 100 }), // número de factura, orden, etc.
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  loadId: text("load_id").references(() => loads.id), // si está relacionado con una carga
  previousStock: decimal("previous_stock").notNull(),
  newStock: decimal("new_stock").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  notes: text("notes"),
})

// Tabla de cargas
export const loads = pgTable("loads", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  code: varchar("code", { length: 50 }).notNull().unique(),
  tripId: text("trip_id").references(() => trips.id),
  vehicleId: text("vehicle_id").references(() => vehicles.id),
  status: loadStatusEnum("status").notNull().default("pendiente"),
  totalWeight: decimal("total_weight").default("0").notNull(),
  totalVolume: decimal("total_volume").default("0").notNull(),
  totalValue: decimal("total_value").default("0").notNull(),
  loadingDate: timestamp("loading_date"),
  unloadingDate: timestamp("unloading_date"),
  loadingUserId: text("loading_user_id").references(() => users.id),
  unloadingUserId: text("unloading_user_id").references(() => users.id),
  origin: varchar("origin", { length: 255 }),
  destination: varchar("destination", { length: 255 }),
  client: varchar("client", { length: 255 }),
  notes: text("notes"),
  qrCode: text("qr_code").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Tabla de items de carga
export const loadItems = pgTable("load_items", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  loadId: text("load_id")
    .notNull()
    .references(() => loads.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  quantity: decimal("quantity").notNull(),
  weight: decimal("weight").notNull(),
  volume: decimal("volume").notNull(),
  unitValue: decimal("unit_value"),
  totalValue: decimal("total_value"),
  loaded: boolean("loaded").default(false).notNull(),
  unloaded: boolean("unloaded").default(false).notNull(),
  loadedAt: timestamp("loaded_at"),
  unloadedAt: timestamp("unloaded_at"),
  notes: text("notes"),
})

// Tabla de checklists de carga/descarga
export const loadChecklists = pgTable("load_checklists", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  loadId: text("load_id")
    .notNull()
    .references(() => loads.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(), // "loading" o "unloading"
  itemName: varchar("item_name", { length: 255 }).notNull(),
  description: text("description"),
  required: boolean("required").default(true).notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  completedBy: text("completed_by").references(() => users.id),
  notes: text("notes"),
  order: integer("order").default(0).notNull(),
})

// Tabla de escaneos QR
export const qrScans = pgTable("qr_scans", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  qrCode: text("qr_code").notNull(),
  scannedBy: text("scanned_by")
    .notNull()
    .references(() => users.id),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // "product", "load", etc.
  entityId: text("entity_id").notNull(),
  action: varchar("action", { length: 50 }).notNull(), // "view", "load", "unload", etc.
  location: varchar("location", { length: 255 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: text("metadata"), // JSON con información adicional
})

// ===== NUEVAS TABLAS PARA ADMINISTRACIÓN GENERAL =====

// Tabla de clientes
export const clients = pgTable("clients", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  businessName: varchar("business_name", { length: 255 }),
  taxId: varchar("tax_id", { length: 50 }).unique(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Bolivia"),
  contactPerson: varchar("contact_person", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  creditLimit: decimal("credit_limit").default("0"),
  currentBalance: decimal("current_balance").default("0"),
  paymentTerms: integer("payment_terms").default(30), // días
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Tabla de contratos
export const contracts = pgTable("contracts", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  code: varchar("code", { length: 50 }).notNull().unique(),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  type: contractTypeEnum("type").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  baseRate: decimal("base_rate").notNull(), // tarifa base
  kmRate: decimal("km_rate"), // tarifa por km
  weightRate: decimal("weight_rate"), // tarifa por peso
  timeRate: decimal("time_rate"), // tarifa por tiempo
  minimumCharge: decimal("minimum_charge"),
  currency: varchar("currency", { length: 10 }).default("BOB"),
  terms: text("terms"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Tabla de facturas
export const invoices = pgTable("invoices", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  number: varchar("number", { length: 50 }).notNull().unique(),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id),
  contractId: text("contract_id").references(() => contracts.id),
  tripId: text("trip_id").references(() => trips.id),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: invoiceStatusEnum("status").notNull().default("borrador"),
  subtotal: decimal("subtotal").notNull(),
  taxAmount: decimal("tax_amount").default("0"),
  discountAmount: decimal("discount_amount").default("0"),
  totalAmount: decimal("total_amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("BOB"),
  notes: text("notes"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Tabla de items de factura
export const invoiceItems = pgTable("invoice_items", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  description: varchar("description", { length: 255 }).notNull(),
  quantity: decimal("quantity").notNull(),
  unitPrice: decimal("unit_price").notNull(),
  totalPrice: decimal("total_price").notNull(),
  taxRate: decimal("tax_rate").default("0"),
  order: integer("order").default(0),
})

// Tabla de pagos
export const payments = pgTable("payments", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  code: varchar("code", { length: 50 }).notNull().unique(),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id),
  invoiceId: text("invoice_id").references(() => invoices.id),
  type: paymentTypeEnum("type").notNull(),
  status: paymentStatusEnum("status").notNull().default("pendiente"),
  amount: decimal("amount").notNull(),
  currency: varchar("currency", { length: 10 }).default("BOB"),
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
  reference: varchar("reference", { length: 100 }),
  notes: text("notes"),
  processedBy: text("processed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// ===== NUEVAS TABLAS PARA RECURSOS HUMANOS =====

// Tabla de empleados
export const employees = pgTable("employees", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  code: varchar("code", { length: 50 }).notNull().unique(),
  userId: text("user_id").references(() => users.id), // vinculación opcional con usuarios del sistema
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  birthDate: timestamp("birth_date"),
  hireDate: timestamp("hire_date").notNull(),
  terminationDate: timestamp("termination_date"),
  type: employeeTypeEnum("type").notNull(),
  status: employeeStatusEnum("status").notNull().default("activo"),
  position: varchar("position", { length: 100 }).notNull(),
  department: varchar("department", { length: 100 }),
  salary: decimal("salary"),
  emergencyContact: varchar("emergency_contact", { length: 255 }),
  emergencyPhone: varchar("emergency_phone", { length: 50 }),
  notes: text("notes"),
  photo: text("photo"), // URL de la foto
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Tabla de documentos de empleados
export const employeeDocuments = pgTable("employee_documents", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  type: documentTypeEnum("type").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  number: varchar("number", { length: 100 }),
  issueDate: timestamp("issue_date"),
  expiryDate: timestamp("expiry_date"),
  issuingAuthority: varchar("issuing_authority", { length: 255 }),
  fileUrl: text("file_url"),
  verified: boolean("verified").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Tabla de asistencias
export const attendances = pgTable("attendances", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  type: attendanceTypeEnum("type").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  location: varchar("location", { length: 255 }),
  latitude: decimal("latitude"),
  longitude: decimal("longitude"),
  notes: text("notes"),
  verifiedBy: text("verified_by").references(() => users.id),
  tripId: text("trip_id").references(() => trips.id), // si está relacionado con un viaje
})

// Tabla de turnos
export const shifts = pgTable("shifts", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  breakDuration: integer("break_duration").default(0), // minutos
  totalHours: decimal("total_hours"),
  overtimeHours: decimal("overtime_hours").default("0"),
  status: varchar("status", { length: 50 }).default("programado"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Tabla de evaluaciones de desempeño
export const performanceEvaluations = pgTable("performance_evaluations", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  evaluatorId: text("evaluator_id")
    .notNull()
    .references(() => users.id),
  period: varchar("period", { length: 50 }).notNull(), // "2024-Q1", "2024-01", etc.
  evaluationDate: timestamp("evaluation_date").defaultNow().notNull(),
  punctualityScore: integer("punctuality_score"), // 1-10
  safetyScore: integer("safety_score"), // 1-10
  efficiencyScore: integer("efficiency_score"), // 1-10
  customerServiceScore: integer("customer_service_score"), // 1-10
  overallScore: decimal("overall_score"), // promedio
  strengths: text("strengths"),
  areasForImprovement: text("areas_for_improvement"),
  goals: text("goals"),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Tabla de estadísticas de conductores
export const driverStats = pgTable("driver_stats", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  period: varchar("period", { length: 20 }).notNull(), // "2024-01", "2024-Q1", "2024"
  totalTrips: integer("total_trips").default(0),
  completedTrips: integer("completed_trips").default(0),
  cancelledTrips: integer("cancelled_trips").default(0),
  totalKm: decimal("total_km").default("0"),
  totalHours: decimal("total_hours").default("0"),
  fuelEfficiency: decimal("fuel_efficiency"), // km/L promedio
  onTimeDeliveries: integer("on_time_deliveries").default(0),
  lateDeliveries: integer("late_deliveries").default(0),
  incidentsCount: integer("incidents_count").default(0),
  customerRating: decimal("customer_rating"), // promedio de calificaciones
  restDays: integer("rest_days").default(0),
  overtimeHours: decimal("overtime_hours").default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Relaciones existentes
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  activities: many(userActivity),
  tripsAsDriver: many(trips, { relationName: "driver" }),
  maintenancesAsTechnician: many(maintenances, { relationName: "technician" }),
  inventoryMovements: many(inventoryMovements),
  loadingOperations: many(loads, { relationName: "loadingUser" }),
  unloadingOperations: many(loads, { relationName: "unloadingUser" }),
  checklistCompletions: many(loadChecklists),
  qrScans: many(qrScans),
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
  loads: many(loads),
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
  loads: many(loads),
  employeeDriver: one(employees, {
    fields: [trips.driverId],
    references: [employees.userId],
    relationName: "employeeDriver",
  }),
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

// Nuevas relaciones para almacén y carga
export const productsRelations = relations(products, ({ many }) => ({
  inventoryMovements: many(inventoryMovements),
  loadItems: many(loadItems),
}))

export const inventoryMovementsRelations = relations(inventoryMovements, ({ one }) => ({
  product: one(products, {
    fields: [inventoryMovements.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [inventoryMovements.userId],
    references: [users.id],
  }),
  load: one(loads, {
    fields: [inventoryMovements.loadId],
    references: [loads.id],
  }),
}))

export const loadsRelations = relations(loads, ({ one, many }) => ({
  trip: one(trips, {
    fields: [loads.tripId],
    references: [trips.id],
  }),
  vehicle: one(vehicles, {
    fields: [loads.vehicleId],
    references: [vehicles.id],
  }),
  loadingUser: one(users, {
    fields: [loads.loadingUserId],
    references: [users.id],
    relationName: "loadingUser",
  }),
  unloadingUser: one(users, {
    fields: [loads.unloadingUserId],
    references: [users.id],
    relationName: "unloadingUser",
  }),
  items: many(loadItems),
  checklists: many(loadChecklists),
  inventoryMovements: many(inventoryMovements),
}))

export const loadItemsRelations = relations(loadItems, ({ one }) => ({
  load: one(loads, {
    fields: [loadItems.loadId],
    references: [loads.id],
  }),
  product: one(products, {
    fields: [loadItems.productId],
    references: [products.id],
  }),
}))

export const loadChecklistsRelations = relations(loadChecklists, ({ one }) => ({
  load: one(loads, {
    fields: [loadChecklists.loadId],
    references: [loads.id],
  }),
  completedByUser: one(users, {
    fields: [loadChecklists.completedBy],
    references: [users.id],
  }),
}))

export const qrScansRelations = relations(qrScans, ({ one }) => ({
  scannedByUser: one(users, {
    fields: [qrScans.scannedBy],
    references: [users.id],
  }),
}))

// Relaciones para administración
export const clientsRelations = relations(clients, ({ many }) => ({
  contracts: many(contracts),
  invoices: many(invoices),
  payments: many(payments),
}))

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  client: one(clients, {
    fields: [contracts.clientId],
    references: [clients.id],
  }),
  invoices: many(invoices),
}))

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  contract: one(contracts, {
    fields: [invoices.contractId],
    references: [contracts.id],
  }),
  trip: one(trips, {
    fields: [invoices.tripId],
    references: [trips.id],
  }),
  items: many(invoiceItems),
  payments: many(payments),
}))

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  client: one(clients, {
    fields: [payments.clientId],
    references: [clients.id],
  }),
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  processedByUser: one(users, {
    fields: [payments.processedBy],
    references: [users.id],
  }),
}))

// Relaciones para RRHH
export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  documents: many(employeeDocuments),
  attendances: many(attendances),
  shifts: many(shifts),
  evaluations: many(performanceEvaluations),
  stats: many(driverStats),
  tripsAsDriver: many(trips, { relationName: "employeeDriver" }),
}))

export const employeeDocumentsRelations = relations(employeeDocuments, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeDocuments.employeeId],
    references: [employees.id],
  }),
}))

export const attendancesRelations = relations(attendances, ({ one }) => ({
  employee: one(employees, {
    fields: [attendances.employeeId],
    references: [employees.id],
  }),
  verifiedByUser: one(users, {
    fields: [attendances.verifiedBy],
    references: [users.id],
  }),
  trip: one(trips, {
    fields: [attendances.tripId],
    references: [trips.id],
  }),
}))

export const shiftsRelations = relations(shifts, ({ one }) => ({
  employee: one(employees, {
    fields: [shifts.employeeId],
    references: [employees.id],
  }),
}))

export const performanceEvaluationsRelations = relations(performanceEvaluations, ({ one }) => ({
  employee: one(employees, {
    fields: [performanceEvaluations.employeeId],
    references: [employees.id],
  }),
  evaluator: one(users, {
    fields: [performanceEvaluations.evaluatorId],
    references: [users.id],
  }),
}))

export const driverStatsRelations = relations(driverStats, ({ one }) => ({
  employee: one(employees, {
    fields: [driverStats.employeeId],
    references: [employees.id],
  }),
}))
