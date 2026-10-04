import MongoTokenRepository from "../../auth/repository/MongoTokenRepository.js";
import TokenService from "../../auth/service/tokenService.js";
import jwtMiddleware from "../../../middlewares/jwtAuth.middleware.js";
import clientAdminAuthorization from "../../../middlewares/clientAdminAuthorization.middleware.js";
import sharedDependency from "../dependencies/sharedDependency.js";

class SecurityDependency {
  static init() {
    const tokenRepository = new MongoTokenRepository();

    const tokenService = new TokenService(tokenRepository);

    const jwtAuthMiddleware = jwtMiddleware(tokenService);

    const clientAdminMiddleware = clientAdminAuthorization(
      sharedDependency.repository.userRepository,
    );

    return {
      repository: {
        tokenRepository,
      },
      service: {
        tokenService,
      },
      middleware: {
        jwtAuthMiddleware,
        clientAdminMiddleware,
      },
    };
  }
}

const initialized = SecurityDependency.init();

export { SecurityDependency };
export default initialized;
