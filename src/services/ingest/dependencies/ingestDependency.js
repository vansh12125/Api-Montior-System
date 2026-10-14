import { createEventFactory } from "../../shared/events/producer/EventFactory.js";
import IngestService from "../service/ingestService.js";
import IngestController from "../controller/ingest.controller.js";

class IngestDependency {
  static init() {
    const eventProducer = createEventFactory();

    const service = {
      ingestService: new IngestService({ eventProducer }),
    };

    const controller = {
      ingestController: new IngestController(service),
    };

    return { service, controller };
  }
}

const container = IngestDependency.init();
export default {
  ingestService: container.service.ingestService,
  ingestController: container.controller.ingestController,
  IngestDependency,
};
