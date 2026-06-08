import { db } from "@/server/db";
import { sql } from "drizzle-orm";

export interface GetStatsParams {
  search?: string;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export class DatabaseRepository {
  async getDatabaseStats(params: GetStatsParams) {
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
        AND c.relkind = 'r';
    `);
    const allTables = await Promise.all(
      Array.from(tablesResult).map(async (row: any) => {
        const tableName = String(row.tableName);
        const totalSize = Number(row.totalSize);
        const countResult = await db.execute(
          sql.raw(`SELECT count(*)::bigint AS "count" FROM "${tableName}"`)
        );
        const rowCount = Number(countResult[0]?.count ?? 0);

        return {
          tableName,
          rowCount,
          totalSize,
        };
      })
    );

    const totalTables = allTables.length;
    const totalSize = allTables.reduce((acc, t) => acc + t.totalSize, 0);
    const totalRows = allTables.reduce((acc, t) => acc + t.rowCount, 0);

    let filtered = allTables;
    if (params.search && params.search.trim()) {
      const searchPattern = params.search.trim().toLowerCase();
      filtered = filtered.filter((t) =>
        t.tableName.toLowerCase().includes(searchPattern)
      );
    }

    const sortField = params.sortField || "tableName";
    const sortOrder = params.sortOrder || "asc";

    filtered.sort((a, b) => {
      const valA = a[sortField as keyof typeof a];
      const valB = b[sortField as keyof typeof b];

      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return sortOrder === "asc"
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      }
    });

    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;
    const paginatedItems = filtered.slice(offset, offset + limit);
    const total = filtered.length;

    return {
      items: paginatedItems,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
      stats: {
        totalTables,
        totalSize,
        totalRows,
      },
    };
  }
}

export const databaseRepository = new DatabaseRepository();
