export interface IWalletGetRequest {
    /**
     * The id of the wallet.
     */
    id: string;

    /**
     * Only return incoming transfers after the epoch.
     */
    incomingEpoch?: number;

    /**
     * Only return outgoing transfers after the epoch.
     */
    outgoingEpoch?: number;
}
