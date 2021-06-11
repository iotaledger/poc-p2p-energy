import { ServiceFactory } from "../factories/serviceFactory";
import { IProducerConfiguration } from "../models/config/producer/IProducerConfiguration";
import { ISourceStoreOutput } from "../models/db/producer/ISourceStoreOutput";
import { IProducerOutputCommand } from "../models/mam/IProducerOutputCommand";
import { ILoggingService } from "../models/services/ILoggingService";
import { IWalletService } from "../models/services/IWalletService";
import { IProducerManagerState } from "../models/state/IProducerManagerState";
import { IBasicProducerStrategyState } from "../models/strategies/IBasicProducerStrategyState";
import { IProducerStrategy } from "../models/strategies/IProducerStrategy";

/**
 * Basic implementation of a producer strategy.
 */
export class BasicProducerStrategy implements IProducerStrategy<IBasicProducerStrategyState> {
    /**
     * The base for timing.
     */
    private static readonly TIME_INTERVAL: number = 30000;

    /**
     * How long do we consider a time before item was idle.
     */
    private static readonly TIME_IDLE: number = 5 * 30000;

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
     * @returns The producer state.
     */
    public async initState(): Promise<IBasicProducerStrategyState> {
        return {
            lastOutputTime: Date.now(),
            outputTotal: 0,
            receivedBalance: 0,
            lastTransferCheck: 0
        };
    }

    /**
     * Collated sources output.
     * @param config The id of the producer.
     * @param sourceOutputById The unread output from the sources.
     * @param producerState The current state of the producer.
     * @returns The list of commands for the producer to output.
     */
    public async sources(
        config: IProducerConfiguration,
        sourceOutputById: { [id: string]: ISourceStoreOutput[] },
        producerState: IProducerManagerState<IBasicProducerStrategyState>):
        Promise<{
            /**
             * Has the state been updated.
             */
            updatedState: boolean;
            /**
             * New commands to output.
             */
            commands: IProducerOutputCommand[];
        }> {
        // For this basic strategy we just add the output of the sources together irrespective
        // of the time of day, for a more complicated strategy you could charge more during different
        // time of the day or based on demand etc
        // You would probably also collate the source data based on its time slices as well
        // Source outputs are discarded after being passed to this method, but you could archive
        // them if you want to
        const commands: IProducerOutputCommand[] = [];
        let updatedState = false;

        const now = Date.now();
        if ((now - producerState.strategyState.lastOutputTime) > BasicProducerStrategy.TIME_IDLE) {
            // Looks like the producer has not been running for some time
            // so reset the timer
            updatedState = true;
            producerState.strategyState.lastOutputTime = now;
        } else {
            while ((Date.now() - producerState.strategyState.lastOutputTime) > BasicProducerStrategy.TIME_INTERVAL) {
                // Find any source data that uses the same time block
                const endTime = producerState.strategyState.lastOutputTime + BasicProducerStrategy.TIME_INTERVAL;

                let endTimeIndex = Math.floor(
                    producerState.strategyState.lastOutputTime / BasicProducerStrategy.TIME_INTERVAL);

                // Delay the lookup by 30s (or 3 indexes ago) to allow the source data to propogate
                endTimeIndex -= 3;

                let producerTotal = 0;
                for (const sourceId in sourceOutputById) {
                    const entryIdx = sourceOutputById[sourceId]
                        .findIndex(u => Math.floor(u.endTime / BasicProducerStrategy.TIME_INTERVAL) === endTimeIndex);
                    if (entryIdx >= 0) {
                        producerTotal += sourceOutputById[sourceId][entryIdx].output;
                        sourceOutputById[sourceId].splice(entryIdx, 1);
                    }
                }

                commands.push({
                    command: "output",
                    startTime: producerState.strategyState.lastOutputTime + 1,
                    endTime: endTime,
                    output: producerTotal,
                    // Calculate a cost for the producer output slice
                    // You could base this on your own costs, time of day, value etc
                    // This is a preferred cost and its up to the grid strategy to decide
                    // to use it or ignore it
                    // For this demonstration we fix it at 4i for 1kWh
                    price: producerTotal * 4,
                    // For this demo we are using the producer id as the payment id
                    // as all payments are handled by the central wallet which can
                    // perform transfers using the ids, this could equally
                    // be populated as an IOTA address
                    paymentIdOrAddress: config.id
                });

                producerState.strategyState.outputTotal += producerTotal;

                producerState.strategyState.lastOutputTime = endTime;
                updatedState = true;
            }
        }

        return {
            updatedState,
            commands
        };
    }

    /**
     * Collated payments.
     * @param config The config of the producer.
     * @param producerState The current state of the producer.
     * @returns If the state was updated.
     */
    public async payments(
        config: IProducerConfiguration,
        producerState: IProducerManagerState<IBasicProducerStrategyState>):
        Promise<{
            /**
             * Has the state been updated.
             */
            updatedState: boolean;
        }> {
        let updatedState = false;

        const now = Date.now();

        if (now - producerState.strategyState.lastTransferCheck > 10000) {
            let incomingEpoch = producerState.strategyState.lastIncomingTransfer ?
                producerState.strategyState.lastIncomingTransfer.created : 0;

            const wallet = await this._walletService.getWallet(
                config.id,
                incomingEpoch,
                undefined
            );

            if (wallet) {
                if (wallet.incomingTransfers && wallet.incomingTransfers.length > 0) {
                    this._loggingService.log(
                        "basic-producer",
                        `Incoming transfers after ${incomingEpoch}`,
                        wallet.incomingTransfers
                    );

                    for (let i = 0; i < wallet.incomingTransfers.length; i++) {
                        producerState.strategyState.receivedBalance += wallet.incomingTransfers[i].value;

                        if (wallet.incomingTransfers[i].created > incomingEpoch) {
                            incomingEpoch = wallet.incomingTransfers[i].created;
                            producerState.strategyState.lastIncomingTransfer = wallet.incomingTransfers[i];
                        }
                    }
                }
            }

            updatedState = true;
            producerState.strategyState.lastTransferCheck = now;

        }

        return {
            updatedState
        };
    }
}
