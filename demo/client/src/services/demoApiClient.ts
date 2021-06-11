import axios from "axios";
import { IResponse } from "p2p-energy-common/dist/models/api/IResponse";
import { IWalletGetRequest } from "p2p-energy-common/dist/models/api/wallet/IWalletGetRequest";
import { IWalletGetResponse } from "p2p-energy-common/dist/models/api/wallet/IWalletGetResponse";
import { ApiHelper } from "p2p-energy-common/dist/utils/apiHelper";
import { IGridDeleteRequest } from "../models/api/IGridDeleteRequest";
import { IGridGetRequest } from "../models/api/IGridGetRequest";
import { IGridGetResponse } from "../models/api/IGridGetResponse";
import { IGridPasswordPutRequest } from "../models/api/IGridPasswordPutRequest";
import { IGridPostRequest } from "../models/api/IGridPostRequest";
import { IGridPutRequest } from "../models/api/IGridPutRequest";
import { IGridPutResponse } from "../models/api/IGridPutResponse";

/**
 * Class to handle api communications.
 */
export class DemoApiClient {
    /**
     * The endpoint for performing communications.
     */
    private readonly _endpoint: string;

    /**
     * Create a new instance of ApiClient.
     * @param endpoint The endpoint for the api.
     */
    constructor(endpoint: string) {
        this._endpoint = endpoint;
    }

    /**
     * Get grid data from the api.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async gridGet(request: IGridGetRequest): Promise<IGridGetResponse> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: IGridGetResponse;

        try {
            const axiosResponse = await ax.get<IGridGetResponse>(ApiHelper.joinParams(`grid`, [request.name]));

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
     * Create a new grid.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async gridCreate(request: IGridPostRequest): Promise<IResponse> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: IResponse;

        try {
            const axiosResponse = await ax.post<IResponse>(`grid`, request);

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
     * Update a grid with the api.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async gridUpdate(request: IGridPutRequest): Promise<IGridPutResponse> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: IGridPutResponse;

        try {
            const axiosResponse = await ax.put<IGridPutResponse>(
                ApiHelper.joinParams(`grid`, [request.name]),
                ApiHelper.removeKeys(request, ["name"]));

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
     * Delete a grid with the api.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async gridDelete(request: IGridDeleteRequest): Promise<IResponse> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: IGridPutResponse;

        try {
            const axiosResponse = await ax.delete<IResponse>(
                ApiHelper.joinParams(`grid`, [request.name]),
                ApiHelper.removeKeys(request, ["name"]));

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
     * Check a grids password.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async gridPasswordCheck(request: IGridPasswordPutRequest): Promise<IResponse> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: IResponse;

        try {
            const axiosResponse = await ax.put<IResponse>(
                ApiHelper.joinParams(`grid/password`, [request.name]),
                ApiHelper.removeKeys(request, ["name"]));

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
     * Get the wallet info.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async walletGet(request: IWalletGetRequest): Promise<IWalletGetResponse> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: IWalletGetResponse;

        try {
            const axiosResponse = await ax.get<IWalletGetResponse>(ApiHelper.joinParams(`wallet`, [request.id]));

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
