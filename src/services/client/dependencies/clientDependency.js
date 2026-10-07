import sharedDependencies from "../../shared/dependencies/sharedDependency.js";
import securityDependencies from "../../shared/dependencies/securityDependency.js";
import ClientService from "../service/clientService.js";
import ClientController from "../controller/client.controller.js";
import MongoClientRepository from "../repository/MongoClientRepository.js";

class ClientDependency {
  static init() {
    const repository = {
      clientRepository: new MongoClientRepository(),
      userRepository: sharedDependencies.repository.userRepository,
    };

    const service = {
      clientService: new ClientService({
        clientRepository: repository.clientRepository,
        userRepository: repository.userRepository,
        emailService: sharedDependencies.service.emailService,
      }),
    };

    const controller = {
      clientController: new ClientController(service.clientService),
    };

    const middleware = {
      jwtMiddleware: securityDependencies.middleware.jwtAuthMiddleware,
      clientAdminMiddleware:
        securityDependencies.middleware.clientAdminMiddleware,
    };

    return {
      repository,
      service,
      controller,
      middleware,
    };
  }
}

const initialized = ClientDependency.init();

export { ClientDependency };
export default initialized;
