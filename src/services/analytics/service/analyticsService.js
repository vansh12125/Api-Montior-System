import { logger } from "../../../configs/index.js";
import ApiError from "../../../error/ApiError.js";

export class AnalyticsService {
  constructor({ metricsRepository, apiHitRepository }) {
    if (!metricsRepository) {
      throw new Error("Metric Repository is required in AnalyticsService");
    }

    if (!apiHitRepository) {
      throw new Error("API Hit Repository is required in AnalyticsService");
    }

    this.metricsRepository = metricsRepository;
    this.apiHitRepository = apiHitRepository;
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
        avgLatency: parseFloat(stats.avg_latency).toFixed(2) || 0,
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
          avgLatency: Number(stats.avg_latency ?? 0).toFixed(2),
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
      const { startTime, endTime } = this.parseTimeFilter({
        ...filters,
        endTime:
          typeof req.query.endTime === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(req.query.endTime)
            ? new Date(`${req.query.endTime}T23:59:59.999+05:30`).toISOString()
            : filters.endTime,
      });

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

  async getRequestHistory(req, filters = {}) {
    try {
      const clientId = req.user?.clientId;

      if (!clientId) {
        throw ApiError.badRequest("Client context is required", {
          code: "CLIENT_CONTEXT_REQUIRED",
        });
      }

      const {
        serviceName,
        endpoint,
        method,
        statusCode,
        minLatency,
        maxLatency,
        limit = 25,
        offset = 0,
      } = filters;

      const validateNumber = (
        value,
        field,
        min,
        max = Number.MAX_SAFE_INTEGER,
        defaultValue,
      ) => {
        if (value === undefined || value === "") {
          return defaultValue;
        }

        const number = Number(value);

        if (!Number.isInteger(number) || number < min || number > max) {
          throw ApiError.badRequest(`Invalid ${field}`, {
            code: `INVALID_${field.toUpperCase()}`,
          });
        }

        return number;
      };

      const parsedStatusCode = validateNumber(
        statusCode,
        "statusCode",
        100,
        599,
      );

      const parsedMinLatency = validateNumber(minLatency, "minLatency", 0);

      const parsedMaxLatency = validateNumber(maxLatency, "maxLatency", 0);

      const parsedLimit = validateNumber(limit, "limit", 1, 100, 25);
      const parsedOffset = validateNumber(offset, "offset", 0, 1_000_000, 0);

      const parsedMethod = method ? String(method).toUpperCase() : undefined;

      const allowedMethods = [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
        "HEAD",
      ];

      if (parsedMethod && !allowedMethods.includes(parsedMethod)) {
        throw ApiError.badRequest("Invalid method", {
          code: "INVALID_METHOD",
        });
      }

      if (
        parsedMinLatency !== undefined &&
        parsedMaxLatency !== undefined &&
        parsedMinLatency > parsedMaxLatency
      ) {
        throw ApiError.badRequest(
          "minLatency cannot be greater than maxLatency",
          { code: "INVALID_LATENCY_RANGE" },
        );
      }

      const timeRange = this.parseTimeFilter({
        startTime: filters.startTime,
        endTime: filters.endTime,
      });

      const parsedStartTime = new Date(timeRange.startTime);
      const parsedEndTime = new Date(timeRange.endTime);

      if (
        Number.isNaN(parsedStartTime.getTime()) ||
        Number.isNaN(parsedEndTime.getTime())
      ) {
        throw ApiError.badRequest("Invalid time range", {
          code: "INVALID_DATE",
        });
      }

      if (parsedStartTime > parsedEndTime) {
        throw ApiError.badRequest("Invalid time range", {
          code: "INVALID_TIME_RANGE",
        });
      }

      const { records, total } = await this.apiHitRepository.findHistory({
        clientId,
        serviceName,
        endpoint,
        method: parsedMethod,
        statusCode: parsedStatusCode,
        minLatency: parsedMinLatency,
        maxLatency: parsedMaxLatency,
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        limit: parsedLimit,
        offset: parsedOffset,
      });

      return {
        records: records.map((record) => ({
          eventId: record.eventId,
          timestamp: record.timestamp,
          serviceName: record.serviceName,
          endpoint: record.endpoint,
          method: record.method,
          statusCode: record.statusCode,
          latencyMs: record.latencyMs,
        })),
        filters: {
          serviceName,
          endpoint,
          method: parsedMethod,
          statusCode: parsedStatusCode,
          minLatency: parsedMinLatency,
          maxLatency: parsedMaxLatency,
          startTime: timeRange.startTime,
          endTime: timeRange.endTime,
        },
        pagination: {
          total,
          limit: parsedLimit,
          offset: parsedOffset,
          hasNextPage: parsedOffset + records.length < total,
        },
      };
    } catch (error) {
      logger.error("Error occurred in getRequestHistory:", error);
      throw error;
    }
  }

  parseTimeFilter(filters = {}) {
    let { startTime, endTime } = filters;

    if (!startTime) {
      startTime = new Date();
      startTime.setHours(startTime.getHours() - 24);
    } else {
      startTime = new Date(startTime);
    }

    if (!endTime) {
      endTime = new Date();
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(endTime)) {
      endTime = new Date(`${endTime}T00:00:00`);
      endTime.setDate(endTime.getDate() + 1);
      endTime = new Date(endTime.getTime() - 1);
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
