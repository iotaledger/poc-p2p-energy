import crypto from "crypto";
import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import { IResponse } from "p2p-energy-common/dist/models/api/IResponse";
import { IStorageService } from "p2p-energy-common/dist/models/services/IStorageService";
import { ValidationHelper } from "p2p-energy-common/dist/utils/validationHelper";
import { IGrid } from "../../models/api/IGrid";
import { IGridPasswordPutRequest } from "../../models/api/IGridPasswordPutRequest";
import { IDemoApiConfiguration } from "../../models/IDemoApiConfiguration";

/**
 * Check a grid password.
 * @param config The service configuration.
 * @param request The request for the route.
 * @returns The route response.
 */
export async function gridPasswordPut(
    config: IDemoApiConfiguration,
    request: IGridPasswordPutRequest):
    Promise<IResponse> {

    ValidationHelper.string(request.name, "name", 5);
    ValidationHelper.string(request.password, "password");

    const storageService = ServiceFactory.get<IStorageService<IGrid>>("storage");

    const grid = await storageService.get(request.name);
    if (!grid) {
        throw new Error(`The grid '${request.name}' does not exist.`);
    }

    if (grid.password) {
        const suppliedPassword = request.password.startsWith("base64:") ? request.password.substr(7) :
            crypto.createHash("sha256").update(request.password).digest("base64");

        if (suppliedPassword !== grid.password) {
            throw new Error("The password does not match the one for the grid.");
        }
    }

    return {
        success: true,
        message: "OK"
    };
}
