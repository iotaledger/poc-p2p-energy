import { IWalletTransfer } from "./IWalletTransfer";

export interface IWallet {
    /**
     * The balance.
     */
    balance?: number;

    /**
     * The most recent outgoing wallet tranfers.
     */
    outgoingTransfers?: IWalletTransfer[];

    /**
     * The most recent incoming wallet tranfers.
     */
    incomingTransfers?: IWalletTransfer[];
}
