export const CircuitState = Object.freeze({
  CLOSED: "CLOSED",
  OPEN: "OPEN",
  HALF_OPEN: "HALF_OPEN",
});

export default class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.cooldownMs = options.cooldownMs ?? 30_000;
    this.halfOpenMaxAttempts = options.halfOpenMaxAttempts ?? 3;
    this.logger = options.logger ?? console;

    this._state = CircuitState.CLOSED;
    this._failures = 0;
    this._lastFailureTime = 0;
    this._halfOpenAttempts = 0;
    this._halfOpenSuccesses = 0;
  }

  _cooldownElapsed() {
    return Date.now() - this._lastFailureTime >= this.cooldownMs;
  }

  _transitionTo(newState) {
    const prevState = this._state;
    this._state = newState;

    if (newState === CircuitState.HALF_OPEN) {
      this._halfOpenAttempts = 0;
      this._halfOpenSuccesses = 0;
      this.logger.info(
        `[CircuitBreaker] state changed from ${prevState} to: ${newState}]`,
      );
    }
  }

  _openCircuit() {
    this._lastFailureTime = Date.now();
    this._transitionTo(CircuitState.OPEN);
    this.logger.error(
      `[CircuitBreaker] OPEN :${{ failures: this._failures, cooldownMs: this.cooldownMs }}`,
    );
  }

  _reset() {
    this._state = CircuitState.CLOSED;
    this._failures = 0;
    this._halfOpenAttempts = 0;
    this._halfOpenSuccesses = 0;
  }

  get state() {
    if (this._state === CircuitState.OPEN && this._cooldownElapsed()) {
      this._transitionTo(CircuitState.HALF_OPEN);
    }

    return this._state;
  }

  allowRequest() {
    const current = this.state;

    if (current === CircuitState.CLOSED) {
      return true;
    }

    if (current === CircuitState.HALF_OPEN) {
      if (this._halfOpenAttempts < this.halfOpenMaxAttempts) {
        this._halfOpenAttempts++;
        return true;
      }
      return false;
    }
    return false;
  }

  onSuccess() {
    if (this._state === CircuitState.HALF_OPEN) {
      this._halfOpenSuccesses++;
      if (this._halfOpenSuccesses >= this.halfOpenMaxAttempts) {
        this._reset();
        this.logger.info(
          `[CircuitBreaker] reset to CLOSED after successful half-open probes`,
        );
      }
      return;
    }

    if (this._failures > 0) {
      this._failures = 0;
      this.logger.info(`[CircuitBreaker] failure count resets`);
    }
  }

  onFailure() {
    if (this._state === CircuitState.HALF_OPEN) {
      this._openCircuit();
      this.logger.info(`[CircuitBreaker] half-open failed reopening `);
      return;
    }
    this._failures++;
    this._lastFailureTime = Date.now();

    if (this._failures >= this.failureThreshold) {
      this._openCircuit();
    }
  }

  snapshot() {
    return {
      state: this._state,
      failures: this._failures,
      lastFailureTime: this._lastFailureTime,
      halfOpenAttempts: this._halfOpenAttempts,
      halfOpenSuccesses: this._halfOpenSuccesses,
    };
  }
}
