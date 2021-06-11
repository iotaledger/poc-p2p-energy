import { LoadBalancerSettings } from "@iota/client-load-balancer";
import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import { IGridServiceConfiguration } from "p2p-energy-common/dist/models/config/grid/IGridServiceConfiguration";
import { ILoggingService } from "p2p-energy-common/dist/models/services/ILoggingService";
import { AmazonS3RegistrationService } from "p2p-energy-common/dist/services/amazon/amazonS3RegistrationService";
import { AmazonS3Service } from "p2p-energy-common/dist/services/amazon/amazonS3Service";
import { BundleCacheService } from "p2p-energy-common/dist/services/db/bundleCacheService";
import { ConsumerUsageStoreService } from "p2p-energy-common/dist/services/db/consumerUsageStoreService";
import { ProducerOutputStoreService } from "p2p-energy-common/dist/services/db/producerOutputStoreService";
import { TransactionCacheService } from "p2p-energy-common/dist/services/db/transactionCacheService";
import { CaptureLoggingService } from "p2p-energy-common/dist/services/logging/captureLoggingService";

/**
 * Initialise the components for the Grid.
 * @param config The service configuration.
 * @param request The request for the route.
 * @returns The route response.
 */
export async function init(config: IGridServiceConfiguration): Promise<string[]> {
    const captureLoggingService = ServiceFactory.get<CaptureLoggingService>("capture-logging");
    captureLoggingService.enable(["init", "s3", "dynamoDb"]);

    const loggingService = ServiceFactory.get<ILoggingService>("logging");

    loggingService.log("init", "Initializing");

    const loadBalancerSettings = ServiceFactory.get<LoadBalancerSettings>("load-balancer-settings");

    try {
        if (config.dynamoDbConnection) {
            await new BundleCacheService(config.dynamoDbConnection)
                .createTable(loggingService);
            await new TransactionCacheService(config.dynamoDbConnection, loadBalancerSettings)
                .createTable(loggingService);
            await new AmazonS3RegistrationService(config.dynamoDbConnection)
                .createTable(loggingService);
            await new ProducerOutputStoreService(config.dynamoDbConnection)
                .createTable(loggingService);
            await new ConsumerUsageStoreService(config.dynamoDbConnection)
                .createTable(loggingService);
        }

        if (config.s3Connection) {
            await new AmazonS3Service(config.s3Connection, "storage")
                .createBucket(loggingService);
        }

        loggingService.log("init", `Initialization Complete`);
    } catch (err) {
        loggingService.error("init", `Initialization Failed`, err);
    }

    const capture = captureLoggingService.getCapture();
    captureLoggingService.disable();
    return captureLoggingService.formatCapture(capture);
}
