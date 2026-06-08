import { router, publicProcedure } from "../t";
import { TRPCError } from "@trpc/server";
import { getServerSession } from "@/lib/auth";
import { db } from "@/server/db";
import { sql } from "drizzle-orm";

async function ensureAdmin() {
  const session = await getServerSession(true);
  if (!session?.user || session.user.role !== "admin") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }
}

export const databaseRouter = router({
  getStats: publicProcedure.query(async () => {
    await ensureAdmin();

    try {
      const tablesResult = await db.execute(sql`
        SELECT 
          c.relname AS "tableName",
          pg_total_relation_size(c.oid)::bigint AS "totalSize"
        FROM 
          pg_class c
        JOIN 
          pg_namespace n ON n.oid = c.relnamespace
        WHERE 
          n.nspname = 'public' 
          AND c.relkind = 'r'
        ORDER BY 
          c.relname;
      `);
      const tables = await Promise.all(
        Array.from(tablesResult).map(async (row: any) => {
          const tableName = String(row.tableName);
          const totalSize = Number(row.totalSize);
          const countResult = await db.execute(sql.raw(`SELECT count(*)::bigint AS "count" FROM "${tableName}"`));
          const rowCount = Number(countResult[0]?.count ?? 0);

          return {
            tableName,
            rowCount,
            totalSize,
          };
        })
      );
      const totalTables = tables.length;
      const totalSize = tables.reduce((acc, t) => acc + t.totalSize, 0);
      const totalRows = tables.reduce((acc, t) => acc + t.rowCount, 0);

      return {
        tables,
        stats: {
          totalTables,
          totalSize,
          totalRows,
        }
      };
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể tải cấu trúc và dung lượng các bảng dữ liệu",
      });
    }
  }),
});
