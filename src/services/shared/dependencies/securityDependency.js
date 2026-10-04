import MongoTokenRepository from "../../auth/repository/MongoTokenRepository.js";
import TokenService from "../../auth/service/tokenService.js";
import jwtMiddleware from "../../../middlewares/jwtAuth.middleware.js";

class SecurityDependency {
  static init() {
    const tokenRepository = new MongoTokenRepository();

    const tokenService = new TokenService(tokenRepository);

    const jwtAuthMiddleware = jwtMiddleware(tokenService);

    return {
      repository: {
        tokenRepository,
      },
      service: {
        tokenService,
      },
      middleware: {
        jwtAuthMiddleware,
      },
    };
  }
}

const initialized = SecurityDependency.init();

export { SecurityDependency };
export default initialized;