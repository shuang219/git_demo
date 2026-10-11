import { db } from '../db';
import {
  emergencyContacts,
  sosEvents,
  insertEmergencyContactSchema,
  insertSosEventSchema,
  InsertEmergencyContact,
  InsertSosEvent,
} from '../db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

type CreateContactInput = z.infer<typeof insertEmergencyContactSchema>;
type CreateSosInput = z.infer<typeof insertSosEventSchema>;

export class SafetyRepository {
  async listContacts(userId: string) {
    return db
      .select()
      .from(emergencyContacts)
      .where(eq(emergencyContacts.userId, userId))
      .orderBy(desc(emergencyContacts.createdAt));
  }

  async createContact(data: CreateContactInput) {
    const [row] = await db
      .insert(emergencyContacts)
      .values(data as InsertEmergencyContact)
      .returning();
    return row;
  }

  async deleteContact(userId: string, id: string) {
    const result = await db
      .delete(emergencyContacts)
      .where(
        and(eq(emergencyContacts.id, id), eq(emergencyContacts.userId, userId))
      )
      .returning();
    return result.length > 0;
  }

  async listSosEvents(userId: string) {
    return db
      .select()
      .from(sosEvents)
      .where(eq(sosEvents.userId, userId))
      .orderBy(desc(sosEvents.createdAt))
      .limit(10);
  }

  async createSosEvent(data: CreateSosInput) {
    const [row] = await db
      .insert(sosEvents)
      .values(data as InsertSosEvent)
      .returning();
    return row;
  }
}

export const safetyRepository = new SafetyRepository();
