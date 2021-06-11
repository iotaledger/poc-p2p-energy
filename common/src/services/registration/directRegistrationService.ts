import { ServiceFactory } from "../../factories/serviceFactory";
import { IRegistrationManagementService } from "../../models/services/IRegistrationManagementService";
import { IRegistrationService } from "../../models/services/IRegistrationService";
import { IRegistration } from "../../models/services/registration/IRegistration";

/**
 * Service to handle the storage directly with management service.
 */
export class DirectRegistrationService implements IRegistrationService {
    /**
     * The registration management service.
     */
    private readonly _registrationManagementService: IRegistrationManagementService;

    /**
     * Create a new instance of DirectRegistrationService
     * @param registrationManagementServiceName The api configuration.
     */
    constructor(registrationManagementServiceName: string) {
        this._registrationManagementService =
            ServiceFactory.get<IRegistrationManagementService>(registrationManagementServiceName);
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

        const registration: IRegistration = {
            id: registrationId,
            created: Date.now(),
            itemName: itemName,
            itemType: itemType
        };

        await this._registrationManagementService.addRegistration(registration, root, sideKey);

        return {
            sideKey: registration.returnMamChannel && registration.returnMamChannel.sideKey,
            root: registration.returnMamChannel && registration.returnMamChannel.initialRoot
        };
    }

    /**
     * Remove a registration.
     * @param registrationId The registration id of the item.
     * @param sideKey The client mam channel side key used for remove validation.
     */
    public async unregister(registrationId: string, sideKey: string): Promise<void> {
        await this._registrationManagementService.removeRegistration(registrationId, sideKey);
    }
}
