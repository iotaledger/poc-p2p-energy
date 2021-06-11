import { IWalletTransfer } from "../api/wallet/IWalletTransfer";
import { IBasicGridStrategyConsumerTotals } from "./IBasicGridStrategyConsumerTotals";
/**
 * Definition of grid stratey state.
 */
export interface IBasicGridStrategyState {
    /**
     * The seed used to generate payment addressses.
     */
    paymentSeed?: string;

    /**
     * Running costs total.
     */
    runningCostsTotal?: number;

    /**
     * Running costs received.
     */
    runningCostsReceived?: number;

    /**
     * The total costs distribution available.
     */
    distributionAvailable?: number;

    /**
     * Producer totals.
     */
    producerTotals: {
        [id: string]: {
            /**
             * Total output for the producer.
             */
            output: number;

            /**
             * Total received by the producer.
             */
            received: number;

            /**
             * Total owed to the producer.
             */
            owed: number;

            /**
             * Global percentage.
             */
            percentage: number;
        }
    };

    /**
     * Consumer totals.
     */
    consumerTotals: { [id: string]: IBasicGridStrategyConsumerTotals };

    /**
     * Last time we checked for transfers.
     */
    lastTransferCheck: number;

    /**
     * The time of the last incoming transfer.
     */
    lastIncomingTransfer?: IWalletTransfer;

    /**
     * The time of the last outgoing transfer.
     */
    lastOutgoingTransfer?: IWalletTransfer;
}
