import { LoadBalancerSettings, RandomWalkStrategy } from "@iota/client-load-balancer";
import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import { ISourceServiceConfiguration } from "p2p-energy-common/dist/models/config/source/ISourceServiceConfiguration";
import { ISourceManagerState } from "p2p-energy-common/dist/models/state/ISourceManagerState";
import { IBasicSourceStrategyState } from "p2p-energy-common/dist/models/strategies/IBasicSourceStrategyState";
import { ConsoleLoggingService } from "p2p-energy-common/dist/services/logging/consoleLoggingService";
import { ApiRegistrationService } from "p2p-energy-common/dist/services/registration/apiRegistrationService";
import { SourceManager } from "p2p-energy-common/dist/services/sourceManager";
import { ApiStorageService } from "p2p-energy-common/dist/services/storage/apiStorageService";
import { LocalFileStorageService } from "p2p-energy-common/dist/services/storage/localFileStorageService";
import { BasicSourceStrategy } from "p2p-energy-common/dist/strategies/basicSourceStrategy";

// tslint:disable:no-var-requires no-require-imports
const packageJson = require("../package.json");
const configId = process.env.CONFIG_ID || "local";
// tslint:disable-next-line:non-literal-require
const config: ISourceServiceConfiguration = require(`./data/config.${configId}.json`);

const loggingService = new ConsoleLoggingService();

const loadBalancerSettings: LoadBalancerSettings = {
    nodeWalkStrategy: new RandomWalkStrategy(config.nodes),
    timeoutMs: 10000
};

ServiceFactory.register("logging", () => loggingService);
ServiceFactory.register("source-registration", () => new ApiRegistrationService(config.producerApiEndpoint));

if (config.localStorageFolder) {
    ServiceFactory.register(
        "source-storage-manager-state",
        () => new LocalFileStorageService<ISourceManagerState<IBasicSourceStrategyState>>(
            `${config.localStorageFolder}/${config.source.id}/state`
        ));
} else {
    ServiceFactory.register(
        "source-storage-manager-state",
        () => new ApiStorageService<ISourceManagerState<IBasicSourceStrategyState>> (
            config.producerApiEndpoint,
            config.source.id,
            "config"));
}

loggingService.log("app", `Source v${packageJson.version}`);
loggingService.log("app", `Config '${configId}'`);
loggingService.log("app", `   Id: ${config.source.id}`);
loggingService.log("app", `   Name: ${config.source.name}`);
loggingService.log("app", `   Type: ${config.source.type}`);

/**
 * Start the source running.
 * @param sourceManager The source manager to start.
 */
async function start(sourceManager: SourceManager<IBasicSourceStrategyState>): Promise<void> {
    await sourceManager.initialise();

    await sourceManager.updateStrategy();

    // Don't close down unless you want to remove the registration
    // await sourceService.closedown();
}

start(new SourceManager(config.source, loadBalancerSettings, new BasicSourceStrategy()))
    // tslint:disable-next-line:no-console
    .catch(err => console.log(err));
