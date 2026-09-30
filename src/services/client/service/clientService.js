import { logger } from "../../../configs/index.js";
import ApiError from "../../../error/ApiError.js";

export default class ClientService {
  constructor(dependencies) {
    if (!dependencies) {
      throw new Error("Dependencies are required");
    }

    if (!dependencies.clientRepository) {
      throw new Error("ClientRepository is required");
    }

    this.clientRepository = dependencies.clientRepository;
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
}
