import { User } from "../src/models/index.js";
import { Roles } from "../src/enums/index.js";
import { requiredEnv } from "../src/utils/index.js";
import { logger } from "../src/configs/index.js";
import { hashPassword } from "../src/services/index.js";

const createSuperAdmin = async () => {
  const existingSuperAdmin = await User.findOne({
    role: Roles.SUPER_ADMIN,
  });
  if (existingSuperAdmin) {
    logger.info(
      `Super Admin Already Exist-> ID: ${existingSuperAdmin._id.toString()} \t Username: ${existingSuperAdmin.username}`,
    );
    return;
  }

  const name = requiredEnv("SUPER_ADMIN_NAME");
  const username = requiredEnv("SUPER_ADMIN_USERNAME");
  const email = requiredEnv("SUPER_ADMIN_EMAIL");
  const password = requiredEnv("SUPER_ADMIN_PASSWORD");
  const admin = await User.create({
    name,
    username,
    email,
    password: await hashPassword(password),
    role: Roles.SUPER_ADMIN,
    isVerified: true,
    isActive: true,
  });

  logger.info(`Super Admin Created-> ID: ${admin._id.toString()}`);
};

export { createSuperAdmin };
