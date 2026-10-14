import bcrypt from "bcryptjs";
import config from "../../../constants/index.js";
import crypto from "crypto";
import { API_ENIVORNMENT } from "../../../enums/index.js";

/**
 * Take password and return hased password
 * @param {String} rawPassword
 * @returns {Promise<String>} hasedPassword
 */
const hashPassword = async (rawPassword) => {
  return await bcrypt.hash(rawPassword, config.bcrypt.saltRounds);
};

/**
 * Take raw password and hased password return true if password correct else false
 * @param {String} rawPassword
 * @param {String} hashedPassword
 * @returns {Promise<boolean>}
 */
const verifyPassword = async (rawPassword, hashedPassword) => {
  return await bcrypt.compare(rawPassword, hashedPassword);
};

/**
 * Generate a random 12-byte password and return it.
 * @returns {string}
 */
const generateRandomSecurePassword = () => {
  return crypto.randomBytes(12).toString("hex");
};


const generateApiKey = async (enivornment) => {
  const prefix = {
    PRODUCTION: "live",
    STAGING: "stage",
    DEVELOPMENT: "dev",
    TESTING: "test",
  }[enivornment];

  if (!prefix) {
    throw new Error("Invalid environment");
  }

  const keyId = crypto.randomBytes(12).toString("hex");
  const secret = crypto.randomBytes(32).toString("hex");

  const rawKey = `ak_${prefix}_${keyId}_${secret}`;
  const keyHash = await hashPassword(secret);

  return { rawKey, keyId, keyHash };
};

export {
  hashPassword,
  verifyPassword,
  generateRandomSecurePassword,
  generateApiKey,
};
