import { dashboardRepository } from "@/server/repositories/dashboard.repository";

export const dashboardService = {
  async getOverview() {
    return dashboardRepository.getOverviewData();
  },
};
