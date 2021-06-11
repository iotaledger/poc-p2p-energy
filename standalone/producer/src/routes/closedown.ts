import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import { IProducerServiceConfiguration } from "p2p-energy-common/dist/models/config/producer/IProducerServiceConfiguration";
import { ILoggingService } from "p2p-energy-common/dist/models/services/ILoggingService";
import { IBasicProducerStrategyState } from "p2p-energy-common/dist/models/strategies/IBasicProducerStrategyState";
import { CaptureLoggingService } from "p2p-energy-common/dist/services/logging/captureLoggingService";
import { ProducerManager } from "p2p-energy-common/dist/services/producerManager";

/**
 * Closedown the producer.
 * @param config The service configuration.
 * @param request The request for the route.
 * @returns The route response.
 */
export async function closedown(config: IProducerServiceConfiguration): Promise<string[]> {
    const captureLoggingService = ServiceFactory.get<CaptureLoggingService>("capture-logging");
    captureLoggingService.enable(["closedown", "producer-closedown"]);

    const loggingService = ServiceFactory.get<ILoggingService>("logging");

    loggingService.log("closedown", "Closing Down");

    try {
        const producerService = ServiceFactory.get<ProducerManager<IBasicProducerStrategyState>>("producer");
        await producerService.closedown();

        loggingService.log("closedown", "Success");
    } catch (err) {
        loggingService.error("closedown", `Failed`, err);
    }

    const capture = captureLoggingService.getCapture();
    captureLoggingService.disable();
    return captureLoggingService.formatCapture(capture);
}
