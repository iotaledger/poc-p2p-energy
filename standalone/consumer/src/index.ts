import { LoadBalancerSettings, RandomWalkStrategy } from "@iota/client-load-balancer";
import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import { IConsumerServiceConfiguration } from "p2p-energy-common/dist/models/config/consumer/IConsumerServiceConfiguration";
import { IBasicWalletState } from "p2p-energy-common/dist/models/services/IBasicWalletState";
import { IConsumerManagerState } from "p2p-energy-common/dist/models/state/IConsumerManagerState";
import { IBasicConsumerStrategyState } from "p2p-energy-common/dist/models/strategies/IBasicConsumerStrategyState";
import { ConsumerManager } from "p2p-energy-common/dist/services/consumerManager";
import { ConsoleLoggingService } from "p2p-energy-common/dist/services/logging/consoleLoggingService";
import { ApiRegistrationService } from "p2p-energy-common/dist/services/registration/apiRegistrationService";
import { ApiStorageService } from "p2p-energy-common/dist/services/storage/apiStorageService";
import { LocalFileStorageService } from "p2p-energy-common/dist/services/storage/localFileStorageService";
import { BasicWalletService } from "p2p-energy-common/dist/services/wallet/basicWalletService";
import { BasicConsumerStrategy } from "p2p-energy-common/dist/strategies/basicConsumerStrategy";

// tslint:disable:no-var-requires no-require-imports
const packageJson = require("../package.json");
const configId = process.env.CONFIG_ID || "local";
// tslint:disable-next-line:non-literal-require
const config: IConsumerServiceConfiguration = require(`./data/config.${configId}.json`);

const loggingService = new ConsoleLoggingService();

const loadBalancerSettings: LoadBalancerSettings = {
    nodeWalkStrategy: new RandomWalkStrategy(config.nodes),
    timeoutMs: 10000
};

ServiceFactory.register("logging", () => loggingService);
ServiceFactory.register("consumer-registration", () => new ApiRegistrationService(config.gridApiEndpoint));

if (config.localStorageFolder) {
    ServiceFactory.register(
        "consumer-storage-manager-state",
        () => new LocalFileStorageService<IConsumerManagerState<IBasicConsumerStrategyState>>(
            `${config.localStorageFolder}/consumer/state`));
    ServiceFactory.register(
        "wallet-state",
        () => new LocalFileStorageService<IBasicWalletState>(
            `${config.localStorageFolder}/wallet/state`));
} else {
    ServiceFactory.register(
        "consumer-storage-manager-state",
        () => new ApiStorageService<IConsumerManagerState<IBasicConsumerStrategyState>>(
            config.gridApiEndpoint,
            config.consumer.id,
            "config"));

    ServiceFactory.register(
        "wallet-state",
        () => new ApiStorageService<IBasicWalletState>(
            config.gridApiEndpoint,
            config.consumer.id,
            "wallet"));
}

ServiceFactory.register("wallet", () => new BasicWalletService(loadBalancerSettings, config.seed));

loggingService.log("app", `Consumer v${packageJson.version}`);
loggingService.log("app", `Config '${configId}'`);
loggingService.log("app", `   Id: ${config.consumer.id}`);
loggingService.log("app", `   Name: ${config.consumer.name}`);

/**
 * Start the consumer running.
 * @param consumerManager The consumer manager to start.
 */
async function start(consumerManager: ConsumerManager<IBasicConsumerStrategyState>): Promise<void> {
    await consumerManager.initialise();

    await consumerManager.updateStrategy();

    // Don't close down unless you want to remove the registration
    // await consumerService.closedown();
}

start(new ConsumerManager(config.consumer, loadBalancerSettings, new BasicConsumerStrategy()))
    // tslint:disable-next-line:no-console
    .catch(err => console.log(err));
