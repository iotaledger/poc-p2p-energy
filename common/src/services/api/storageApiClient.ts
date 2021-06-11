import axios from "axios";
import { IResponse } from "../../models/api/IResponse";
import { IStorageDeleteRequest } from "../../models/api/storage/IStorageDeleteRequest";
import { IStorageGetRequest } from "../../models/api/storage/IStorageGetRequest";
import { IStorageGetResponse } from "../../models/api/storage/IStorageGetResponse";
import { IStorageListRequest } from "../../models/api/storage/IStorageListRequest";
import { IStorageListResponse } from "../../models/api/storage/IStorageListResponse";
import { IStorageSetRequest } from "../../models/api/storage/IStorageSetRequest";
import { ApiHelper } from "../../utils/apiHelper";

/**
 * Class to handle storage api communications.
 */
export class StorageApiClient {
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
     * Store something with the api.
     * @param request The request to send.
     * @param data The data to store.
     * @returns The response from the request.
     */
    public async storageSet(request: IStorageSetRequest, data: any): Promise<IResponse> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: IResponse;

        try {
            const axiosResponse = await ax.put<IResponse>(
                ApiHelper.joinParams(`storage`, [request.registrationId, request.context, request.id]),
                data
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
     * Get something stored with the api.
     * @param request The request to send.
     * @param data The data to store.
     * @returns The response from the request.
     */
    public async storageGet<T>(request: IStorageGetRequest): Promise<IStorageGetResponse<T>> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: IStorageGetResponse<T>;

        try {
            const axiosResponse = await ax.get<IStorageGetResponse<T>>(
                ApiHelper.joinParams(`storage`, [request.registrationId, request.context, request.id])
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
     * Delete something stored with the api.
     * @param request The request to send.
     * @param data The data to store.
     * @returns The response from the request.
     */
    public async storageDelete(request: IStorageDeleteRequest): Promise<IResponse> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: IResponse;

        try {
            const axiosResponse = await ax.delete<IResponse>(
                ApiHelper.joinParams(`storage`, [request.registrationId, request.context, request.id])
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
     * List items stored with the api.
     * @param request The request to send.
     * @param data The data to store.
     * @returns The response from the request.
     */
    public async storageList<T>(request: IStorageListRequest): Promise<IStorageListResponse<T>> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: IStorageListResponse<T>;

        try {
            const axiosResponse = await ax.get<IStorageListResponse<T>>(
                ApiHelper.joinParams(`storage`, [request.registrationId, request.context]),
                {
                    params: ApiHelper.removeKeys(request, ["registrationId", "context"])
                }
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
