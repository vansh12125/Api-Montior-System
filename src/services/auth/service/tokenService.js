import jwt from "jsonwebtoken";
import config from "../../../constants/index.js";
import { logger } from "../../../configs/index.js";
import crypto from "crypto";
import ApiError from "../../../error/ApiError.js";
import { Roles } from "../../../enums/index.js";

export default class TokenService {
  constructor(tokenRepository) {
    if (!tokenRepository) {
      throw new Error("Token repository is required");
    }
    this.tokenRepository = tokenRepository;
  }

  generateAccessToken(userId, sessionId, role) {
    return jwt.sign(
      { uId: userId, sId: sessionId, role: role, type: "acc" },
      config.jwt.accessSecret,
      {
        expiresIn: config.jwt.accessTokenExpiry,
        issuer: config.jwt.issuer,
        jwtid: crypto.randomUUID(),
      },
    );
  }

  generateRefreshToken(userId, sessionId, role) {
    return jwt.sign(
      { uId: userId, sId: sessionId, role: role, type: "ref" },
      config.jwt.refreshSecret,
      {
        expiresIn: config.jwt.refreshTokenExpiry,
        issuer: config.jwt.issuer,
        jwtid: crypto.randomUUID(),
      },
    );
  }

  async verifyAccessToken(oldAccessToken) {
    try {
      const decoded = jwt.verify(oldAccessToken, config.jwt.accessSecret, {
        issuer: config.jwt.issuer,
      });

      if (
        typeof decoded !== "object" ||
        decoded === null ||
        typeof decoded.uId !== "string" ||
        typeof decoded.sId !== "string" ||
        !Object.values(Roles).includes(decoded.role) ||
        decoded.type !== "acc"
      ) {
        throw ApiError.unauthorized("Invalid access token", {
          code: "INVALID_ACCESS_TOKEN",
        });
      }

      const refreshToken = await this.tokenRepository.findBySessionId(
        decoded.sId,
      );

      if (!refreshToken || refreshToken.revoked) {
        throw ApiError.unauthorized("Session has been revoked", {
          code: "SESSION_REVOKED",
        });
      }

      return decoded;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.unauthorized("Invalid or expired access token", {
        code: "INVALID_ACCESS_TOKEN",
      });
    }
  }

  async verifyRefreshToken(oldRefreshToken) {
    try {
      const decoded = jwt.verify(oldRefreshToken, config.jwt.refreshSecret, {
        issuer: config.jwt.issuer,
      });

      if (
        typeof decoded !== "object" ||
        decoded === null ||
        typeof decoded.uId !== "string" ||
        typeof decoded.sId !== "string" ||
        !Object.values(Roles).includes(decoded.role) ||
        decoded.type !== "ref"
      ) {
        throw ApiError.unauthorized("Invalid refresh token", {
          code: "INVALID_REFRESH_TOKEN",
        });
      }

      const oldHash = this.hashToken(oldRefreshToken);

      const oldData = await this.tokenRepository.findByTokenHashAndSessionId(
        oldHash,
        decoded.sId,
      );

      if (!oldData || oldData.revoked) {
        throw ApiError.unauthorized("Invalid refresh token", {
          code: "INVALID_REFRESH_TOKEN",
        });
      }

      return decoded;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw ApiError.unauthorized("Invalid or expired refresh token", {
        code: "INVALID_REFRESH_TOKEN",
      });
    }
  }

  async revokeRefreshToken(tokenHash, sessionId, options = {}) {
    try {
      return await this.tokenRepository.findAndRevokeByTokenHashAndSessionId(
        tokenHash,
        sessionId,
        options,
      );
    } catch (error) {
      logger.error(`Error occurred in revokeRefreshToken: ${error}`);

      throw error;
    }
  }

  hashToken(rawToken) {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  }

  async saveTokenInDb(
    token,
    sessionId,
    userId,
    clientInfo,
    role,
    options = {},
  ) {
    try {
      return await this.tokenRepository.create(
        {
          tokenHash: this.hashToken(token),
          sessionId,
          userId,
          role,
          revoked: false,
          clientInfo,
          expireAt: new Date(Date.now() + config.jwt.refreshTokenExpiry * 1000),
        },
        options,
      );
    } catch (error) {
      logger.error(`Error occured in saveTokenInDb : ${error}`);
      throw error;
    }
  }
}
