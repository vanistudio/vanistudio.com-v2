import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { settings } from "@/server/db/schemas/setting.schema";
import { users } from "@/server/db/schemas/user.schema";
import { eq } from "drizzle-orm";

export async function checkConfiguration(request: NextRequest): Promise<NextResponse> {
  const url = request.nextUrl;

  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_')) {
    return NextResponse.next();
  }

  try {
    const settingRecord = await db.select().from(settings).limit(1);
    const adminRecord = await db.select().from(users).where(eq(users.role, "admin")).limit(1);
    const isConfigured = settingRecord.length > 0 && adminRecord.length > 0;

    if (url.pathname.startsWith('/configuration')) {
      if (isConfigured) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next();
    }

    if (!isConfigured) {
      return NextResponse.redirect(new URL("/configuration", request.url));
    }
  } catch {
    if (!url.pathname.startsWith('/configuration')) {
      return NextResponse.redirect(new URL("/configuration", request.url));
    }
  }

  return NextResponse.next();
}
