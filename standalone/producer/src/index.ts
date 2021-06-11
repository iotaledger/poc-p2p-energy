import { LoadBalancerSettings, RandomWalkStrategy } from "@iota/client-load-balancer";
import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import { IRoute } from "p2p-energy-common/dist/models/app/IRoute";
import { ISchedule } from "p2p-energy-common/dist/models/app/ISchedule";
import { IProducerServiceConfiguration } from "p2p-energy-common/dist/models/config/producer/IProducerServiceConfiguration";
import { ISourceStore } from "p2p-energy-common/dist/models/db/producer/ISourceStore";
import { IBasicWalletState } from "p2p-energy-common/dist/models/services/IBasicWalletState";
import { IRegistration } from "p2p-energy-common/dist/models/services/registration/IRegistration";
import { IProducerManagerState } from "p2p-energy-common/dist/models/state/IProducerManagerState";
import { IBasicProducerStrategyState } from "p2p-energy-common/dist/models/strategies/IBasicProducerStrategyState";
import { registrationDelete, registrationSet } from "p2p-energy-common/dist/routes/registrationRoutes";
import { storageDelete, storageGet, storageList, storageSet } from "p2p-energy-common/dist/routes/storageRoutes";
import { AggregateLoggingService } from "p2p-energy-common/dist/services/logging/aggregateLoggingService";
import { CaptureLoggingService } from "p2p-energy-common/dist/services/logging/captureLoggingService";
import { ConsoleLoggingService } from "p2p-energy-common/dist/services/logging/consoleLoggingService";
import { ProducerManager } from "p2p-energy-common/dist/services/producerManager";
import { ApiRegistrationService } from "p2p-energy-common/dist/services/registration/apiRegistrationService";
import { RegistrationManagementService } from "p2p-energy-common/dist/services/registrationManagementService";
import { ApiStorageService } from "p2p-energy-common/dist/services/storage/apiStorageService";
import { LocalFileStorageService } from "p2p-energy-common/dist/services/storage/localFileStorageService";
import { BasicWalletService } from "p2p-energy-common/dist/services/wallet/basicWalletService";
import { BasicProducerStrategy } from "p2p-energy-common/dist/strategies/basicProducerStrategy";
import { App } from "p2p-energy-common/dist/utils/app";
import { ScheduleHelper } from "p2p-energy-common/dist/utils/scheduleHelper";

const routes: IRoute<IProducerServiceConfiguration>[] = [
    { path: "/initialise", method: "get", func: "initialise" },
    { path: "/closedown", method: "get", func: "closedown" },
    { path: "/reset", method: "get", func: "reset" },
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
const app = new App<IProducerServiceConfiguration>(4001, loggingService, __dirname);

app.build(routes, async (_1, config, _2) => {
    loggingService.log("app", `Tangle Providers ${config.nodes.map(t => t.provider).join(", ")}`);

    ServiceFactory.register("logging", () => loggingService);

    const loadBalancerSettings: LoadBalancerSettings = {
        nodeWalkStrategy: new RandomWalkStrategy(config.nodes),
        timeoutMs: 10000
    };

    ServiceFactory.register("load-balancer-settings", () => loadBalancerSettings);

    if (config.localStorageFolder) {
        ServiceFactory.register(
            "registration-storage",
            () => new LocalFileStorageService<IRegistration>(
                `${config.localStorageFolder}/${config.producer.id}/registration`)
        );

        ServiceFactory.register(
            "producer-storage-manager-state",
            () => new LocalFileStorageService<IProducerManagerState<IBasicProducerStrategyState>>(
                `${config.localStorageFolder}/${config.producer.id}/state`)
        );

        ServiceFactory.register(
            "wallet-state",
            () => new LocalFileStorageService<IBasicWalletState>(
                `${config.localStorageFolder}/${config.producer.id}/wallet`)
        );
    } else {
        ServiceFactory.register(
            "registration-storage",
            () => new ApiStorageService<IRegistration>(config.gridApiEndpoint, config.producer.id, "registration")
        );

        ServiceFactory.register(
            "producer-storage-manager-state",
            () => new ApiStorageService<IProducerManagerState<IBasicProducerStrategyState>>(
                config.gridApiEndpoint,
                config.producer.id,
                "config"
            ));

        ServiceFactory.register(
            "wallet-state",
            () => new ApiStorageService<IBasicWalletState>(
                config.gridApiEndpoint,
                config.producer.id,
                "wallet"
            ));
    }

    ServiceFactory.register("producer-registration", () => new ApiRegistrationService(config.gridApiEndpoint));

    ServiceFactory.register("wallet", () => new BasicWalletService(loadBalancerSettings, config.seed));

    const producerManager = new ProducerManager(config.producer, loadBalancerSettings, new BasicProducerStrategy());
    const registrationManagementService =
        new RegistrationManagementService(loadBalancerSettings, () => false);

    ServiceFactory.register("registration-management", () => registrationManagementService);
    ServiceFactory.register("producer", () => producerManager);

    if (config.localStorageFolder) {
        ServiceFactory.register(
            "storage",
            () => new LocalFileStorageService<any>(`${config.localStorageFolder}/${config.producer.id}/storage`));

        ServiceFactory.register(
            "producer-source-output-store",
            () => new LocalFileStorageService<ISourceStore>(
                `${config.localStorageFolder}/source-output`));
    } else {
        ServiceFactory.register(
            "storage",
            () => new ApiStorageService<any>(config.gridApiEndpoint, config.producer.id, "storage")
        );
        ServiceFactory.register(
            "producer-source-output-store",
            () => new ApiStorageService<ISourceStore>(config.gridApiEndpoint, config.producer.id, "source-output")
        );
    }

    await producerManager.initialise();
    await registrationManagementService.loadRegistrations();

    const schedules: ISchedule[] = [
        {
            name: "Poll for Commands",
            schedule: "*/15 * * * * *",
            func: async () => registrationManagementService.pollCommands(
                (registration, commands) => producerManager.handleCommands(registration, commands))
        },
        {
            name: "Update Strategy",
            schedule: "*/60 * * * * *",
            func: async () => {
                await producerManager.updateStrategy();
            }
        }
    ];

    await ScheduleHelper.build(schedules, loggingService);
}).catch(err => {
    loggingService.error("app", `Failed during app build`, err);
});
