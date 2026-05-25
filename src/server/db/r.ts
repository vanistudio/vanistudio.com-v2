import { relations } from "drizzle-orm";
import { users, userSession, provider, userProfile } from "@/server/db/schemas/user.schema";

export const userRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfile, {
    fields: [users.id],
    references: [userProfile.userId],
  }),
  sessions: many(userSession),
  providers: many(provider),
}));

export const userSessionRelations = relations(userSession, ({ one }) => ({
  user: one(users, {
    fields: [userSession.userId],
    references: [users.id],
  }),
}));

export const providerRelations = relations(provider, ({ one }) => ({
  user: one(users, {
    fields: [provider.userId],
    references: [users.id],
  }),
}));

export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(users, {
    fields: [userProfile.userId],
    references: [users.id],
  }),
}));
