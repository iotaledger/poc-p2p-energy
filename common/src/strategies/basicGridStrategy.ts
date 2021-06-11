import { ServiceFactory } from "../factories/serviceFactory";
import { IGridConfiguration } from "../models/config/grid/IGridConfiguration";
import { IConsumerUsageEntry } from "../models/db/grid/IConsumerUsageEntry";
import { IProducerOutputEntry } from "../models/db/grid/IProducerOutputEntry";
import { IConsumerPaymentRequestCommand } from "../models/mam/IConsumerPaymentRequestCommand";
import { ILoggingService } from "../models/services/ILoggingService";
import { IWalletService } from "../models/services/IWalletService";
import { IGridManagerState } from "../models/state/IGridManagerState";
import { IBasicGridStrategyConsumerTotals } from "../models/strategies/IBasicGridStrategyConsumerTotals";
import { IBasicGridStrategyState } from "../models/strategies/IBasicGridStrategyState";
import { IGridStrategy } from "../models/strategies/IGridStrategy";

/**
 * Basic implementation of a grid strategy.
 */
export class BasicGridStrategy implements IGridStrategy<IBasicGridStrategyState> {
    /**
     * Logging service.
     */
    private readonly _loggingService: ILoggingService;

    /**
     * Wallet service.
     */
    private readonly _walletService: IWalletService;

    /**
     * Create a new instance of BasicGridStrategy.
     */
    constructor() {
        this._loggingService = ServiceFactory.get<ILoggingService>("logging");
        this._walletService = ServiceFactory.get<IWalletService>("wallet");
    }

    /**
     * Initialise the state.
     * @returns The state of the grid.
     */
    public async initState(): Promise<IBasicGridStrategyState> {
        return {
            runningCostsTotal: 0,
            runningCostsReceived: 0,
            distributionAvailable: 0,
            producerTotals: {},
            consumerTotals: {},
            lastTransferCheck: 0,
            lastIncomingTransfer: undefined,
            lastOutgoingTransfer: undefined
        };
    }

    /**
     * Collated consumers usage.
     * @param config The id of the grid.
     * @param consumerUsageById The unread output from the consumers.
     * @param gridState The current state of the grid.
     * @returns If the state has been updated and any payment requests to send.
     */
    public async consumers(
        config: IGridConfiguration,
        consumerUsageById: { [id: string]: IConsumerUsageEntry[] },
        gridState: IGridManagerState<IBasicGridStrategyState>):
        Promise<{
            /**
             * Has the state been updated.
             */
            updatedState: boolean;

            /**
             * Commands to send for each consumer.
             */
            paymentRequests: { [id: string]: IConsumerPaymentRequestCommand };
        }> {

        let updatedState = false;
        const paymentRequests = {};

        // Consume any new usage data and store it in the totals
        for (const consumerId in consumerUsageById) {
            if (!gridState.strategyState.consumerTotals[consumerId]) {
                gridState.strategyState.consumerTotals[consumerId] = {
                    usage: 0,
                    requestedUsage: 0,
                    outstanding: 0,
                    paid: 0
                };
            }

            updatedState = true;
            const newUsage = consumerUsageById[consumerId].reduce((a, b) => a + b.usage, 0);

            const paymentRequest = this.updateConsumerUsage(
                config.id,
                gridState.strategyState.consumerTotals[consumerId],
                newUsage);

            if (paymentRequest) {
                paymentRequests[consumerId] = paymentRequest;
                gridState.strategyState.consumerTotals[consumerId].outstanding += paymentRequest.owed;
                gridState.strategyState.runningCostsTotal += paymentRequest.owed / 5;

                this._loggingService.log("basic-grid", `Request payment ${paymentRequest.owed} from ${consumerId}`);
            }

            consumerUsageById[consumerId] = [];
        }

        return {
            updatedState,
            paymentRequests
        };
    }

    /**
     * Collated producer output.
     * @param config The config of the grid.
     * @param producerUsageById The unread output from the producers.
     * @param gridState The current state of the grid.
     * @returns If the state was updated.
     */
    public async producers(
        config: IGridConfiguration,
        producerUsageById: { [id: string]: IProducerOutputEntry[] },
        gridState: IGridManagerState<IBasicGridStrategyState>): Promise<{
            /**
             * Has the state been updated.
             */
            updatedState: boolean;
        }> {

        let updatedState = false;

        if (Object.keys(producerUsageById).length > 0) {

            // Update the producers output based on any commands
            for (const producerId in producerUsageById) {
                if (!gridState.strategyState.producerTotals[producerId]) {
                    gridState.strategyState.producerTotals[producerId] = {
                        output: 0,
                        owed: 0,
                        received: 0,
                        percentage: 0
                    };
                }

                updatedState = true;
                gridState.strategyState.producerTotals[producerId].output +=
                    producerUsageById[producerId].reduce((a, b) => a + b.output, 0);

                // Just remove the usage data, in a real system we might want to archive this
                producerUsageById[producerId] = [];
            }

            // Now go through all the producers and calculate their percentage contribution to the
            // total grid output, we will then later use that to decide how much of the consumer payments
            // they will receive
            let totalOutput = 0;
            for (const producerId in gridState.strategyState.producerTotals) {
                totalOutput += gridState.strategyState.producerTotals[producerId].output;
            }
            for (const producerId in gridState.strategyState.producerTotals) {
                gridState.strategyState.producerTotals[producerId].percentage =
                    gridState.strategyState.producerTotals[producerId].output / totalOutput;
            }
        }

        return {
            updatedState
        };
    }

    /**
     * Collated payments.
     * @param config The config of the grid.
     * @param gridState The current state of the grid.
     * @returns If the state was updated.
     */
    public async payments(
        config: IGridConfiguration,
        gridState: IGridManagerState<IBasicGridStrategyState>):
        Promise<{
            /**
             * Has the state been updated.
             */
            updatedState: boolean;
        }> {
        let updatedState = false;

        const now = Date.now();

        if (now - gridState.strategyState.lastTransferCheck > 10000) {
            // Get all the payment since the last epochs
            let incomingEpoch = gridState.strategyState.lastIncomingTransfer ?
                gridState.strategyState.lastIncomingTransfer.created : 0;
            const outgoingEpoch = gridState.strategyState.lastOutgoingTransfer ?
                gridState.strategyState.lastOutgoingTransfer.created : 0;

            const wallet = await this._walletService.getWallet(
                config.id,
                incomingEpoch,
                outgoingEpoch
            );

            if (wallet) {
                if (wallet.incomingTransfers && wallet.incomingTransfers.length > 0) {
                    this._loggingService.log(
                        "basic-grid",
                        `Incoming transfers after ${incomingEpoch}`,
                        wallet.incomingTransfers
                    );

                    let totalIncoming = 0;
                    for (let i = 0; i < wallet.incomingTransfers.length; i++) {
                        const consumerId = wallet.incomingTransfers[i].reference;
                        if (gridState.strategyState.consumerTotals[consumerId]) {
                            gridState.strategyState.consumerTotals[consumerId].outstanding -=
                                wallet.incomingTransfers[i].value;
                            gridState.strategyState.consumerTotals[consumerId].paid +=
                                wallet.incomingTransfers[i].value;

                            totalIncoming += wallet.incomingTransfers[i].value;

                            if (wallet.incomingTransfers[i].created > incomingEpoch) {
                                incomingEpoch = wallet.incomingTransfers[i].created;
                                gridState.strategyState.lastIncomingTransfer = wallet.incomingTransfers[i];
                            }
                        }
                    }
                    // We are taking 1i out of every 5i as running costs
                    const runningCostsUsed = totalIncoming / 5;
                    gridState.strategyState.runningCostsReceived += runningCostsUsed;
                    // Add remainder to the total for distribution to producers
                    gridState.strategyState.distributionAvailable += totalIncoming - runningCostsUsed;
                }

                if (wallet.outgoingTransfers && wallet.outgoingTransfers.length > 0) {
                    this._loggingService.log(
                        "basic-grid",
                        `Outgoing transfers after ${outgoingEpoch}`,
                        wallet.outgoingTransfers
                    );

                    for (let i = 0; i < wallet.outgoingTransfers.length; i++) {
                        const producerId = wallet.outgoingTransfers[i].reference;
                        if (gridState.strategyState.producerTotals[producerId]) {
                            gridState.strategyState.producerTotals[producerId].owed -=
                                wallet.outgoingTransfers[i].value;
                            gridState.strategyState.producerTotals[producerId].received +=
                                wallet.outgoingTransfers[i].value;

                            if (wallet.outgoingTransfers[i].created > outgoingEpoch) {
                                incomingEpoch = wallet.outgoingTransfers[i].created;
                                gridState.strategyState.lastOutgoingTransfer = wallet.outgoingTransfers[i];
                            }
                        }
                    }
                }
            }

            await this.payProducers(config.id, gridState);

            updatedState = true;
            gridState.strategyState.lastTransferCheck = now;
        }

        return {
            updatedState
        };

    }

    /**
     * Pay the producers using their percentage contribution
     * @param gridId The id of the grid.
     * @param gridState The current state of the grid.
     */
    private async payProducers(
        gridId: string,
        gridState: IGridManagerState<IBasicGridStrategyState>): Promise<void> {
        // Pay out to producers on 40i boundaries
        const dist = Math.floor(gridState.strategyState.distributionAvailable / 40) * 40;
        if (dist > 0) {
            let totalDistUsed = 0;

            for (const producerId in gridState.strategyState.producerTotals) {
                // Now based on each producers contribution to the grid give them some money
                const payableBalance = Math.floor(dist * gridState.strategyState.producerTotals[producerId].percentage);

                totalDistUsed += payableBalance;

                gridState.strategyState.producerTotals[producerId].owed += payableBalance;

                await this._walletService.transfer(
                    gridId,
                    producerId,
                    payableBalance);

                this._loggingService.log("basic-grid", "wallet", {
                    to: producerId,
                    amount: payableBalance
                });
            }

            gridState.strategyState.distributionAvailable -= totalDistUsed;
        }
    }

    /**
     * Update the usage for the consumer.
     * @param gridId The id of the grid.
     * @param consumerTotals The total for the consumer.
     * @param newUsage Additional usage for the consumer.
     * @returns A new payment request command or nothing.
     */
    private updateConsumerUsage(
        gridId: string,
        consumerTotals: IBasicGridStrategyConsumerTotals,
        newUsage: number): IConsumerPaymentRequestCommand | undefined {
        consumerTotals.usage += newUsage;

        // Add new request for every whole kWh the consumer uses
        const unrequestedUsage = Math.floor(consumerTotals.usage - consumerTotals.requestedUsage);
        if (unrequestedUsage > 0) {
            consumerTotals.requestedUsage += unrequestedUsage;

            // For this example the producers are charging 4i for every kWh
            // As a grid we then add an additional 1i for our running costs
            // The producers can request a specific price but we don't have to use it
            // Also the payment id could be an actual IOTA address, but in our demo
            // we are using it as a reference we use in the global demo wallet
            return {
                command: "payment-request",
                owed: unrequestedUsage * 5,
                usage: unrequestedUsage,
                paymentIdOrAddress: gridId
            };
        }

        return undefined;
    }
}
