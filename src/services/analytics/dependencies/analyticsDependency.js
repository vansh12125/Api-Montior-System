import { AnalyticsController } from "../controller/analytics.controller.js";
import { AnalyticsService } from "../service/analyticsService.js";
import securityDependencies from "../../shared/dependencies/securityDependency.js";
import processorDependency from "../../processor/dependencies/processorDependency.js";

class AnalyticsDependency {
  static init() {
    const repositories = {
      metricsRepository: processorDependency.repository.metricsRepository,
      apiHitRepository: processorDependency.repository.apiHitRepository,
    };

    const service = {
      analyticsService: new AnalyticsService({
        metricsRepository: repositories.metricsRepository,
        apiHitRepository: repositories.apiHitRepository,
      }),
    };

    const controller = {
      analyticsController: new AnalyticsController({
        analyticsService: service.analyticsService,
      }),
    };

    const middleware = {
      jwtMiddleware: securityDependencies.middleware.jwtAuthMiddleware,
      clientAdminMiddleware:
        securityDependencies.middleware.clientAdminMiddleware,
    };

    return { repositories, controller, service, middleware };
  }
}

const initialized = AnalyticsDependency.init();
export { AnalyticsDependency };
export default initialized;
