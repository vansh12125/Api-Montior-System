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
