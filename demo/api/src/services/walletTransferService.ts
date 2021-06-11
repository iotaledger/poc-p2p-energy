import { composeAPI, LoadBalancerSettings } from "@iota/client-load-balancer";
import { API, generateAddress, Inputs, Transfer } from "@iota/core";
import { Transaction } from "@iota/transaction-converter";
import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import { IAWSDynamoDbConfiguration } from "p2p-energy-common/dist/models/config/IAWSDynamoDbConfiguration";
import { ILoggingService } from "p2p-energy-common/dist/models/services/ILoggingService";
import { AmazonDynamoDbService } from "p2p-energy-common/dist/services/amazon/amazonDynamoDbService";
import { TrytesHelper } from "p2p-energy-common/dist/utils/trytesHelper";
import { IDemoWalletTransfer } from "../models/services/IDemoWalletTransfer";
import { IDemoWalletTransferContainer } from "../models/services/IDemoWalletTransferContainer";
import { WalletService } from "./walletService";

/**
 * Service to payment entities states in AmazonS3.
 */
export class WalletTransferService extends AmazonDynamoDbService<IDemoWalletTransferContainer> {
    /**
     * The name of the database table.
     */
    public static readonly TABLE_NAME: string = "transfer";

    /**
     * The logging service.
     */
    private readonly _loggingService: ILoggingService;

    /**
     * The wallet service.
     */
    private readonly _walletService: WalletService;

    /**
     * Is the service busy doing an update already.
     */
    private _isBusy: boolean;

    /**
     * The seed for the global wallet.
     */
    private readonly _globalSeed: string;

    /**
     * Transfers ready to add.
     */
    private _toAdd: IDemoWalletTransfer[];

    /**
     * Create a new instance of PaymentRegistrationService
     * @param config The configuration.
     * @param globalSeed The seed for the global wallet.
     */
    constructor(config: IAWSDynamoDbConfiguration, globalSeed?: string) {
        super(config, WalletTransferService.TABLE_NAME, "id");

        this._globalSeed = globalSeed;
        this._toAdd = [];
        this._loggingService = ServiceFactory.get<ILoggingService>("logging");
        this._walletService = ServiceFactory.get<WalletService>("wallet");
    }

    /**
     * Add a new transfer for the service to perform.
     * @param transfer The tranfer to add
     */
    public addTransfer(transfer: IDemoWalletTransfer): void {
        this._toAdd.push(transfer);
    }

    /**
     * Send any pending transfers.
     * @param loadBalancerSettings The load balancer settings.
     */
    public async poll(loadBalancerSettings: LoadBalancerSettings): Promise<void> {
        if (!this._isBusy) {
            this._isBusy = true;

            const walletTransferContainer = await super.get("global");

            let updated1 = false;
            if (walletTransferContainer) {
                if (this._toAdd.length > 0) {
                    walletTransferContainer.queue = walletTransferContainer.queue.concat(this._toAdd);
                    this._toAdd = [];
                    updated1 = true;
                }

                const iota = composeAPI(
                    loadBalancerSettings
                );

                const updated2 = await this.checkPending(iota, walletTransferContainer);

                const updated3 = await this.sendTransaction(iota, walletTransferContainer);

                if (updated1 || updated2 || updated3) {
                    await super.set("global", walletTransferContainer);
                }
            }

            this._isBusy = false;
        }
    }

    /**
     * Send the next transaction if we have no pending one.
     * @param iota The iota API instance.
     * @param walletTransferContainer The current transfers.
     * @returns True if the state was updated.
     */
    private async sendTransaction(iota: API, walletTransferContainer: IDemoWalletTransferContainer): Promise<boolean> {
        let updated = false;

        if (!walletTransferContainer.pending && walletTransferContainer.queue.length > 0) {
            try {
                const nextTransfer = walletTransferContainer.queue[0];

                const inputsResponse: Inputs =
                    await iota.getInputs(this._globalSeed, {
                        start: walletTransferContainer.startIndex,
                        end: walletTransferContainer.lastUsedIndex
                    });

                if (inputsResponse && inputsResponse.inputs && inputsResponse.inputs.length > 0) {
                    const lastUsed = Math.max(
                        walletTransferContainer.lastUsedIndex,
                        inputsResponse.inputs[inputsResponse.inputs.length - 1].keyIndex);

                    const remainderAddress = generateAddress(
                        this._globalSeed,
                        lastUsed + 1,
                        2);

                    nextTransfer.address = generateAddress(
                        this._globalSeed,
                        lastUsed + 2,
                        2);

                    const trytes = await iota.prepareTransfers(
                        this._globalSeed,
                        [{
                            address: nextTransfer.address,
                            value: nextTransfer.value,
                            tag: nextTransfer.tag,
                            message: TrytesHelper.toTrytes(nextTransfer.transfer)
                        }],
                        {
                            inputs: inputsResponse.inputs,
                            remainderAddress
                        });

                    const sendTrytesResponse: Transaction[] =
                        await iota.sendTrytes(trytes, undefined, undefined);

                    nextTransfer.bundle = sendTrytesResponse[0].bundle;
                    nextTransfer.created = Date.now();

                    this._loggingService.log(
                        "wallet",
                        `Created transaction ${sendTrytesResponse[0].hash}`,
                        nextTransfer.value);

                    walletTransferContainer.pending = nextTransfer;
                    walletTransferContainer.startIndex = inputsResponse.inputs[0].keyIndex;
                    walletTransferContainer.lastUsedIndex = lastUsed + 2;
                }
                walletTransferContainer.queue.shift();
                updated = true;
            } catch (err) {
                this._loggingService.error("wallet", "Sending transaction", err);
            }
        }

        return updated;
    }

    /**
     * Confirm the current pending transaction.
     * @param iota The iota API instance.
     * @param walletTransferContainer The current transfers.
     * @returns True if the state was updated.
     */
    private async checkPending(iota: API, walletTransferContainer: IDemoWalletTransferContainer): Promise<boolean> {
        let updated = false;

        if (walletTransferContainer.pending) {
            try {
                const txs: Transaction[] =
                    await iota.findTransactionObjects({ bundles: [walletTransferContainer.pending.bundle] });

                if (txs && txs.length > 0) {
                    const remainingByHash: { [hash: string]: Transaction } = {};
                    const tailTransactions: Transaction[] = [];

                    for (let i = 0; i < txs.length; i++) {
                        if (txs[i].currentIndex === 0) {
                            tailTransactions.push(txs[i]);
                        } else {
                            remainingByHash[txs[i].hash] = txs[i];
                        }
                    }

                    tailTransactions.sort((a, b) => a.attachmentTimestamp - b.attachmentTimestamp);

                    let confirmedIndex = -1;
                    for (let i = 0; i < tailTransactions.length; i++) {
                        let currentHash = tailTransactions[i].trunkTransaction;
                        const subBundle = [tailTransactions[i]];

                        while (remainingByHash[currentHash]) {
                            subBundle.push(remainingByHash[currentHash]);
                            currentHash = remainingByHash[currentHash].trunkTransaction;
                        }

                        const states = await iota.getInclusionStates(subBundle.map(tx => tx.hash));

                        if (states.indexOf(false) < 0) {
                            confirmedIndex = i;
                            break;
                        }
                    }

                    if (confirmedIndex >= 0) {
                        const fromWallet = await this._walletService.getOrCreate(
                            walletTransferContainer.pending.transfer.from);
                        if (fromWallet) {
                            fromWallet.balance -= walletTransferContainer.pending.value;

                            fromWallet.outgoingTransfers = fromWallet.outgoingTransfers || [];
                            fromWallet.outgoingTransfers.push(walletTransferContainer.pending);
                            await this._walletService.set(fromWallet.id, fromWallet);
                        }

                        const toWallet = await this._walletService.getOrCreate(
                            walletTransferContainer.pending.transfer.to);
                        if (toWallet) {
                            toWallet.balance += walletTransferContainer.pending.value;

                            toWallet.incomingTransfers = toWallet.incomingTransfers || [];
                            toWallet.incomingTransfers.push(walletTransferContainer.pending);

                            await this._walletService.set(toWallet.id, toWallet);
                        }

                        walletTransferContainer.pending = undefined;
                        updated = true;

                        this._loggingService.log(
                            "wallet",
                            `Confirmed transaction ${tailTransactions[confirmedIndex].hash}`);
                    } else {
                        let requeue = false;
                        if (tailTransactions.length === 0) {
                            if (walletTransferContainer.pending.created &&
                                Date.now() - walletTransferContainer.pending.created > 10000) {
                                requeue = true;
                                this._loggingService.log(
                                    "wallet",
                                    `No tail transaction requeueing`);
                            }
                        } else {
                            const tail = tailTransactions[0].hash;
                            const attachmentTimestamp = tailTransactions[0].attachmentTimestamp;
                            const timeSinceAttachment = Date.now() - attachmentTimestamp;

                            // If it is taking a long time to attach the bundle (10s)
                            // try promoting it
                            if (timeSinceAttachment > 10000) {
                                const isConsistent = await iota.checkConsistency([tail]);

                                const MILESTONE_INTERVAL = 2 * 60 * 1000;
                                const ONE_WAY_DELAY = 1 * 60 * 1000;
                                const DEPTH = 6;

                                const isAboveMaxDepth = (at: number, depth = DEPTH) =>
                                    at < Date.now() && Date.now() - at < depth * MILESTONE_INTERVAL - ONE_WAY_DELAY;

                                if (isConsistent && isAboveMaxDepth(attachmentTimestamp)) {
                                    this._loggingService.log(
                                        "wallet",
                                        `Promoting bundle ${tail}`);

                                    const spamTransfers: Transfer[] = [
                                        {
                                            address: "9".repeat(81),
                                            value: 0,
                                            tag: "9".repeat(27),
                                            message: "9".repeat(27 * 81)
                                        }
                                    ];

                                    const spamTrytes = await iota.prepareTransfers(
                                        "9".repeat(81),
                                        spamTransfers
                                    );

                                    await iota.sendTrytes(spamTrytes, undefined, undefined, tail);
                                } else {
                                    requeue = true;
                                }
                            }
                        }

                        if (requeue) {
                            // Bundle is not promotable so just requeue it
                            walletTransferContainer.pending.address = undefined;
                            walletTransferContainer.pending.created = undefined;
                            walletTransferContainer.pending.bundle = undefined;
                            walletTransferContainer.queue.unshift(walletTransferContainer.pending);
                            walletTransferContainer.pending = undefined;
                            updated = true;

                            this._loggingService.log(
                                "wallet",
                                `Requeuing bundle`);
                        }
                    }
                }
            } catch (err) {
                this._loggingService.error("wallet", "Confirming transaction", err);
            }
        }
        return updated;
    }
}
