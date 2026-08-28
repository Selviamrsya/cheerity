import {
  uuid,
  varchar,
  text,
  boolean,
  pgTable,
  pgEnum,
  date,
  timestamp,
} from "drizzle-orm/pg-core";

// ─── Enums ──────────────────────────────────────────────────────────────────

export const STATUS_ENUM = pgEnum("status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const ROLE_ENUM = pgEnum("role", [
  "USER",
  "INSTITUTION",
  "ADMIN",
]);

// ─── Users Table ────────────────────────────────────────────────────────────
// Stores individual donors who sign up via the User registration form.

export const users = pgTable("users", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  birthdate: date("birthdate"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  zipCode: varchar("zip_code", { length: 20 }),
  address: text("address"),
  role: ROLE_ENUM("role").default("USER"),
  status: STATUS_ENUM("status").default("APPROVED"),
  lastActivityDate: date("last_activity_date").defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─── Institutions Table ─────────────────────────────────────────────────────
// Stores charity organisations / NGOs who sign up via the Institution registration form.
// Their status starts as PENDING until an admin reviews the verification evidence.

export const institutions = pgTable("institutions", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  institutionName: varchar("institution_name", { length: 255 }).notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  zipCode: varchar("zip_code", { length: 20 }),
  address: text("address"),
  verificationEvidence: text("verification_evidence"), // URL / file path of uploaded proof
  hasPickupService: boolean("has_pickup_service").default(false),
  websiteOrSocial: text("website_or_social"),
  description: text("description"),
  status: STATUS_ENUM("status").default("PENDING"),
  lastActivityDate: date("last_activity_date").defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─── Donations Table ────────────────────────────────────────────────────────
// Campaigns created by approved institutions, asking donors for specific items.

export const donations = pgTable("donations", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  institutionId: uuid("institution_id")
    .notNull()
    .references(() => institutions.id),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  cover: text("cover"), // Cover image URL
  target: varchar("target", { length: 50 }), // e.g. "50" items
  collected: varchar("collected", { length: 50 }).default("0"),
  status: STATUS_ENUM("status").default("PENDING"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});