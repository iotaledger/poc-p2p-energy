import axios from "axios";
import { IResponse } from "../../models/api/IResponse";
import { IRegistrationDeleteRequest } from "../../models/api/registration/IRegistrationDeleteRequest";
import { IRegistrationSetRequest } from "../../models/api/registration/IRegistrationSetRequest";
import { IRegistrationSetResponse } from "../../models/api/registration/IRegistrationSetResponse";
import { ApiHelper } from "../../utils/apiHelper";

/**
 * Class to handle registration api communications.
 */
export class RegistrationApiClient {
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
     * Register with the api.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async registrationSet(request: IRegistrationSetRequest): Promise<IRegistrationSetResponse> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: IRegistrationSetResponse;

        try {
            const axiosResponse = await ax.put<IRegistrationSetResponse>(
                `registration/${request.registrationId}`,
                ApiHelper.removeKeys(request, ["registrationId"])
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
     * Unregister from the api.
     * @param request The request to send.
     * @returns The response from the request.
     */
    public async registrationDelete(request: IRegistrationDeleteRequest): Promise<IResponse> {
        const ax = axios.create({ baseURL: this._endpoint });
        let response: IResponse;

        try {
            const axiosResponse = await ax.delete<IResponse>(
                `registration/${request.registrationId}/${request.sideKey}`
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
