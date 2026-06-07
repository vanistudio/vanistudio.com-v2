import { cookies } from "next/headers";
import { db } from "@/server/db";
import { userSession, users } from "@/server/db/schemas/user.schema";
import { eq } from "drizzle-orm";

export async function getServerSession(_force: boolean = false) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("better-auth.session-token")?.value;
    if (!token) return { user: null };

    const sessionRecord = await db
      .select()
      .from(userSession)
      .where(eq(userSession.token, token))
      .limit(1);

    if (sessionRecord.length === 0 || new Date() > new Date(sessionRecord[0].expiresAt)) {
      return { user: null };
    }

    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.id, sessionRecord[0].userId))
      .limit(1);

    return { user: userRecord.length > 0 ? userRecord[0] : null };
  } catch {
    return { user: null };
  }
}
