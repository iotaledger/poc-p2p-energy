import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import { IProducerServiceConfiguration } from "p2p-energy-common/dist/models/config/producer/IProducerServiceConfiguration";
import { ILoggingService } from "p2p-energy-common/dist/models/services/ILoggingService";
import { IBasicProducerStrategyState } from "p2p-energy-common/dist/models/strategies/IBasicProducerStrategyState";
import { CaptureLoggingService } from "p2p-energy-common/dist/services/logging/captureLoggingService";
import { ProducerManager } from "p2p-energy-common/dist/services/producerManager";

/**
 * Reset the producer.
 * @param config The service configuration.
 * @param request The request for the route.
 * @returns The route response.
 */
export async function reset(config: IProducerServiceConfiguration): Promise<string[]> {
    const captureLoggingService = ServiceFactory.get<CaptureLoggingService>("capture-logging");
    captureLoggingService.enable(["reset", "producer-reset"]);

    const loggingService = ServiceFactory.get<ILoggingService>("logging");

    loggingService.log("reset", "Resetting");
    try {
        const producerService = ServiceFactory.get<ProducerManager<IBasicProducerStrategyState>>("producer");
        await producerService.reset();

        loggingService.log("reset", "Success");
    } catch (err) {
        loggingService.error("reset", `Failed`, err);
    }

    const capture = captureLoggingService.getCapture();
    captureLoggingService.disable();
    return captureLoggingService.formatCapture(capture);
}
