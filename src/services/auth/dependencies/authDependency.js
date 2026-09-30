import MongoUserRepository from "../repository/MongoUserRepository.js";
import AuthService from "../service/authService.js";
import AuthController from "../controller/auth.controller.js";
import ClientDependency from "../../client/dependencies/clientDependency.js";

/**
 * Dependency Injection Container for the Auth module.
 * This container initializes and manages the dependencies for the Auth module,
 * including repositories, services, and controllers.
 */
class AuthDependency {
  static init() {
    const repository = {
      userRepository: new MongoUserRepository(),
    };

    const service = {
      authService: new AuthService({
        userRepository: repository.userRepository,
        clientService: ClientDependency.service.clientService,
      }),
    };

    const controller = {
      authController: new AuthController(service.authService),
    };

    return { repository, service, controller };
  }
}

const initialized = AuthDependency.init();
export { AuthDependency };
export default initialized;
