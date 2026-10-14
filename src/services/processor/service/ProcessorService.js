import { logger } from "../../../configs/index.js";

export class ProcessorService {
  constructor({ apiHitRepository, metricsRepository }) {
    if (!apiHitRepository || !metricsRepository) {
      throw new Error(
        "apiHitRepository and metricsRepository are reqiured in ProcessorService",
      );
    }
    this.apiHitRepository = apiHitRepository;
    this.metricsRepository = metricsRepository;
  }

  getTimeBucket(timestamp, interval = "hour") {
    const date = new Date(timestamp);

    switch (interval) {
      case "hour":
        date.setMinutes(0, 0, 0);
        break;
      case "day":
        date.setHours(0, 0, 0, 0);
        break;
      case "minute":
        date.setSeconds(0, 0);
        break;
      default:
        date.setMinutes(0, 0, 0);
    }

    return date;
  }

  async processEvent(eventData) {
    let rawEventSaved = false;

    try {
      await this.apiHitRepository.save(eventData);
      rawEventSaved = true;

      logger.debug("Raw event saved in mongoDb: ", {
        eventId: eventData.eventId,
      });

      await this._updateEventWithFallback(eventData);
      logger.debug("Event successfull processed and saved in pg: ", {
        eventId: eventData.eventId,
      });
    } catch (error) {
      if (!rawEventSaved) {
        logger.error("[CRITICAL] Failed to save event in mongoDb", {
          error: error.message,
          eventId: eventData.eventId,
        });
        throw error;
      }

      logger.error("[NON-CRITICAL] Failed to save event in postgres", {
        error: error.message,
        eventId: eventData.eventId,
      });
    }
  }

  async _updateEventWithFallback(eventData) {
    try {
      const timeBucket = this.getTimeBucket(eventData.timestamp, "hour");

      const metricsData = {
        clientId: eventData.clientId.toString(),
        serviceName: eventData.serviceName,
        endpoint: eventData.endpoint,
        method: eventData.method,
        totalHits: 1,
        errorHits: eventData.statusCode >= 400 ? 1 : 0,
        avgLatency: eventData.latencyMs,
        minLatency: eventData.latencyMs,
        maxLatency: eventData.latencyMs,

        timeBucket,
      };

      await this.metricsRepository.upsertEndpointMetrics(metricsData);

      logger.info("Event info updated successfully in postgres", {
        eventId: eventData.eventId,
      });
    } catch (error) {
      throw error;
    }
  }

  async cleanUpOldEvents(daysToKeep = 30) {
    try {
      let cutOfDate = new Date();
      cutOfDate.setDate(cutOfDate.getDate() - daysToKeep);

      return await this.apiHitRepository.deleteOldHits(cutOfDate);
    } catch (error) {
      logger.error(
        "Error occurred in cleanUpOldEvents, ProcessorService: ",
        error,
      );
      throw error;
    }
  }
}
