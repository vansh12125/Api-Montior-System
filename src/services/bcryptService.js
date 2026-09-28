import bcrypt from "bcryptjs";
import config from "../constants/index.js";

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

export { hashPassword, verifyPassword };
