import { composeAPI, LoadBalancerSettings } from "@iota/client-load-balancer";
import { generateAddress } from "@iota/core";
import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import { ILoggingService } from "p2p-energy-common/dist/models/services/ILoggingService";
import { AmazonS3Service } from "p2p-energy-common/dist/services/amazon/amazonS3Service";
import { CaptureLoggingService } from "p2p-energy-common/dist/services/logging/captureLoggingService";
import { IDemoApiConfiguration } from "../models/IDemoApiConfiguration";
import { IDemoWalletTransferContainer } from "../models/services/IDemoWalletTransferContainer";
import { WalletService } from "../services/walletService";
import { WalletTransferService } from "../services/walletTransferService";

/**
 * Initialise the components for the demo api.
 * @param config The service configuration.
 * @param request The request for the route.
 * @returns The route response.
 */
export async function init(config: IDemoApiConfiguration): Promise<string[]> {
    const captureLoggingService = ServiceFactory.get<CaptureLoggingService>("capture-logging");
    captureLoggingService.enable(["init", "s3", "dynamoDb"]);

    const loggingService = ServiceFactory.get<ILoggingService>("logging");
    loggingService.log("init", "Initializing");

    const loadBalancerSettings = ServiceFactory.get<LoadBalancerSettings>("load-balancer-settings");

    try {
        if (config.s3Connection) {
            await new AmazonS3Service(config.s3Connection, "grids")
                .createBucket(loggingService);
            await new WalletService(config.dynamoDbConnection)
                .createTable(loggingService);

            const walletTransferService = new WalletTransferService(config.dynamoDbConnection);
            await walletTransferService.createTable(loggingService);

            const global = await walletTransferService.get("global");

            loggingService.log("init", `Retrieving wallet balance`);
            const iota = composeAPI(loadBalancerSettings);

            const startIndex = global ? global.startIndex : 0;
            const endIndex = 1000;
            const itemsPerRequest = 25;

            let foundIndex = -1;
            for (let i = startIndex; i < endIndex && foundIndex === -1; i += itemsPerRequest) {

                const addresses = [];
                for (let j = 0; j < itemsPerRequest; j++) {
                    addresses.push(generateAddress(config.walletSeed, i + j, 2));
                }

                const balancesResponse = await iota.getBalances(addresses);

                const found: number = balancesResponse.balances.findIndex(b => b !== 0);
                if (found >= 0) {
                    foundIndex = found + i;
                }
            }

            if (foundIndex >= 0) {
                const inputsResponse = await iota.getInputs(config.walletSeed, { start: foundIndex });

                if (inputsResponse &&
                    inputsResponse.totalBalance > 0 &&
                    inputsResponse.inputs &&
                    inputsResponse.inputs.length > 0) {
                    loggingService.log("init", `Wallet balance ${inputsResponse.totalBalance}`);
                    const demoWalletTransferContainer: IDemoWalletTransferContainer = {
                        startIndex: inputsResponse.inputs[0].keyIndex,
                        lastUsedIndex: inputsResponse.inputs[inputsResponse.inputs.length - 1].keyIndex,
                        queue: []
                    };
                    await walletTransferService.set("global", demoWalletTransferContainer);
                }
            } else {
                loggingService.log("init", `Wallet Already Exists`);
            }
        }

        loggingService.log("init", `Initialization Complete`);
    } catch (err) {
        loggingService.error("init", `Initialization Failed`, err);
    }

    const capture = captureLoggingService.getCapture();
    captureLoggingService.disable();
    return captureLoggingService.formatCapture(capture);
}
