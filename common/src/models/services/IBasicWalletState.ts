/**
 * State for a basic wallet.
 */
export interface IBasicWalletState {
    /**
     * The current balance.
     */
    balance: number;

    /**
     * The current start index.
     */
    startIndex: number;

    /**
     * The current end index.
     */
    lastIndex: number;

    /**
     * The current receive address.
     */
    receiveAddress: string;
}
