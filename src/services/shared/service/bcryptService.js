import bcrypt from "bcryptjs";
import config from "../../../constants/index.js";
import crypto from "crypto";
import {API_ENIVORNMENT} from "../../../enums/index.js"

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

/**
 * Generate a random 32-byte key and return it.
 * @param {API_ENIVORNMENT}  enivornment
 * @returns {string}
 */
const generateApiKey = (enivornment) => {
  if (!Object.values(API_ENIVORNMENT).includes(enivornment)) {
    throw new Error("Invalid API enivornment");
  }

  const prefix = `ak_${enivornment.toLowerCase()}`;
  return `${prefix}_${crypto.randomBytes(32).toString("hex")}`;
};

export {
  hashPassword,
  verifyPassword,
  generateRandomSecurePassword,
  generateApiKey,
};
