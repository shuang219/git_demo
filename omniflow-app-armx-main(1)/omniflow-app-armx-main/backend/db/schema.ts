// AUTO-GENERATED: backend/db/schema.ts
// This file is assembled from installed capability schema pieces.

import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// ============================================
// Users Table
// ============================================
export const users = pgTable('Users', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Auto-generate insert schema from table, override custom validation only
export const insertUserSchema = createInsertSchema(users, {
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Update schema - all fields optional
export const updateUserSchema = insertUserSchema.partial();

// Login schema - define explicitly to avoid brittle pick() masks when user fields change
export const loginUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Signup schema - define explicitly so auth stays stable even if insertUserSchema changes
export const signupUserSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .min(6, 'Confirm password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type SignupUserInput = z.infer<typeof signupUserSchema>;

// ============================================
// Emergency Contacts Table
// ============================================
export const emergencyContacts = pgTable('emergency_contacts', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  relationship: text('relationship').default('家人').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertEmergencyContactSchema = createInsertSchema(
  emergencyContacts,
  {
    name: z.string().min(1, '请输入联系人姓名').max(50),
    phone: z
      .string()
      .regex(/^[0-9+\-\s]{6,20}$/, '请输入有效的电话号码'),
    relationship: z.string().min(1).max(20),
  }
);

export const createContactRequestSchema = z.object({
  name: z.string().trim().min(1, '请输入联系人姓名').max(50),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{6,20}$/, '请输入有效的电话号码'),
  relationship: z.string().trim().min(1).max(20),
});

// ============================================
// SOS Events Table
// ============================================
export const sosEvents = pgTable('sos_events', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`)
    .notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  latitude: text('latitude'),
  longitude: text('longitude'),
  contactCount: integer('contact_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertSosEventSchema = createInsertSchema(sosEvents, {
  message: z.string().min(1).max(300),
});

export const createSosRequestSchema = z.object({
  message: z.string().trim().max(300).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export type EmergencyContactRow = typeof emergencyContacts.$inferSelect;
export type InsertEmergencyContact = typeof emergencyContacts.$inferInsert;
export type SosEventRow = typeof sosEvents.$inferSelect;
export type InsertSosEvent = typeof sosEvents.$inferInsert;
