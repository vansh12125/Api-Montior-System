import ApiError from "../error/ApiError.js";
import { logger } from "../configs/index.js";
import { Roles } from "../enums/index.js";

const clientAdminAuthorization = (userRepository) => {
  if (!userRepository) {
    throw new Error("User repository is required");
  }

  return async (req, _res, next) => {
    try {
      const userId = req.user.uId;

      const existingUser = await userRepository.findById(userId);

      if (!existingUser) {
        throw ApiError.notFound("User not found", { code: "NOT_FOUND" });
      }

      if (existingUser.role !== Roles.CLIENT_ADMIN) {
        throw ApiError.forbidden("Client admin permission required", {
          code: "INSUFFICIENT_PERMISSION",
        });
      }

      next();
    } catch (error) {
      logger.error(`Error occurred in Client Admin Middleware: ${error}`);
      next(error);
    }
  };
};
export default clientAdminAuthorization;
