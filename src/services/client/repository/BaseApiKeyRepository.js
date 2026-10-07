export default class BaseApiKeyRepository {
  constructor(model) {
    this.model = model;
  }

  async create(apikeyData, options) {
    throw new Error("Method not implemented");
  }

  async findById(apikeyId,options) {
    throw new Error("Method not implemented");
  }

  async findByKeyValue(apikeyValue,options) {
    throw new Error("Method not implemented");
  }

  async findByActive(isActive,options) {
    throw new Error("Method not implemented");
  }

  async findByClient(clientId,options) {
    throw new Error("Method not implemented");
  }
}
