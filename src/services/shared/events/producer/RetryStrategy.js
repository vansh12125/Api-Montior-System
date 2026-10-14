const RETRYABLE_PATTERNS = [
  "channel closed",
  "connection closed",
  "econnreset",
  "econnrefused",
  "etimedout",
  "buffer full",
  "heartbeat timeout",
  "not available",
  "server connection closed",
  "confirmation timed out",
  "connection timed out",
  "channel creation timed out",
];

const isRetryable = (err) => {
  if (!err) {
    return false;
  }

  const msg = (err.message || "").toLowerCase();
  const code = (err.code || "").toUpperCase();

  if (code === "ENOTFOUND") return true;

  return RETRYABLE_PATTERNS.some(
    (p) => msg.includes(p.toLowerCase()) || code.includes(p.toUpperCase()),
  );
};

export default class RetryStrategy {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries ?? 3;
    this.baseDelayMs = options.baseDelayMs ?? 200;
    this.maxDelayMs = options.maxDelayMs ?? 5_000;
    this.jitterFactor = options.jitterFactor ?? 0.3;
  }

  shouldRetry(attempt) {
    return attempt < this.maxRetries;
  }

  delay(attempt) {
    const expo = this.baseDelayMs * Math.pow(2, attempt);
    const capped = Math.min(expo, this.maxDelayMs);

    const jitterRange = capped * this.jitterFactor;
    const jitter = (Math.random() - 0.5) * 2 * jitterRange;

    return Math.max(0, Math.round(capped + jitter));
  }

  wait(attempt) {
    const ms = this.delay(attempt);

    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export { isRetryable };
