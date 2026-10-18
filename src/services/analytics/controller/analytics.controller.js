import { ResponseFormatter } from "../../../utils/index.js";
import { logger } from "../../../configs/index.js";
import ApiError from "../../../error/ApiError.js";

export class AnalyticsController {
  constructor({ analyticsService }) {
    if (!analyticsService) {
      throw new Error("Analytics Service is required");
    }
    this.analyticsService = analyticsService;
  }

  async getOverallStats(req, res, next) {
    try {
      const { startTime, endTime } = req.query;
      const timeRange = this.validateTimeRange(startTime, endTime);

      const result = await this.analyticsService.getOverallStats(
        req,
        res,
        timeRange,
      );

      return res
        .status(200)
        .json(ResponseFormatter.success(200, "Fetched overall stats", result));
    } catch (error) {
      logger.error("Error occurred in getOverallStats controller: ", error);
      next(error);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const { startTime, endTime, limit } = req.query;
      const timeRange = this.validateTimeRange(startTime, endTime);

      const result = await this.analyticsService.getDashboard(req, {
        ...timeRange,
        limit,
      });

      return res
        .status(200)
        .json(ResponseFormatter.success(200, "Fetched dashboard", result));
    } catch (error) {
      logger.error("Error occurred in getDashboard controller: ", error);
      next(error);
    }
  }

  async exportCsvData(req, res, next) {
    try {
      const { startTime, endTime } = req.query;
      const timeRange = this.validateTimeRange(startTime, endTime);
      await this.analyticsService.exportCsvData(req, res, timeRange);
    } catch (error) {
      logger.error("Error occurred in exportCsvData controller: ", error);
      next(error);
    }
  }

  async getEndpointHealth(req, res, next) {
    try {
      const {
        startTime,
        endTime,
        serviceName,
        endpoint,
        method,
        limit = "10",
        offset = "0",
      } = req.query;

      const timeRange = this.validateTimeRange(startTime, endTime);

      const validateText = (value, field, maxLength) => {
        if (value === undefined) return undefined;

        if (
          typeof value !== "string" ||
          !value.trim() ||
          value.length > maxLength
        ) {
          throw new ApiError(`Invalid ${field}`, 400);
        }

        return value.trim();
      };

      const validateInteger = (value, field, defaultValue, max) => {
        if (value === undefined) return defaultValue;

        if (typeof value !== "string" || !/^\d+$/.test(value)) {
          throw new ApiError(`Invalid ${field}`, 400);
        }

        const number = Number(value);

        if (
          !Number.isSafeInteger(number) ||
          number < (field === "limit" ? 1 : 0) ||
          number > max
        ) {
          throw new ApiError(`Invalid ${field}`, 400);
        }

        return number;
      };

      const validServiceName = validateText(serviceName, "serviceName", 255);

      const validEndpoint = validateText(endpoint, "endpoint", 500);

      let validMethod = validateText(method, "method", 10);

      if (validMethod) {
        validMethod = validMethod.toUpperCase();

        const allowedMethods = [
          "GET",
          "POST",
          "PUT",
          "PATCH",
          "DELETE",
          "OPTIONS",
          "HEAD",
        ];

        if (!allowedMethods.includes(validMethod)) {
          throw new ApiError("Invalid HTTP method", 400);
        }
      }

      const validLimit = validateInteger(limit, "limit", 10, 1000);
      const validOffset = validateInteger(
        offset,
        "offset",
        0,
        Number.MAX_SAFE_INTEGER,
      );

      const result = await this.analyticsService.getEndpointHealth(req, {
        ...timeRange,
        serviceName: validServiceName,
        endpoint: validEndpoint,
        method: validMethod,
        limit: validLimit,
        offset: validOffset,
      });

      return res
        .status(200)
        .json(
          ResponseFormatter.success(200, "Fetched endpoint health", result),
        );
    } catch (error) {
      logger.error("Error occurred in getEndpointHealth controller:", error);
      next(error);
    }
  }

  async getRequestHistory(req, res, next) {
    try {
      const {
        serviceName,
        endpoint,
        method,
        statusCode,
        minLatency,
        maxLatency,
        startTime,
        endTime,
        limit,
        offset,
      } = req.query;

      const hasTimeRange =
        (startTime !== undefined && startTime !== "") ||
        (endTime !== undefined && endTime !== "");

      const timeRange = hasTimeRange
        ? this.validateTimeRange(startTime, endTime)
        : { startTime: undefined, endTime: undefined };

      const result = await this.analyticsService.getRequestHistory(req, {
        serviceName,
        endpoint,
        method,
        statusCode,
        minLatency,
        maxLatency,
        startTime: timeRange.startTime,
        endTime: timeRange.endTime,
        limit,
        offset,
      });

      return res
        .status(200)
        .json(
          ResponseFormatter.success(200, "Fetched API request history", result),
        );
    } catch (error) {
      logger.error("Error occurred in getRequestHistory controller:", error);
      next(error);
    }
  }

  validateTimeRange(startTime, endTime) {
    const parseValue = (v) => {
      if (v === undefined || v === null || v === "") return null;
      if (/^\d+$/.test(String(v))) return Number(v);
      const parsed = Date.parse(String(v));
      return Number.isNaN(parsed) ? NaN : parsed;
    };

    const start = parseValue(startTime);
    const end = parseValue(endTime);

    if ((startTime && Number.isNaN(start)) || (endTime && Number.isNaN(end))) {
      throw new ApiError("Invalid time format", 400);
    }

    if (start !== null && end !== null && start > end) {
      throw new ApiError("Invalid time range: start > end", 400);
    }

    return { startTime: start, endTime: end };
  }
}
