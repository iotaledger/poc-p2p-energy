import { IDemoWalletTransfer } from "./IDemoWalletTransfer";

export interface IDemoWallet {
    /**
     * The id of the wallet.
     */
    id: string;

    /**
     * The balance of the wallet.
     */
    balance: number;

    /**
     * The bundle hash of the last outgoing transfer.
     */
    outgoingTransfers?: IDemoWalletTransfer[];

    /**
     * The bundle hash of the last incoming transfer.
     */
    incomingTransfers?: IDemoWalletTransfer[];
}
