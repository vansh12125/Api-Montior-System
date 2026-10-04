import MongoUserRepository from "../repository/MongoUserRepository.js";
import EmailService from "../service/emailService.js";

class SharedDependency {
  static init() {
    const repository = {
      userRepository: new MongoUserRepository(),
    };

    const service = {
      emailService: new EmailService(),
    };

    return { repository, service };
  }
}

const initialized = SharedDependency.init();

export { SharedDependency };
export default initialized;
