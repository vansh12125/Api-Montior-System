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

  async exportCsvData(req, res, filters = {}) {
    try {
      const clientId = req.user.clientId;
      const { startTime, endTime } = this.parseTimeFilter(filters);

      const startTag = this.formatFileDate(startTime);
      const endTag = this.formatFileDate(endTime);

      const filename = `metrics_${clientId}_from_${startTag}_to_${endTag}.csv`;

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );

      await this.metricsRepository.exportMetricsCsv(
        clientId,
        startTime,
        endTime,
        res,
      );
    } catch (error) {
      logger.error("Error occurred in exportCsvData:", error);

      if (res.headersSent) {
        res.end();
        return;
      }
      throw error;
    }
  }

  async getEndpointHealth(req, filters = {}) {
    try {
      const clientId = req.user.clientId;

      if (!clientId) {
        throw ApiError.badRequest("Client context is required", {
          code: "CLIENT_CONTEXT_REQUIRED",
        });
      }

      const { startTime, endTime } = this.parseTimeFilter(filters);

      const result = await this.metricsRepository.getEndpointHealth({
        clientId,
        serviceName: filters.serviceName,
        endpoint: filters.endpoint,
        method: filters.method,
        startTime,
        endTime,
        limit: filters.limit ?? 10,
        offset: filters.offset ?? 0,
      });

      return {
        endpoints: result.map((item) => ({
          serviceName: item.service_name,
          endpoint: item.endpoint,
          method: item.method,
          totalRequests: Number(item.total_requests ?? 0),
          failedRequests: Number(item.failed_requests ?? 0),
          successfulRequests: Number(item.successful_requests ?? 0),
          errorRate: Number(item.error_rate ?? 0),
          avgLatency: Number(item.avg_latency ?? 0),
          minLatency: Number(item.min_latency ?? 0),
          maxLatency: Number(item.max_latency ?? 0),
        })),
        filters: {
          serviceName: filters.serviceName ?? null,
          endpoint: filters.endpoint ?? null,
          method: filters.method ?? null,
          startTime,
          endTime,
        },
        pagination: {
          limit: filters.limit ?? 10,
          offset: filters.offset ?? 0,
        },
      };
    } catch (error) {
      logger.error("Error occurred in getEndpointHealth service:", error);
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

    return {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };
  }

  formatFileDate(dateStr) {
    return new Date(dateStr)
      .toISOString()
      .replace(/T/, "_")
      .replace(/:/g, "-")
      .slice(0, 16);
  }
}
