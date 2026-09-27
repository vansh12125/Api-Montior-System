/**
 *Function to validate env variables
 @param {String} keyname
 @returns {String} value
 */
const requiredEnv = (key) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export { requiredEnv };
