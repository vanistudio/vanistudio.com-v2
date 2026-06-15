import { router, publicProcedure } from "../t";
import { z } from "zod";
import { db } from "@/server/db";
import { blogs, blogComments } from "@/server/db/schemas/blog.schema";
import { users } from "@/server/db/schemas/user.schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { TRPCError } from "@trpc/server";

export const publicBlogRouter = router({
  incrementView: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db
        .update(blogs)
        .set({ views: sql`${blogs.views} + 1` })
        .where(eq(blogs.id, input.id));
      return { success: true };
    }),

  likeBlog: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db
        .update(blogs)
        .set({ likes: sql`${blogs.likes} + 1` })
        .where(eq(blogs.id, input.id));
      return { success: true };
    }),

  getComments: publicProcedure
    .input(z.object({ blogId: z.string() }))
    .query(async ({ input }) => {
      const results = await db
        .select({
          id: blogComments.id,
          blogId: blogComments.blogId,
          userId: blogComments.userId,
          parentId: blogComments.parentId,
          content: blogComments.content,
          likes: blogComments.likes,
          createdAt: blogComments.createdAt,
          user: {
            name: users.name,
            email: users.email,
            username: users.username,
            image: users.image,
          },
        })
        .from(blogComments)
        .innerJoin(users, eq(blogComments.userId, users.id))
        .where(eq(blogComments.blogId, input.blogId))
        .orderBy(blogComments.createdAt);
      return results;
    }),

  likeComment: publicProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ input }) => {
      await db
        .update(blogComments)
        .set({ likes: sql`${blogComments.likes} + 1` })
        .where(eq(blogComments.id, input.commentId));
      return { success: true };
    }),

  addComment: publicProcedure
    .input(
      z.object({
        blogId: z.string(),
        parentId: z.string().nullable().optional(),
        content: z.string().min(1, "Nội dung bình luận không được để trống"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const session = await auth.api.getSession({
        headers: ctx.headers,
      });
      if (!session || !session.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Bạn cần đăng nhập để bình luận",
        });
      }
      const [newComment] = await db
        .insert(blogComments)
        .values({
          blogId: input.blogId,
          userId: session.user.id,
          parentId: input.parentId || null,
          content: input.content,
        })
        .returning();

      if (!newComment) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gửi bình luận thất bại",
        });
      }

      return {
        ...newComment,
        user: {
          name: session.user.name,
          image: session.user.image,
        },
      };
    }),

  deleteComment: publicProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const session = await auth.api.getSession({
        headers: ctx.headers,
      });
      if (!session || !session.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Bạn cần đăng nhập để thực hiện thao tác này",
        });
      }
      const [comment] = await db
        .select()
        .from(blogComments)
        .where(eq(blogComments.id, input.commentId))
        .limit(1);

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Không tìm thấy bình luận",
        });
      }

      if (comment.userId !== session.user.id && session.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Bạn không có quyền xóa bình luận này",
        });
      }

      await db.delete(blogComments).where(eq(blogComments.id, input.commentId));
      return { success: true };
    }),
});
