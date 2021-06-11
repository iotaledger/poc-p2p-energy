import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import { IProducerServiceConfiguration } from "p2p-energy-common/dist/models/config/producer/IProducerServiceConfiguration";
import { ILoggingService } from "p2p-energy-common/dist/models/services/ILoggingService";
import { IBasicProducerStrategyState } from "p2p-energy-common/dist/models/strategies/IBasicProducerStrategyState";
import { CaptureLoggingService } from "p2p-energy-common/dist/services/logging/captureLoggingService";
import { ProducerManager } from "p2p-energy-common/dist/services/producerManager";

/**
 * Initialise the producer.
 * @param config The service configuration.
 * @param request The request for the route.
 * @returns The route response.
 */
export async function initialise(config: IProducerServiceConfiguration): Promise<string[]> {
    const captureLoggingService = ServiceFactory.get<CaptureLoggingService>("capture-logging");
    captureLoggingService.enable(["initialise", "producer-init"]);

    const loggingService = ServiceFactory.get<ILoggingService>("logging");

    loggingService.log("initialise", "Initializing");

    try {
        const producerService = ServiceFactory.get<ProducerManager<IBasicProducerStrategyState>>("producer");
        await producerService.initialise();

        loggingService.log("initialise", "Success");
    } catch (err) {
        loggingService.error("initialise", `Failed`, err);
    }

    const capture = captureLoggingService.getCapture();
    captureLoggingService.disable();
    return captureLoggingService.formatCapture(capture);
}
