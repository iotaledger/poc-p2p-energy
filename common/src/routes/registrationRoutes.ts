import { ServiceFactory } from "../factories/serviceFactory";
import { IResponse } from "../models/api/IResponse";
import { IRegistrationDeleteRequest } from "../models/api/registration/IRegistrationDeleteRequest";
import { IRegistrationSetRequest } from "../models/api/registration/IRegistrationSetRequest";
import { IRegistrationSetResponse } from "../models/api/registration/IRegistrationSetResponse";
import { ILoggingService } from "../models/services/ILoggingService";
import { IRegistrationManagementService } from "../models/services/IRegistrationManagementService";
import { IStorageService } from "../models/services/IStorageService";
import { IRegistration } from "../models/services/registration/IRegistration";
import { ValidationHelper } from "../utils/validationHelper";

/**
 * Registration post command.
 * @param config The service configuration.
 * @param request The request for the route.
 * @returns The route response.
 */
export async function registrationSet(config: any, request: IRegistrationSetRequest):
    Promise<IRegistrationSetResponse> {
    const loggingService = ServiceFactory.get<ILoggingService>("logging");

    ValidationHelper.string(request.registrationId, "registrationId", 8);
    if (request.itemName) {
        ValidationHelper.string(request.itemName, "itemName");
    }
    if (request.itemType) {
        ValidationHelper.string(request.itemType, "itemType");
    }
    if (request.root) {
        ValidationHelper.trytes(request.root, 81, "root");
    }
    if (request.sideKey) {
        ValidationHelper.trytes(request.sideKey, 81, "sideKey");
    }

    const registrationManagementService = ServiceFactory.get<IRegistrationManagementService>("registration-management");

    const registration: IRegistration = {
        id: request.registrationId,
        created: Date.now(),
        itemName: request.itemName,
        itemType: request.itemType
    };

    loggingService.log("registration", "Set", registration);

    await registrationManagementService.addRegistration(registration, request.root, request.sideKey);

    return {
        success: true,
        message: "OK",
        sideKey: registration.returnMamChannel && registration.returnMamChannel.sideKey,
        root: registration.returnMamChannel && registration.returnMamChannel.initialRoot
    };
}

/**
 * Registration delete command.
 * @param config The service configuration.
 * @param request The request for the route.
 * @returns The route response.
 */
export async function registrationDelete(config: any, request: IRegistrationDeleteRequest): Promise<IResponse> {
    const loggingService = ServiceFactory.get<ILoggingService>("logging");

    ValidationHelper.string(request.registrationId, "registrationId", 8);
    ValidationHelper.trytes(request.sideKey, 81, "sideKey");

    loggingService.log("registration", "Delete", request.registrationId);
    const registrationManagementService = ServiceFactory.get<IRegistrationManagementService>("registration-management");

    await registrationManagementService.removeRegistration(request.registrationId, request.sideKey);

    const storageService = ServiceFactory.get<IStorageService<string>>("storage");
    await storageService.remove(`${request.registrationId}/`);

    return {
        success: true,
        message: "OK"
    };
}
