import sharedDependencies from "../../shared/dependencies/sharedDependency.js";
import MongoTokenRepository from "../repository/MongoTokenRepository.js";
import AuthService from "../service/authService.js";
import TokenService from "../service/tokenService.js";
import AuthController from "../controller/auth.controller.js";
import ClientDependency from "../../client/dependencies/clientDependency.js";
import jwtMiddleware from "../../../middlewares/jwtAuth.middleware.js";

/**
 * Dependency Injection Container for the Auth module.
 * This container initializes and manages the dependencies for the Auth module,
 * including repositories, services, and controllers.
 */
class AuthDependency {
  static init() {
    const repository = {
      userRepository: sharedDependencies.repository.userRepository,
      tokenRepository: new MongoTokenRepository(),
    };

    const tokenService = new TokenService(repository.tokenRepository);

    const service = {
      tokenService,
      authService: new AuthService({
        userRepository: repository.userRepository,
        clientService: ClientDependency.service.clientService,
        tokenService,
      }),
    };

    const controller = {
      authController: new AuthController(service.authService),
    };

    const middleware = {
      jwtMiddleware: jwtMiddleware(service.tokenService),
    };

    return { repository, service, controller, middleware };
  }
}

const initialized = AuthDependency.init();
export { AuthDependency };
export default initialized;
