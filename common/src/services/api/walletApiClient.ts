import axios from "axios";
import { IResponse } from "../../models/api/IResponse";
import { IWalletGetRequest } from "../../models/api/wallet/IWalletGetRequest";
import { IWalletGetResponse } from "../../models/api/wallet/IWalletGetResponse";
import { IWalletTransferRequest } from "../../models/api/wallet/IWalletTransferRequest";
import { ApiHelper } from "../../utils/apiHelper";

/**
 * Class to handle storage api communications.
 */
export class WalletApiClient {
    /**
     * The endpoint for performing communications.
     */
    private readonly _endpoint: string;

    /**
     * Create a new instance of WalletApiClient.
     * @param endpoint The endpoint for the api.
     */
    constructor(endpoint: string) {
        this._endpoint = endpoint;
    }

    /**
     * Get the wallet details.
     * @param request The request to send.
     * @param data The data to store.
     * @returns The response from the request.
     */
    public async getWallet(request: IWalletGetRequest): Promise<IWalletGetResponse> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: IWalletGetResponse;

        try {
            const axiosResponse = await ax.get<IWalletGetResponse>(
                ApiHelper.joinParams(`wallet`, [request.id, request.incomingEpoch, request.outgoingEpoch])
            );

            response = axiosResponse.data;
        } catch (err) {
            response = {
                success: false,
                message: `There was a problem communicating with the API.\n${err}`
            };
        }

        return response;
    }

    /**
     * Make a payment between registrations.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async transfer(request: IWalletTransferRequest): Promise<IResponse> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: IResponse;

        try {
            const axiosResponse = await ax.post<IResponse>(
                ApiHelper.joinParams(`wallet`, [request.id, "transfer"]),
                ApiHelper.removeKeys(request, ["id"])
            );

            response = axiosResponse.data;
        } catch (err) {
            response = {
                success: false,
                message: `There was a problem communicating with the API.\n${err}`
            };
        }

        return response;
    }
}
