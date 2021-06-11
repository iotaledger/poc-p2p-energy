import { IWalletTransfer } from "p2p-energy-common/dist/models/api/wallet/IWalletTransfer";

export interface GridLiveOverviewState {
    /**
     * Running costs total.
     */
    runningCostsTotal: string;

    /**
     * Running costs received.
     */
    runningCostsReceived: string;

    /**
     * The amount available to distrbute to producers.
     */
    distributionAvailable: string;

    /**
     * Producer output.
     */
    producersTotalOutput: string;

    /**
     * Producer received.
     */
    producersTotalReceived: string;

    /**
     * Producer owed.
     */
    producersTotalOwed: string;

    /**
     * Consumer usage.
     */
    consumersTotalUsage: string;

    /**
     * Consumer paid.
     */
    consumersTotalPaid: string;

    /**
     * Consumer owed.
     */
    consumersTotalOutstanding: string;

    /**
     * Last incoming transfer.
     */
    lastIncomingBundle: string;

    /**
     * Last outgoing transfer.
     */
    lastOutgoingBundle: string;
}
