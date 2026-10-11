import { EVENT_TYPES } from "../EventContracts.js";
import { isRetryable } from "./RetryStrategy.js";

export default class EventPrdoucer {
  constructor({
    channelManager,
    circuitBreaker,
    retryStrategy,
    logger,
    queueName,
  }) {
    if (!channelManager) {
      throw new Error("Channel Manager is required");
    }
    if (!circuitBreaker) {
      throw new Error("Circuit Breaker is required");
    }
    if (!retryStrategy) {
      throw new Error("Retry Startegy is required");
    }
    if (!queueName) {
      throw new Error("Queue Name is required");
    }

    this._channelManager = channelManager;
    this._retryStrategy = retryStrategy;
    this._circuitBreaker = circuitBreaker;
    this._queueName = queueName;
    this._logger = logger ?? console;

    this._metrics = {
      published: 0,
      failed: 0,
      retriesExhausted: 0,
    };

    this._shuttingDown = false;
  }

  _incrementMetrics(key) {
    this._metrics[key] = (this._metrics[key] || 0) + 1;
  }

  async _publish(eventData, { correlationId, attempt }) {
    const channel = await this._channelManager.getChannel();

    if (!channel || typeof channel.publish !== "function") {
      throw new Error("RabbitMQ confirm channel unavailable");
    }

    const message = {
      type: EVENT_TYPES.API_HIT,
      data: eventData,
      publishedAt: new Date().toISOString(),
      attempt: attempt + 1,
    };

    const buffer = Buffer.from(JSON.stringify(message));

    const publishOptions = {
      persistent: true,
      mandatory: true,
      contentType: "application/json",
      messageId: eventData.eventId,
      correlationId,
      timestamp: Math.floor(Date.now() / 1000),
    };

    return new Promise((resolve, reject) => {
      let settled = false;
      let returned = false;

      const cleanup = () => {
        clearTimeout(timer);
        channel.off("return", onReturn);
      };

      const finish = (error) => {
        if (settled) return;

        settled = true;
        cleanup();

        if (error) {
          reject(error);
        } else {
          resolve(true);
        }
      };

      const onReturn = (msg) => {
        if (msg.properties.messageId !== eventData.eventId) return;

        returned = true;

        const error = new Error(
          `RabbitMQ unroutable message: ${msg.fields.replyText}`,
        );

        error.code = "UNROUTABLE_MESSAGE";
        finish(error);
      };

      const timer = setTimeout(() => {
        const error = new Error("RabbitMQ confirmation timed out");
        error.code = "ETIMEDOUT";
        finish(error);
      }, 5000);

      channel.on("return", onReturn);

      try {
        channel.publish(
          "",
          this._queueName,
          buffer,
          publishOptions,
          (error) => {
            if (error) {
              finish(error);
              return;
            }

            if (!returned) {
              finish(null);
            }
          },
        );
      } catch (error) {
        finish(error);
      }
    });
  }

  async shutdown() {
    this._shuttingDown = true;
    this._logger.info("[EventPrdoucer] shutting down..");
    await this._channelManager.close();

    this._logger.info("[EventPrdoucer} shut down completed");
  }

  async snapshot() {
    return {
      metrics: { ...this._metrics },
      circuitBreaker: this._circuitBreaker.snapshot(),
    };
  }

  async publishApiHit(eventData, opts = {}) {
    if (this._shuttingDown) {
      const err = new Error("[EventPrdoucer] is shutting down");
      ((err.code = "SHUTDOWN_IN_PROGRESS"),
        this._logger.info("[EventPrdoucer] publish rejected - shutting down ", {
          eventId: eventData.eventId,
        }));

      throw err;
    }

    if (!this._circuitBreaker.allowRequest()) {
      this._logger.info(
        "[EventPrdoucer] publish rejected - circuit breaker rejected publish ",
        {
          eventId: eventData.eventId,
          state: this._circuitBreaker.state,
        },
      );
      return false;
    }

    const correlationId = opts.correlationId ?? eventData.eventId;

    const startMs = Date.now();
    let attempt = 0;

    while (true) {
      try {
        const published = await this._publish(eventData, {
          correlationId,
          attempt,
        });

        if (!published) {
          this._logger.error(`[EventProducer] publishe failed`, {
            eventId: eventData.eventId,
            correlationId,
            endpoint: eventData.endpoint,
          });
          throw new Error("API hit was not published");
        }

        const latencyMs = Date.now() - startMs;
        this._circuitBreaker.onSuccess();
        this._incrementMetrics("published");

        this._logger.info(`[EventProducer] published`, {
          eventId: eventData.eventId,
          correlationId,
          attempt: attempt + 1,
          latencyMs,
          endpoint: eventData.endpoint,
        });
        return true;
      } catch (error) {
        this._logger.info(`[EventProducer] publish attempt failed`, {
          eventId: eventData.eventId,
          correlationId,
          attempt: attempt + 1,
          error: error.message,
        });

        const canRetry =
          isRetryable(error) && this._retryStrategy.shouldRetry(attempt);

        if (!canRetry) {
          this._circuitBreaker.onFailure();
          this._incrementMetrics("failed");

          if (!this._retryStrategy.shouldRetry(attempt)) {
            this._incrementMetrics("retriesExhausted");
          }
          throw error;
        }

        await this._retryStrategy.wait(attempt);
        attempt++;
      }
    }
  }
}
