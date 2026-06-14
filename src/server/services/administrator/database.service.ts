import { databaseRepository, GetStatsParams } from "@/server/repositories/database.repository";

export class DatabaseService {
  async getStats(params: GetStatsParams) {
    const result = await databaseRepository.getDatabaseStats(params);

    return {
      resultCode: 0,
      message: "Success",
      data: {
        items: result.items,
        stats: result.stats,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      },
    };
  }
}

export const databaseService = new DatabaseService();
