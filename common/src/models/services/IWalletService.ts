import { IWallet } from "../api/wallet/IWallet";

/**
 * A service to handle payments between entities.
 */
export interface IWalletService {
    /**
     * Get the wallet details.
     * @param id The id of the wallet.
     * @param incomingEpoch Only return incoming transfers after the epoch.
     * @param outgoingEpoch Only return outgoing transfers after the epoch.
     * @returns The wallet.
     */
    getWallet(
        id: string,
        incomingEpoch?: number,
        outgoingEpoch?: number): Promise<IWallet>;

    /**
     * Make a payment from a wallet.
     * @param id The wallet id the payment is from.
     * @param toIdOrAddress The wallet id the payment is to or an address.
     * @param amount The amount of the payment.
     */
    transfer(
        id: string,
        toIdOrAddress: string,
        amount: number): Promise<void>;
}
