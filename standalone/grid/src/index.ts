import { LoadBalancerSettings, RandomWalkStrategy } from "@iota/client-load-balancer";
import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import { IRoute } from "p2p-energy-common/dist/models/app/IRoute";
import { ISchedule } from "p2p-energy-common/dist/models/app/ISchedule";
import { IGridServiceConfiguration } from "p2p-energy-common/dist/models/config/grid/IGridServiceConfiguration";
import { IBasicWalletState } from "p2p-energy-common/dist/models/services/IBasicWalletState";
import { IGridManagerState } from "p2p-energy-common/dist/models/state/IGridManagerState";
import { IBasicGridStrategyState } from "p2p-energy-common/dist/models/strategies/IBasicGridStrategyState";
import { registrationDelete, registrationSet } from "p2p-energy-common/dist/routes/registrationRoutes";
import { storageDelete, storageGet, storageList, storageSet } from "p2p-energy-common/dist/routes/storageRoutes";
import { AmazonS3RegistrationService } from "p2p-energy-common/dist/services/amazon/amazonS3RegistrationService";
import { AmazonS3StorageService } from "p2p-energy-common/dist/services/amazon/amazonS3StorageService";
import { ConsumerUsageStoreService } from "p2p-energy-common/dist/services/db/consumerUsageStoreService";
import { ProducerOutputStoreService } from "p2p-energy-common/dist/services/db/producerOutputStoreService";
import { GridManager } from "p2p-energy-common/dist/services/gridManager";
import { AggregateLoggingService } from "p2p-energy-common/dist/services/logging/aggregateLoggingService";
import { CaptureLoggingService } from "p2p-energy-common/dist/services/logging/captureLoggingService";
import { ConsoleLoggingService } from "p2p-energy-common/dist/services/logging/consoleLoggingService";
import { RegistrationManagementService } from "p2p-energy-common/dist/services/registrationManagementService";
import { LocalFileStorageService } from "p2p-energy-common/dist/services/storage/localFileStorageService";
import { BasicWalletService } from "p2p-energy-common/dist/services/wallet/basicWalletService";
import { BasicGridStrategy } from "p2p-energy-common/dist/strategies/basicGridStrategy";
import { App } from "p2p-energy-common/dist/utils/app";
import { ScheduleHelper } from "p2p-energy-common/dist/utils/scheduleHelper";

const routes: IRoute<IGridServiceConfiguration>[] = [
    { path: "/init", method: "get", func: "init" },
    { path: "/storage/:registrationId/:context", method: "get", inline: storageList },
    { path: "/storage/:registrationId/:context/:id", method: "put", inline: storageSet, dataBody: true },
    { path: "/storage/:registrationId/:context/:id", method: "get", inline: storageGet },
    { path: "/storage/:registrationId/:context?/:id?", method: "delete", inline: storageDelete },
    { path: "/registration/:registrationId", method: "put", inline: registrationSet },
    { path: "/registration/:registrationId/:sideKey", method: "delete", inline: registrationDelete }
];

const captureLoggingService = new CaptureLoggingService();
ServiceFactory.register("capture-logging", () => captureLoggingService);
const loggingService = new AggregateLoggingService([new ConsoleLoggingService(), captureLoggingService]);
const app = new App<IGridServiceConfiguration>(4000, loggingService, __dirname);

app.build(routes, async (_1, config, _2) => {
    loggingService.log("app", `Tangle Providers ${config.nodes.map(t => t.provider).join(", ")}`);

    ServiceFactory.register("logging", () => loggingService);
    if (config.localStorageFolder) {
        ServiceFactory.register(
            "registration-storage",
            () => new LocalFileStorageService(`${config.localStorageFolder}/grid/registration`)
        );

        ServiceFactory.register(
            "grid-storage-manager-state",
            () => new LocalFileStorageService<IGridManagerState<IBasicGridStrategyState>>
                (`${config.localStorageFolder}/grid/state`));

        ServiceFactory.register(
            "wallet-state",
            () => new LocalFileStorageService<IBasicWalletState>
                (`${config.localStorageFolder}/wallet/state`));
    } else if (config.dynamoDbConnection) {
        ServiceFactory.register(
            "registration-storage",
            () => new AmazonS3RegistrationService(config.dynamoDbConnection));

        ServiceFactory.register(
            "grid-storage-manager-state",
            () => new AmazonS3StorageService(config.s3Connection, "config"));

        ServiceFactory.register(
            "wallet-state",
            () => new AmazonS3StorageService(config.s3Connection, "wallet"));
    }

    const loadBalancerSettings: LoadBalancerSettings = {
        nodeWalkStrategy: new RandomWalkStrategy(config.nodes),
        timeoutMs: 10000
    };

    ServiceFactory.register("load-balancer-settings", () => loadBalancerSettings);

    ServiceFactory.register("wallet", () => new BasicWalletService(loadBalancerSettings, config.seed));

    const gridManager = new GridManager(config.grid, loadBalancerSettings, new BasicGridStrategy());
    const registrationManagementService =
        new RegistrationManagementService(loadBalancerSettings, registration => registration.itemType === "consumer");

    ServiceFactory.register("registration-management", () => registrationManagementService);
    ServiceFactory.register("grid", () => gridManager);

    if (config.localStorageFolder) {
        ServiceFactory.register(
            "storage",
            () => new LocalFileStorageService(`${config.localStorageFolder}/${config.grid.id}/storage`));
    } else if (config.s3Connection) {
        ServiceFactory.register(
            "storage",
            () => new AmazonS3StorageService(config.s3Connection, "storage"));
    }
    if (config.localStorageFolder) {
        ServiceFactory.register(
            "grid-producer-output-store",
            () => new LocalFileStorageService(`${config.localStorageFolder}/${config.grid.id}/producer`));
        ServiceFactory.register(
            "grid-consumer-usage-store",
            () => new LocalFileStorageService(`${config.localStorageFolder}/${config.grid.id}/consumer`));
    } else if (config.dynamoDbConnection) {
        ServiceFactory.register(
            "grid-producer-output-store",
            () => new ProducerOutputStoreService(config.dynamoDbConnection));
        ServiceFactory.register(
            "grid-consumer-usage-store",
            () => new ConsumerUsageStoreService(config.dynamoDbConnection));
    }

    await gridManager.initialise();
    await registrationManagementService.loadRegistrations();

    const schedules: ISchedule[] = [
        {
            name: "Poll for Commands",
            schedule: "*/15 * * * * *",
            func: async () => registrationManagementService.pollCommands(
                (registration, commands) => gridManager.handleCommands(registration, commands))
        },
        {
            name: "Update Strategy",
            schedule: "*/15 * * * * *",
            func: async () => {
                const commands = await gridManager.updateStrategy();
                await registrationManagementService.returnCommands(commands);
            }
        }
    ];

    await ScheduleHelper.build(schedules, loggingService);
}).catch(err => {
    loggingService.error("app", `Failed during app build`, err);
});
