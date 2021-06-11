import { IWalletTransfer } from "../api/wallet/IWalletTransfer";

/**
 * Definition of producer strategy state.
 */
export interface IBasicProducerStrategyState {
    /**
     * The time of the last output command.
     */
    lastOutputTime?: number;

    /**
     * Total output.
     */
    outputTotal?: number;

    /**
     * Received balance.
     */
    receivedBalance?: number;

    /**
     * Last time we checked for transfers.
     */
    lastTransferCheck: number;

    /**
     * Transfers to the producer.
     */
    lastIncomingTransfer?: IWalletTransfer;
}
