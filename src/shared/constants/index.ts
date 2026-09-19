const config = {
  nodeEnv: process.env.NODE_ENV || "development",

  server: {
    port: parseInt(process.env.SERVER_PORT || "5000", 10),
    apiVersion: process.env.API_VERSION || "v1",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  },

  bcrypt: {
    saltRounds: parseInt(process.env.SALT_ROUNDS || "10", 10),
  },

  mongo: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27017/api_monitoring",
    dbName: process.env.MONGO_DB_NAME || "api_monitoring",
  },

  postgres: {
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
    database: process.env.POSTGRES_DATABASE || "api_monitoring",
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "12345",
  },

  rabbitmq: {
    url:
      process.env.RABBITMQ_URL ||
      "amqp://user:12345@localhost:5672/api_monitoring",
    queue: process.env.RABBITMQ_QUEUE || "api_hits",
    publisherConfirms: process.env.RABBITMQ_PUBLISHER_CONFIRMS === "true",
    retryAttempts: parseInt(process.env.RABBITMQ_RETRY_ATTEMPTS || "3", 10),
    retryDelay: parseInt(process.env.RABBITMQ_RETRY_DELAY || "1000", 10),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "1000", 10),
  },

  jwt: {
    accessSecret:
      process.env.JWT_TOKEN_ACCESS_SECRET || "MOST_SECURED_KEY_123456789",
    refreshSecret:
      process.env.JWT_TOKEN_REFRESH_SECRET || "MOST_SECURED_KEY_123456789",

    accessTokenExpiry: parseInt(process.env.ACCESS_TOKEN_EXPIRY || "900", 10),

    refreshTokenExpiry: parseInt(
      process.env.REFRESH_TOKEN_EXPIRY || "604800",
      10,
    ),

    issuer: process.env.JWT_TOKEN_ISSUER || "com.user.app",

    cookie: {
      secure: process.env.JWT_TOKEN_COOKIE_SECURE === "true",

      httpOnly: process.env.JWT_TOKEN_COOKIE_HTTP_ONLY === "true",

      sameSite: process.env.JWT_TOKEN_COOKIE_SAME_SITE || "lax",

      accessTokenName: process.env.ACCESS_TOKEN_COOKIE_NAME || "access_token",

      refreshTokenName:
        process.env.REFRESH_TOKEN_COOKIE_NAME || "refresh_token",

      accessMaxAge: parseInt(process.env.ACCESS_COOKIE_MAX_AGE || "900000", 10),

      refreshMaxAge: parseInt(
        process.env.REFRESH_COOKIE_MAX_AGE || "604800000",
        10,
      ),
    },
  },
};

export default config;
