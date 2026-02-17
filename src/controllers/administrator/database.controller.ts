import { pgClient } from "@/configs/database.config";

interface TableInfo {
  name: string;
  rows: number;
  size: string;
  sizeBytes: number;
  totalSize: string;
  totalSizeBytes: number;
}

export const databaseController = {
  async getTables(): Promise<{ tables: TableInfo[]; databaseSize: string }> {
    const tablesResult = await pgClient`
      SELECT
        c.relname AS name,
        n_live_tup AS rows,
        pg_size_pretty(pg_relation_size(c.oid)) AS size,
        pg_relation_size(c.oid) AS size_bytes,
        pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
        pg_total_relation_size(c.oid) AS total_size_bytes
      FROM pg_class c
      LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
      LEFT JOIN pg_stat_user_tables s ON s.relid = c.oid
      WHERE c.relkind = 'r'
        AND n.nspname = 'public'
      ORDER BY pg_total_relation_size(c.oid) DESC
    `;

    const dbSizeResult = await pgClient`
      SELECT pg_size_pretty(pg_database_size(current_database())) AS size
    `;

    const tables: TableInfo[] = tablesResult.map((row: any) => ({
      name: row.name,
      rows: Number(row.rows || 0),
      size: row.size,
      sizeBytes: Number(row.size_bytes || 0),
      totalSize: row.total_size,
      totalSizeBytes: Number(row.total_size_bytes || 0),
    }));

    const databaseSize = dbSizeResult[0]?.size || "0 bytes";

    return { tables, databaseSize };
  },
};
