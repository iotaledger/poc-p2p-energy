import { IRegistrationService } from "../../models/services/IRegistrationService";
import { RegistrationApiClient } from "../api/registrationApiClient";

/**
 * Service to handle the storage using the storage api.
 */
export class ApiRegistrationService implements IRegistrationService {
    /**
     * The storage api endpoint.
     */
    private readonly _apiEndpoint: string;

    /**
     * Create a new instance of ApiRegistrationService
     * @param apiEndpoint The api configuration.
     */
    constructor(apiEndpoint: string) {
        this._apiEndpoint = apiEndpoint;
    }

    /**
     * Create a new registration.
     * @param registrationId The registration id of the item.
     * @param itemName Name of the item.
     * @param itemType The type of the item.
     * @param root The initial root for the mam channel.
     * @param sideKey The private key for the mam channel.
     * @returns The response from the request.
     */
    public async register(
        registrationId: string,
        itemName?: string,
        itemType?: string,
        root?: string,
        sideKey?: string):
        Promise<{
            /**
             * The root used for the channel from the registration.
             */
            root?: string;
            /**
             * The private key used for decoding the channel.
             */
            sideKey?: string;
        }> {
        const registrationApiClient = new RegistrationApiClient(this._apiEndpoint);

        return registrationApiClient.registrationSet({ registrationId, itemName, itemType, root, sideKey });
    }

    /**
     * Remove a registration.
     * @param registrationId The registration id of the item.
     * @param sideKey The client mam channel side key used for remove validation.
     */
    public async unregister(registrationId: string, sideKey: string): Promise<void> {
        const registrationApiClient = new RegistrationApiClient(this._apiEndpoint);

        await registrationApiClient.registrationDelete({ registrationId, sideKey });
    }
}
