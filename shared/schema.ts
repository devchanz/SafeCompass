import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender"),
  address: text("address").notNull(),
  language: text("language").notNull().default("ko"),
  accessibility: jsonb("accessibility").$type<string[]>().default([]),
  mobility: text("mobility").notNull(), // 'independent', 'assisted', 'unable'
  createdAt: timestamp("created_at").defaultNow(),
});

export const companions = pgTable("companions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  relationship: text("relationship").notNull(),
});

export const emergencyEvents = pgTable("emergency_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'earthquake', 'fire', etc.
  severity: text("severity").notNull(),
  location: jsonb("location").$type<{lat: number, lng: number}>(),
  situation: jsonb("situation").$type<{
    locationContext: string,
    canMove: boolean,
    additionalInfo?: string
  }>(),
  personalizedGuide: text("personalized_guide"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCompanionSchema = createInsertSchema(companions).omit({
  id: true,
});

export const insertEmergencyEventSchema = createInsertSchema(emergencyEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCompanion = z.infer<typeof insertCompanionSchema>;
export type Companion = typeof companions.$inferSelect;
export type InsertEmergencyEvent = z.infer<typeof insertEmergencyEventSchema>;
export type EmergencyEvent = typeof emergencyEvents.$inferSelect;
