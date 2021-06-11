import { LoadBalancerSettings, RandomWalkStrategy } from "@iota/client-load-balancer";
import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import { IRoute } from "p2p-energy-common/dist/models/app/IRoute";
import { ISchedule } from "p2p-energy-common/dist/models/app/ISchedule";
import { AmazonS3StorageService } from "p2p-energy-common/dist/services/amazon/amazonS3StorageService";
import { AggregateLoggingService } from "p2p-energy-common/dist/services/logging/aggregateLoggingService";
import { CaptureLoggingService } from "p2p-energy-common/dist/services/logging/captureLoggingService";
import { ConsoleLoggingService } from "p2p-energy-common/dist/services/logging/consoleLoggingService";
import { LocalFileStorageService } from "p2p-energy-common/dist/services/storage/localFileStorageService";
import { App } from "p2p-energy-common/dist/utils/app";
import { ScheduleHelper } from "p2p-energy-common/dist/utils/scheduleHelper";
import { IDemoApiConfiguration } from "./models/IDemoApiConfiguration";
import { WalletService } from "./services/walletService";
import { WalletTransferService } from "./services/walletTransferService";

const routes: IRoute<IDemoApiConfiguration>[] = [
    { path: "/init", method: "get", func: "init" },
    { path: "/grid", method: "post", folder: "grid", func: "gridPost" },
    { path: "/grid/:name", method: "get", folder: "grid", func: "gridGet" },
    { path: "/grid/:name", method: "put", folder: "grid", func: "gridPut" },
    { path: "/grid/:name", method: "delete", folder: "grid", func: "gridDelete" },
    { path: "/grid/password/:name", method: "put", folder: "grid", func: "gridPasswordPut" },
    { path: "/wallet/poll", method: "get", folder: "wallet", func: "pollGet" },
    { path: "/wallet/:id/:incomingEpoch?/:outgoingEpoch?/", method: "get", folder: "wallet", func: "walletGet" },
    { path: "/wallet/:id/transfer/", method: "post", folder: "wallet", func: "transferPost" }
];

const captureLoggingService = new CaptureLoggingService();
ServiceFactory.register("capture-logging", () => captureLoggingService);
const loggingService = new AggregateLoggingService([new ConsoleLoggingService(), captureLoggingService]);
const app = new App<IDemoApiConfiguration>(4000, loggingService, __dirname);

app.build(routes, async (_1, config, _2) => {
    // tslint:disable-next-line: no-console
    ServiceFactory.register("logging", () => loggingService);
    if (config.localStorageFolder) {
        ServiceFactory.register(
            "storage",
            () => new LocalFileStorageService(`${config.localStorageFolder}/grids`)
        );
    } else if (config.s3Connection) {
        ServiceFactory.register(
            "storage",
            () => new AmazonS3StorageService(config.s3Connection, "grids"));
    }

    ServiceFactory.register(
        "wallet",
        () => new WalletService(config.dynamoDbConnection));

    const walletTransferService = new WalletTransferService(config.dynamoDbConnection, config.walletSeed);

    ServiceFactory.register(
        "wallet-transfer",
        () => walletTransferService);

    const loadBalancerSettings: LoadBalancerSettings = {
        nodeWalkStrategy: new RandomWalkStrategy(config.nodes),
        timeoutMs: 30000
    };

    ServiceFactory.register("load-balancer-settings", () => loadBalancerSettings);

    const schedules: ISchedule[] = [
        {
            name: "Poll Wallet",
            schedule: "*/5 * * * * *",
            func: async () => walletTransferService.poll(loadBalancerSettings)
        }
    ];

    await ScheduleHelper.build(schedules, loggingService);

}).catch(err => {
    loggingService.error("app", `Failed during app build`, err);
});
