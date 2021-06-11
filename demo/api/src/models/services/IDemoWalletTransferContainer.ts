import { IDemoWalletTransfer } from "./IDemoWalletTransfer";

export interface IDemoWalletTransferContainer {
    /**
     * The start of the current inputs.
     */
    startIndex: number;

    /**
     * The last used address index.
     */
    lastUsedIndex: number;

    /**
     * The pending transfer.
     */
    pending?: IDemoWalletTransfer;

    /**
     * Queued tranfer.
     */
    queue: IDemoWalletTransfer[];
}
