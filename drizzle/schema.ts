import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Debt Smart Forge Tables
export const clients = mysqlTable("clients", {
  id: varchar("id", { length: 36 }).primaryKey(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: varchar("email", { length: 320 }),
  company: text("company"),
  address: text("address"),
  accountType: varchar("account_type", { length: 50 }).default("Active"),
  promiseStatus: varchar("promise_status", { length: 50 }),
  attachmentUrl: text("attachment_url"),
  attachmentName: text("attachment_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const loans = mysqlTable("loans", {
  id: varchar("id", { length: 36 }).primaryKey(),
  clientId: varchar("client_id", { length: 36 }).notNull(),
  loanType: text("loan_type"),
  loanNumber: text("loan_number"),
  emi: text("emi"),
  bucket: text("bucket"),
  balance: text("balance"),
  amountDue: text("amount_due"),
  accountType: varchar("account_type", { length: 50 }).default("Active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const osintResults = mysqlTable("osint_results", {
  id: varchar("id", { length: 36 }).primaryKey(),
  clientId: varchar("client_id", { length: 36 }),
  photoUrl: text("photo_url"),
  visualMatches: text("visual_matches"),
  webResults: text("web_results"),
  summary: text("summary"),
  socialMedia: text("social_media"),
  workplaceInfo: text("workplace_info"),
  confidenceScore: text("confidence_score").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const calls = mysqlTable("calls", {
  id: varchar("id", { length: 36 }).primaryKey(),
  clientId: varchar("client_id", { length: 36 }),
  result: text("result"),
  note: text("note"),
  durationSeconds: int("duration_seconds"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const promises = mysqlTable("promises", {
  id: varchar("id", { length: 36 }).primaryKey(),
  clientId: varchar("client_id", { length: 36 }),
  amount: text("amount"),
  dueDate: text("due_date"),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLogs = mysqlTable("activity_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  clientId: varchar("client_id", { length: 36 }),
  action: text("action").notNull(),
  detail: text("detail"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Types
export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;
export type Loan = typeof loans.$inferSelect;
export type InsertLoan = typeof loans.$inferInsert;
export type OSINTResult = typeof osintResults.$inferSelect;
export type InsertOSINTResult = typeof osintResults.$inferInsert;
export type Call = typeof calls.$inferSelect;
export type InsertCall = typeof calls.$inferInsert;
export type Promise = typeof promises.$inferSelect;
export type InsertPromise = typeof promises.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;
