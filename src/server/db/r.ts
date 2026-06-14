import { relations } from "drizzle-orm";
import { users, userSession, provider, userProfile } from "@/server/db/schemas/user.schema";
import { menus, menuGroups } from "@/server/db/schemas/menu.schema";
import { services, servicePackages, serviceRequests, serviceTypes } from "@/server/db/schemas/service.schema";
import { projects } from "@/server/db/schemas/project.schema";
import { blogs, blogComments } from "@/server/db/schemas/blog.schema";

export const userRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfile, {
    fields: [users.id],
    references: [userProfile.userId],
  }),
  sessions: many(userSession),
  providers: many(provider),
  serviceRequests: many(serviceRequests),
  blogComments: many(blogComments),
  blogs: many(blogs),
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

export const menuGroupRelations = relations(menuGroups, ({ many }) => ({
  items: many(menus),
}));

export const menuRelations = relations(menus, ({ one, many }) => ({
  group: one(menuGroups, {
    fields: [menus.groupId],
    references: [menuGroups.id],
  }),
  parent: one(menus, {
    fields: [menus.parentId],
    references: [menus.id],
    relationName: "menuParent",
  }),
  children: many(menus, {
    relationName: "menuParent",
  }),
}));

export const serviceTypesRelations = relations(serviceTypes, ({ many }) => ({
  services: many(services),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  serviceType: one(serviceTypes, {
    fields: [services.typeId],
    references: [serviceTypes.id],
  }),
  packages: many(servicePackages),
  requests: many(serviceRequests),
  projects: many(projects),
}));

export const servicePackagesRelations = relations(servicePackages, ({ one }) => ({
  service: one(services, {
    fields: [servicePackages.serviceId],
    references: [services.id],
  }),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({ one }) => ({
  user: one(users, {
    fields: [serviceRequests.userId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [serviceRequests.serviceId],
    references: [services.id],
  }),
  package: one(servicePackages, {
    fields: [serviceRequests.packageId],
    references: [servicePackages.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  service: one(services, {
    fields: [projects.serviceId],
    references: [services.id],
  }),
}));

export const blogsRelations = relations(blogs, ({ one, many }) => ({
  comments: many(blogComments),
  author: one(users, {
    fields: [blogs.authorId],
    references: [users.id],
  }),
}));

export const blogCommentsRelations = relations(blogComments, ({ one, many }) => ({
  blog: one(blogs, {
    fields: [blogComments.blogId],
    references: [blogs.id],
  }),
  user: one(users, {
    fields: [blogComments.userId],
    references: [users.id],
  }),
  parent: one(blogComments, {
    fields: [blogComments.parentId],
    references: [blogComments.id],
    relationName: "commentParent",
  }),
  replies: many(blogComments, {
    relationName: "commentParent",
  }),
}));

