import { db } from "@/server/configs/index.config";
import { settings } from "@/schemas/setting.schema";
import { eq } from "drizzle-orm";

export const settingRepository = {
  async get() {
    const [row] = await db.select().from(settings).limit(1);
    return row || null;
  },

  async create(data: any) {
    const [row] = await db.insert(settings).values(data).returning();
    return row;
  },

  async update(id: string, data: any) {
    const [row] = await db.update(settings).set(data).where(eq(settings.id, id)).returning();
    return row || null;
  },
};
