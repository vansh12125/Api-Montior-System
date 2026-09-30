export default class BaseTokenRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data, options) {
    throw new Error("Method not implemented");
  }

  async findById(id, options) {
    throw new Error("Method not implemented");
  }

  async findByTokenHash(tokenHash, options) {
    throw new Error("Method not implemented");
  }

  async findBySessionId(sessionId, options) {
    throw new Error("Method not implemented");
  }

  async findByUserId(userId, options) {
    throw new Error("Method not implemented");
  }
}
