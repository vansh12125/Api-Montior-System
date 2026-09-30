import jwt from "jsonwebtoken";
import config from "../../../constants/index.js";
import { logger } from "../../../configs/index.js";
import crypto from "crypto";

export default class TokenService {
  constructor(tokenRepository) {
    if (!tokenRepository) {
      throw new Error("Token repository is required");
    }
    this.tokenRepository = tokenRepository;
  }

  async generateAccessToken(userId, sessionId, role) {
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

  async generateRefreshToken(userId, sessionId, role) {
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

  async verifyAccessToken(oldAccessToken) {}

  async verifyRefreshToken(oldRefreshToken) {}

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
