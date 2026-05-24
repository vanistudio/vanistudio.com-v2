import { databaseRepository } from "@/server/repositories/database.repository";

interface TableInfo {
  name: string;
  rows: number;
  size: string;
  sizeBytes: number;
  totalSize: string;
  totalSizeBytes: number;
}

export const databaseService = {
  async getTables(): Promise<{ tables: TableInfo[]; databaseSize: string }> {
    const tablesResult = await databaseRepository.getTableStats();
    const databaseSize = await databaseRepository.getDatabaseSize();

    const tables: TableInfo[] = tablesResult.map((row: any) => ({
      name: row.name,
      rows: Number(row.rows || 0),
      size: row.size,
      sizeBytes: Number(row.size_bytes || 0),
      totalSize: row.total_size,
      totalSizeBytes: Number(row.total_size_bytes || 0),
    }));

    return { tables, databaseSize };
  },
};
