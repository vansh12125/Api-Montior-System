export default class BaseClientRepository {
  constructor(model) {
    this.model = model;
  }

  async create(clientData,options) {
    throw new Error("Method not implemented");
  }

  async findById(clientId) {
    throw new Error("Method not implemented");
  }

  async findBySlug(slug,options) {
    throw new Error("Method not implemented");
  }

  async findByEmail(email,options) {
    throw new Error("Method not implemented");
  }

  async find(filters, options) {
    throw new Error("Method not implemented");
  }

  async count(filters) {
    throw new Error("Method not implemented");
  }

  async updateCreatedBy(clientId, userId, options) {
    throw new Error("Method not implemented");
  }
}
