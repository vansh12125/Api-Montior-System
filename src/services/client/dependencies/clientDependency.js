import MongoUserRepository from "../repository/MongoClientRepository.js";
import ClientService from "../service/clientService.js";

class ClientDependency {
  static init() {
    
    const repository = {
      clientRepository: new MongoUserRepository(),
    };

    const service = {
      clientService: new ClientService({
        clientRepository: repository.clientRepository,
      }),
    };

    return { repository, service };
  }
}

const initialized = ClientDependency.init();

export { ClientDependency };

export default initialized;
