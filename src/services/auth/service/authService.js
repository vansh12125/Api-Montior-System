import mongoose from "mongoose";

import ApiError from "../../../error/ApiError.js";
import { hashPassword, verifyPassword } from "../../bcryptService.js";
import { Roles } from "../../../enums/index.js";
import { logger } from "../../../configs/index.js";

export default class AuthService {
  constructor(dependencies) {
    if (!dependencies) {
      throw new Error("Dependencies are required");
    }

    if (!dependencies.userRepository) {
      throw new Error("User repository is required");
    }

    if (!dependencies.clientService) {
      throw new Error("Client Service is required");
    }

    this.userRepository = dependencies.userRepository;
    this.clientService = dependencies.clientService;
  }

  async registerClientAdmin(reqBody) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const {
        name,
        username,
        email,
        password,
        clientName,
        clientEmail,
        description,
        website,
      } = reqBody;

      const existingUser = await this.userRepository.findByEmailOrUsername(
        email,
        username,
        { session },
      );

      if (existingUser) {
        if (existingUser.email === email) {
          throw ApiError.conflict("Email already exists", {
            field: "email",
            code: "EMAIL_ALREADY_EXISTS",
          });
        }

        if (existingUser.username === username) {
          throw ApiError.conflict("Username already exists", {
            field: "username",
            code: "USERNAME_ALREADY_EXISTS",
          });
        }
      }

      const client = await this.clientService.createClient(
        {
          name: clientName,
          email: clientEmail,
          description,
          website,
        },
        { session },
      );

      const hashedPassword = await hashPassword(password);

      const user = await this.userRepository.create(
        {
          name,
          username,
          email,
          password: hashedPassword,
          role: Roles.CLIENT_ADMIN,
          clientId: client._id,
        },
        { session },
      );

      await this.clientService.setCreatedBy(client._id, user._id, { session });

      await session.commitTransaction();

      return user;
    } catch (error) {
      await session.abortTransaction();

      logger.error(`Error occurred in registerClientAdmin: ${error}`);

      throw error;
    } finally {
      await session.endSession();
    }
  }

  async loginUser(reqBody) {
    try {
      const { context, password } = reqBody;

      const existingUser = await this.userRepository.findUserForLogin(context);

      if (!existingUser) {
        throw ApiError.unauthorized("Invalid username/email or password", {
          code: "INVALID_CREDENTIALS",
        });
      }

      const isPassCorrect = await verifyPassword(
        password,
        existingUser.password,
      );

      if (!isPassCorrect) {
        throw ApiError.unauthorized("Invalid username/email or password", {
          code: "INVALID_CREDENTIALS",
        });
      }

      return existingUser.toJSON();
    } catch (error) {
      logger.error(`Error occurred in loginUser: ${error}`);

      throw error;
    }
  }
}
