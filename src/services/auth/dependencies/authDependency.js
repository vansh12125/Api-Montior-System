import MongoUserRepository from "../repository/MongoUserRepository.js";
import MongoTokenRepository from "../repository/MongoTokenRepository.js";
import AuthService from "../service/authService.js";
import TokenService from "../service/tokenService.js";
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
      tokenRepository: new MongoTokenRepository(),
    };

    const service = {
      authService: new AuthService({
        userRepository: repository.userRepository,
        clientService: ClientDependency.service.clientService,
        tokenService: new TokenService(repository.tokenRepository),
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
