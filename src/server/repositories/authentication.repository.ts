import { db } from "@/server/db";
import { users, provider, userProfile } from "@/server/db/schemas/user.schema";
import { eq, or } from "drizzle-orm";

export class AuthenticationRepository {
  async findUserByIdentity(identity: string) {
    const result = await db
      .select({
        user: users
      })
      .from(users)
      .leftJoin(userProfile, eq(users.id, userProfile.userId))
      .where(
        or(
          eq(users.email, identity),
          eq(users.username, identity),
          eq(userProfile.phone, identity)
        )
      )
      .limit(1);
    return result[0]?.user || null;
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
