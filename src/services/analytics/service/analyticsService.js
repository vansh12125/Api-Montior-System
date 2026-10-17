import { logger } from "../../../configs/index.js";
import ApiError from "../../../error/ApiError.js";

export class AnalyticsService {
  constructor({ metricsRepository }) {
    if (!metricsRepository) {
      throw new Error("Metric Repository is required in AnalyticsService");
    }
    this.metricsRepository = metricsRepository;
  }

  async getOverallStats(req, _res, filters = {}) {
    try {
      const clientId = req.user.clientId;
      const { startTime, endTime } = this.parseTimeFilter(filters);

      const stats = await this.metricsRepository.getOverallStats(
        clientId,
        startTime,
        endTime,
      );

      const totalHits = parseInt(stats.total_hits) || 0;
      const errorHits = parseInt(stats.error_hits) || 0;
      const errorRate = totalHits > 0 ? (errorHits / totalHits) * 100 : 0;

      return {
        totalHits,
        errorHits,
        errorRate: parseFloat(errorRate.toFixed(2)),
        successRate: parseFloat((100 - errorRate).toFixed(2)),
        avgLatency: parseFloat(stats.avg_latency) || 0,
        uniqueService: parseInt(stats.unique_services) || 0,
        uniqueEndpoints: parseInt(stats.unique_endpoints) || 0,
        timeRange: {
          startTime,
          endTime,
        },
      };
    } catch (error) {
      logger.error("Error occuurred in getOverallStats service: ", error);
      throw error;
    }
  }

  async getDashboard(req, filters = {}) {
    try {
      const clientId = req.user.clientId;
      const { startTime, endTime } = this.parseTimeFilter(filters);
      const limit = parseInt(filters.limit) || 10;

      const [stats, topEndpoints, metrics] = await Promise.all([
        this.metricsRepository.getOverallStats(clientId, startTime, endTime),
        this.metricsRepository.getTopEndpoints(
          clientId,
          limit,
          startTime,
          endTime,
        ),
        this.metricsRepository.getMetrics({
          clientId,
          startTime,
          endTime,
          limit,
        }),
      ]);

      const totalHits = Number(stats.total_hits ?? 0);
      const errorHits = Number(stats.error_hits ?? 0);

      return {
        summary: {
          totalHits,
          errorHits,
          errorRate: totalHits
            ? Number(((errorHits / totalHits) * 100).toFixed(2))
            : 0,
          successRate: totalHits
            ? Number((((totalHits - errorHits) / totalHits) * 100).toFixed(2))
            : 0,
          avgLatency: Number(stats.avg_latency ?? 0),
          uniqueServices: Number(stats.unique_services ?? 0),
          uniqueEndpoints: Number(stats.unique_endpoints ?? 0),
        },
        topEndpoints: topEndpoints.map((item) => ({
          serviceName: item.service_name,
          endpoint: item.endpoint,
          method: item.method,
          totalHits: Number(item.total_hits ?? 0),
          errorHits: Number(item.error_hits ?? 0),
          avgLatency: Number(item.avg_latency ?? 0),
        })),
        metrics,
        timeRange: {
          startTime,
          endTime,
        },
      };
    } catch (error) {
      logger.error("Error occurred in getDashboard:", error);
      throw error;
    }
  }

  parseTimeFilter(filters = {}) {
    let { startTime, endTime } = filters;

    if (!startTime) {
      startTime = new Date();
      startTime.setHours(startTime.getHours() - 24); //Last 24h
    } else {
      startTime = new Date(startTime);
    }

    if (!endTime) {
      endTime = new Date();
    } else {
      endTime = new Date(endTime);
    }

    return { startTime, endTime };
  }
}
