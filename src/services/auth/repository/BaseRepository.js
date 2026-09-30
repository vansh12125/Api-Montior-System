export default class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data,options) {
    throw new Error("Method not implemented");
  }

  async findById(id) {
    throw new Error("Method not implemented");
  }

  async findByUsername(username) {
    throw new Error("Method not implemented");
  }

  async findByEmail(email) {
    throw new Error("Method not implemented");
  }

  async findAll() {
    throw new Error("Method not implemented");
  }

  async findByEmailWithPassword(email) {
    throw new Error("Method not implemented");
  }

  async findAllActive() {
    throw new Error("Method not implemented");
  }

  async findByEmailOrUsername(email, username,options) {
    throw new Error("Method not implemented");
  }
  
  async findUserForLogin(context){
    throw new Error("Method not implemented");
  }
}
