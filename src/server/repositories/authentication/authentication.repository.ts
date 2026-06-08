import { db } from "@/server/db";
import { users, provider } from "@/server/db/schemas/user.schema";
import { eq, or } from "drizzle-orm";

export class AuthenticationRepository {
  async findUserByIdentity(identity: string) {
    const result = await db
      .select()
      .from(users)
      .where(or(eq(users.email, identity), eq(users.username, identity)))
      .limit(1);
    return result[0] || null;
  }

  async getPasswordHash(userId: string) {
    const result = await db
      .select()
      .from(provider)
      .where(eq(provider.userId, userId))
      .limit(1);
    return result[0]?.password || null;
  }
}

export const authenticationRepository = new AuthenticationRepository();
