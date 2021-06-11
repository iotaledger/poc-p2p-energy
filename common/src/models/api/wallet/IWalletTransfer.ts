export interface IWalletTransfer {
    /**
     * The value of the transfer.
     */
    value: number;
    /**
     * The bundle hash of the transfer.
     */
    bundle: string;
    /**
     * The reference of the payment.
     */
    reference: string;
    /**
     * The timestamp of when it was created.
     */
    created: number;
}
