import { IWallet } from "../../models/api/wallet/IWallet";
import { IWalletService } from "../../models/services/IWalletService";
import { WalletApiClient } from "../api/walletApiClient";

/**
 * Service to handle payment using the wallet api.
 */
export class ApiWalletService implements IWalletService {
    /**
     * The storage api endpoint.
     */
    private readonly _apiEndpoint: string;

    /**
     * The unique id for the client sending the requests.
     */
    private readonly _clientId: string;

    /**
     * Create a new instance of ApiPaymentService
     * @param apiEndpoint The api configuration.
     * @param clientId The client id for the wallet.
     */
    constructor(apiEndpoint: string, clientId: string) {
        this._apiEndpoint = apiEndpoint;
        this._clientId = clientId;
    }

    /**
     * Get the wallet details.
     * @param id The wallet id.
     * @param incomingEpoch Only return incoming transfers after the epoch.
     * @param outgoingEpoch Only return outgoing transfers after the epoch.
     * @returns The wallet.
     */
    public async getWallet(id: string, incomingEpoch?: number, outgoingEpoch?: number): Promise<IWallet> {
        const walletApiClient = new WalletApiClient(this._apiEndpoint);
        return walletApiClient.getWallet({
            id: `${this._clientId}${id}`,
            incomingEpoch,
            outgoingEpoch
        }).then(response => {
            if (response.incomingTransfers) {
                for (let i = 0; i < response.incomingTransfers.length; i++) {
                    response.incomingTransfers[i].reference =
                        response.incomingTransfers[i].reference.replace(new RegExp(`^${this._clientId}`), "");
                }
            }

            if (response.outgoingTransfers) {
                for (let i = 0; i < response.outgoingTransfers.length; i++) {
                    response.outgoingTransfers[i].reference =
                        response.outgoingTransfers[i].reference.replace(new RegExp(`^${this._clientId}`), "");
                }
            }

            return response;
        });
    }

    /**
     * Make a payment from a wallet.
     * @param id The wallet id the payment is from.
     * @param toIdOrAddress The wallet id the payment is to.
     * @param amount The amount of the payment.
     * @returns Nothing.
     */
    public async transfer(
        id: string,
        toIdOrAddress: string,
        amount: number): Promise<void> {
        const walletApiClient = new WalletApiClient(this._apiEndpoint);
        return walletApiClient.transfer({
            id: `${this._clientId}${id}`,
            toIdOrAddress: `${this._clientId}${toIdOrAddress}`,
            amount
        })
            .then(response => undefined);
    }
}
