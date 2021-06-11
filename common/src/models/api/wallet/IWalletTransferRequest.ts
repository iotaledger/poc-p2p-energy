export interface IWalletTransferRequest {
    /**
     * The id of the item making the payment.
     */
    id: string;

    /**
     * The id of the item receiving the payment or an address.
     */
    toIdOrAddress: string;

    /**
     * The amount for the payment.
     */
    amount: number;
}
