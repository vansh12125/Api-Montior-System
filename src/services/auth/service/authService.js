import mongoose from "mongoose";

import ApiError from "../../../error/ApiError.js";
import { hashPassword, verifyPassword } from "../../bcryptService.js";
import { Roles } from "../../../enums/index.js";
import { logger } from "../../../configs/index.js";
import crypto from "crypto";
import config from "../../../constants/index.js";
import { getClientInfo } from "../../../utils/index.js";

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

    if (!dependencies.tokenService) {
      throw new Error("Token Service is required");
    }

    this.userRepository = dependencies.userRepository;
    this.clientService = dependencies.clientService;
    this.tokenService = dependencies.tokenService;
  }

  generateSessionId = () => {
    return crypto.randomBytes(32).toString("hex");
  };

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

  async loginUser(req, res) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const { context, password } = req.body;

      const existingUser = await this.userRepository.findUserForLogin(context, {
        session,
      });

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

      const sessionId = this.generateSessionId();
      const accToken = await this.tokenService.generateAccessToken(
        existingUser._id.toString(),
        sessionId,
        existingUser.role,
      );
      const refToken = await this.tokenService.generateRefreshToken(
        existingUser._id.toString(),
        sessionId,
        existingUser.role,
      );

      await this.tokenService.saveTokenInDb(
        refToken,
        sessionId,
        existingUser._id.toString(),
        getClientInfo(req),
        existingUser.role,
        { session },
      );

      res.cookie(config.jwt.cookie.accessTokenName, accToken, {
        httpOnly: config.jwt.cookie.httpOnly,
        secure: config.jwt.cookie.secure,
        sameSite: config.jwt.cookie.sameSite,
        maxAge: config.jwt.cookie.refreshMaxAge,
        path: config.jwt.cookie.path,
      });

      res.cookie(config.jwt.cookie.refreshTokenName, refToken, {
        httpOnly: config.jwt.cookie.httpOnly,
        secure: config.jwt.cookie.secure,
        sameSite: config.jwt.cookie.sameSite,
        maxAge: config.jwt.cookie.refreshMaxAge,
        path: config.jwt.cookie.path,
      });

      return "Logged in successfull";
    } catch (error) {
      await session.abortTransaction();
      logger.error(`Error occurred in loginUser: ${error}`);

      throw error;
    } finally {
      await session.endSession();
    }
  }
}
