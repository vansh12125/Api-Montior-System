import { ApiHitRepository } from "../repository/MongoApiHitRepository.js";
import { MetricsRepository } from "../repository/PostgresMetricsRepository.js";
import { postgres } from "../../../configs/index.js";
import { ProcessorService } from "../service/ProcessorService.js";

class Container {
  static init() {
    const repository = {
      apiHitRepository: new ApiHitRepository(),
      metricsRepository: new MetricsRepository(postgres),
    };

    const services = {
      processorService: new ProcessorService(repository),
    };

    return { repository, services };
  }
}

const initialized = Container.init();
export { Container };
export default initialized;
