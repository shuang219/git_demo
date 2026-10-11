import { db } from '../db';
import { users, InsertUser, insertUserSchema } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Use Zod-inferred type for repository inputs so routes can pass
// `insertUserSchema.parse(...)` directly without type mismatches.
type CreateUserInput = z.infer<typeof insertUserSchema>;

export class UserRepository {
  async create(userData: CreateUserInput) {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const [user] = await db
      .insert(users)
      // Drizzle expects InsertUser; we trust Zod validation and assert here.
      .values({
        ...userData,
        password: hashedPassword,
      } as InsertUser)
      .returning();

    return user;
  }

  async findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    return user;
  }

  async findAll() {
    return await db.select().from(users);
  }

  async verifyPassword(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateById(id: string, updates: { name?: string; email?: string; password?: string }) {
    const payload: Record<string, string> = {};
    if (updates.name !== undefined) payload['name'] = updates.name;
    if (updates.email !== undefined) payload['email'] = updates.email;
    if (updates.password !== undefined) payload['password'] = await bcrypt.hash(updates.password, 12);

    const [updated] = await db
      .update(users)
      .set(payload as Partial<InsertUser>)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }
}
export const userRepository = new UserRepository();
