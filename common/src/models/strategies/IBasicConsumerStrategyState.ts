import { IWalletTransfer } from "../../models/api/wallet/IWalletTransfer";
/**
 * Definition of consumer stratey state.
 */
export interface IBasicConsumerStrategyState {
    /**
     * The last usage time slot.
     */
    lastUsageTime?: number;

    /**
     * Total usage.
     */
    usageTotal?: number;

    /**
     * Paid balance.
     */
    paidBalance?: number;

    /**
     * Outstanding balance.
     */
    outstandingBalance?: number;

    /**
     * The number of payments sent.
     */
    paymentsSent?: number;

    /**
     * The number of payments confirmed.
     */
    paymentsConfirmed?: number;

    /**
     * Last transfer from the consumer wallet.
     */
    lastOutgoingTransfer?: IWalletTransfer;
}
