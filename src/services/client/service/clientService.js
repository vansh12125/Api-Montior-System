import { logger } from "../../../configs/index.js";
import ApiError from "../../../error/ApiError.js";
import { Roles } from "../../../enums/index.js";
import {
  generateRandomSecurePassword,
  hashPassword,
} from "../../shared/service/bcryptService.js";
import mongoose from "mongoose";

export default class ClientService {
  constructor(dependencies) {
    if (!dependencies) {
      throw new Error("Dependencies are required");
    }

    if (!dependencies.clientRepository) {
      throw new Error("ClientRepository is required");
    }

    if (!dependencies.userRepository) {
      throw new Error("User repository is required");
    }

    if (!dependencies.emailService) {
      throw new Error("Email service is required");
    }

    this.clientRepository = dependencies.clientRepository;
    this.userRepository = dependencies.userRepository;
    this.emailService = dependencies.emailService;
  }

  async createClient(clientData, options = {}) {
    try {
      const { name, email, description, website } = clientData;

      const existingClient = await this.clientRepository.findByEmail(
        email,
        options,
      );

      if (existingClient) {
        throw ApiError.conflict("Client email already exists", {
          field: "clientEmail",
          code: "CLIENT_EMAIL_ALREADY_EXISTS",
        });
      }

      const slug = await this.generateUniqueSlug(name, options);

      return await this.clientRepository.create(
        {
          name,
          slug,
          email,
          description,
          website,
        },
        options,
      );
    } catch (error) {
      logger.error(`Error occurred in createClient: ${error}`);

      throw error;
    }
  }

  async setCreatedBy(clientId, userId, options = {}) {
    return await this.clientRepository.updateCreatedBy(
      clientId,
      userId,
      options,
    );
  }

  async createViewer(req, res) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const { name, email } = req.body;
      const clientId = req.user.clientId;

      if (await this.userRepository.findByEmail(email, { session })) {
        throw ApiError.conflict("Email already exist", {
          code: "EMAIL_ALREADY_EXIST",
        });
      }

      const client = await this.clientRepository.findById(clientId, {
        session,
      });

      if (!client) {
        throw ApiError.notFound("Client not found", {
          code: "CLIENT_NOT_FOUND",
        });
      }

      const username = await this.generateUniqueUsername(name);
      const tempPass = generateRandomSecurePassword();

      const user = await this.userRepository.create(
        {
          name,
          username,
          email,
          password: await hashPassword(tempPass),
          role: Roles.CLIENT_VIEWER,
          clientId: clientId,
        },
        { session },
      );

      await session.commitTransaction();

      await this.emailService.sendEmail(
        email,
        client.name,
        name,
        username,
        tempPass,
      );

      return user;
    } catch (error) {
      await session.abortTransaction();

      logger.error(`Error occurred in createViewer: ${error}`);

      throw error;
    } finally {
      await session.endSession();
    }
  }

  async getAllClientViewer(req, res) {
    try {
      const clientId = req.user.clientId;
      return await this.userRepository.findAllClientViewer(clientId);
    } catch (error) {
      logger.error(`Error occurred in getAllClientViewer  : ${error}`);

      throw error;
    }
  }

  async generateUniqueSlug(name, options = {}) {
    const baseSlug = this.generateSlug(name);

    let slug = baseSlug;
    let counter = 2;

    while (await this.clientRepository.findBySlug(slug, options)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async generateUniqueUsername(name, options = {}) {
    let baseUsername = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .replace(/^[^a-z]+/, "");

    baseUsername = baseUsername.slice(0, 20);

    let username = baseUsername;
    let counter = 1;

    while (await this.userRepository.findByUsername(username, options)) {
      const suffix = `_${counter}`;
      username = `${baseUsername.slice(0, 20 - suffix.length)}${suffix}`;
      counter++;
    }

    return username;
  }
}
