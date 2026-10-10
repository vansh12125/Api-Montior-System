import { EVENT_TYPES } from "../EventContracts.js";
import { isRetryable } from "./RetryStrategy.js";

export default class EventPrdoucer {
  constructor({
    channelManager,
    circuitBreaker,
    retryStartegy,
    logger,
    queueName,
  }) {
    if (!channelManager) {
      throw new Error("Channel Manager is required");
    }
    if (!circuitBreaker) {
      throw new Error("Circuit Breaker is required");
    }
    if (!retryStartegy) {
      throw new Error("Retry Startegy is required");
    }
    if (!queueName) {
      throw new Error("Queue Name is required");
    }

    this._channelManager = channelManager;
    this._retryStartegy = retryStartegy;
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

    const message = {
      type: EVENT_TYPES.API_HIT,
      data: eventData,
      publishedAt: new Date().toISOString(),
      attempt: attempt + 1,
    };

    const buffer = Buffer.from(JSON.stringify(message));

    const publisheOptions = {
      persistent: true,
      contentType: "application/json",
      messageId: eventData.eventId,
      correlationId,
      timestamp: Math.floor(Date.now() / 1000),
    };

    return new Promise((resolve, reject) => {
      const written = channel.publish(
        "",
        this._queueName,
        buffer,
        publisheOptions,
        (err) => {
          if (err) {
            return reject(new Error(`[EventPrdoucer] Publish nacked: ${err}`));
          }
          resolve();
        },
      );

      if (!written) {
        this._logger.info(
          `[EventPrdoucer] back-pressure detected waiting for drain`,
          {
            eventId: eventData.eventId,
          },
        );
      }

      const onDrain = () => {
        channel.removeListener("drain", onDrain);
        this._logger.debug("[EventPrdoucer] drain event recieved ", {
          eventId: eventData.eventId,
        });
      };

      channel.once("drain", onDrain);
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
        await this._publish(eventData, { correlationId, attempt });

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
          isRetryable(error) && this._retryStartegy.shouldRetry(attempt);

        if (!canRetry) {
          this._circuitBreaker.onFailure();
          this._incrementMetrics("failed");

          if (!this._retryStartegy.shouldRetry(attempt)) {
            this._incrementMetrics("retriesExhausted");
          }
          throw error;
        }

        await this._retryStartegy.wait(attempt);
        attempt++;
      }
    }
  }
}
