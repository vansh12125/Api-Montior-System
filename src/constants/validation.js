const VALIDATION = Object.freeze({
  NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
  },

  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z][a-zA-Z0-9_]*$/,
  },

  EMAIL: {
    MAX_LENGTH: 254,
    PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },

  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
  },

  CLIENT_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },

  SLUG: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-z0-9-]+$/,
  },

  DESCRIPTION: {
    MAX_LENGTH: 500,
    MIN_LENGTH: 5,
  },

  WEBSITE: {
    MAX_LENGTH: 500,
  },

  DATA_RETENTION: {
    MIN_DAYS: 7,
    MAX_DAYS: 365,
  },
});

export {
  VALIDATION,
};