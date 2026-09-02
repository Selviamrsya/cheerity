import {
  uuid,
  varchar,
  text,
  boolean,
  integer,
  doublePrecision,
  pgTable,
  pgEnum,
  date,
  timestamp,
} from "drizzle-orm/pg-core";

// Enums

export const STATUS_ENUM = pgEnum("status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const ROLE_ENUM = pgEnum("role", ["USER", "INSTITUTION", "ADMIN"]);

export const DONATION_CAMPAIGN_STATUS = pgEnum("donation_campaign_status", [
  "ACTIVE",
  "COMPLETED",
]);

export const DONATION_REQUEST_STATUS = pgEnum("donation_request_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ON_PROGRESS",
  "ARRIVED",
  "COMPLETED",
]);

// Users table - stores individual donors

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
  // Coordinates geocoded from address via Nominatim
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  role: ROLE_ENUM("role").default("USER"),
  status: STATUS_ENUM("status").default("APPROVED"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Institutions table - stores charity organizations / NGOs
// hasPickupService moved to per-donation level (donations table)

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
  // Coordinates geocoded from address via Nominatim
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  verificationEvidence: text("verification_evidence"),
  websiteOrSocial: text("website_or_social"),
  description: text("description"),
  // Starts as PENDING until admin approves
  status: STATUS_ENUM("status").default("PENDING"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Donations table - donation campaigns created by institutions

export const donations = pgTable("donations", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  institutionId: uuid("institution_id")
    .notNull()
    .references(() => institutions.id),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  cover: text("cover"),
  // How many items needed total
  target: integer("target").notNull(),
  // How many items collected so far
  collected: integer("collected").default(0).notNull(),
  // Comma-separated: self_delivery, third_party_courier, pickup_by_institution
  deliveryMethods: text("delivery_methods").array().notNull(),
  // Whether institution offers pickup service for this donation campaign
  hasPickupService: boolean("has_pickup_service").default(false),
  // Max distance in km institution will travel for pickup (null if no pickup)
  pickupMaxDistanceKm: integer("pickup_max_distance_km"),
  status: DONATION_CAMPAIGN_STATUS("status").default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Donate records - individual donation requests submitted by users

export const donateRecords = pgTable("donate_records", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  donationId: uuid("donation_id")
    .notNull()
    .references(() => donations.id),
  // Donor info (copied from user profile at time of request)
  donorName: varchar("donor_name", { length: 255 }),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  zipCode: varchar("zip_code", { length: 20 }),
  address: text("address"),
  // Donation details
  quantity: integer("quantity").notNull(),
  notes: text("notes"),
  donorPhoto: text("donor_photo"),
  deliveryMethod: varchar("delivery_method", { length: 50 }).notNull(),
  estimatedPickupDate: date("estimated_pickup_date"),
  estimatedPickupTime: varchar("estimated_pickup_time", { length: 20 }),
  // Status tracking
  status: DONATION_REQUEST_STATUS("status").default("PENDING").notNull(),
  arrivalProofPhoto: text("arrival_proof_photo"),
  rejectionReason: text("rejection_reason"),
  // Timestamps for each status transition
  requestDate: timestamp("request_date", { withTimezone: true }).defaultNow(),
  approvalDate: timestamp("approval_date", { withTimezone: true }),
  deliveryDate: timestamp("delivery_date", { withTimezone: true }),
  arrivedDate: timestamp("arrived_date", { withTimezone: true }),
  completedDate: timestamp("completed_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Notifications - web notifications for users and institutions

export const notifications = pgTable("notifications", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  // ID of the user or institution receiving this notification
  recipientId: uuid("recipient_id").notNull(),
  // 'USER' or 'INSTITUTION'
  recipientType: varchar("recipient_type", { length: 20 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  // e.g. 'REQUEST_APPROVED', 'REQUEST_REJECTED', 'NEW_REQUEST', 'ARRIVED'
  type: varchar("type", { length: 50 }).notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  // Related donate record ID
  relatedId: uuid("related_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});