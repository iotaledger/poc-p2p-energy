import crypto from "crypto";
import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import { IStorageService } from "p2p-energy-common/dist/models/services/IStorageService";
import { ValidationHelper } from "p2p-energy-common/dist/utils/validationHelper";
import { IGrid } from "../../models/api/IGrid";
import { IGridPutRequest } from "../../models/api/IGridPutRequest";
import { IGridPutResponse } from "../../models/api/IGridPutResponse";
import { IDemoApiConfiguration } from "../../models/IDemoApiConfiguration";

/**
 * Update a grid.
 * @param config The service configuration.
 * @param request The request for the route.
 * @returns The route response.
 */
export async function gridPut(
    config: IDemoApiConfiguration,
    request: IGridPutRequest):
    Promise<IGridPutResponse> {

    ValidationHelper.string(request.name, "name", 5);
    ValidationHelper.object(request.grid, "grid");
    ValidationHelper.string(request.grid.name, "grid.name", 5);

    const storageService = ServiceFactory.get<IStorageService<IGrid>>("storage");

    const grid = await storageService.get(request.name);
    if (!grid) {
        throw new Error(`The grid '${request.name}' does not exist to update.`);
    }

    if (grid.password) {
        if (!request.password) {
            throw new Error("You must supply a password to update this grid.");
        }
        const suppliedPassword = request.password.startsWith("base64:") ? request.password.substr(7) :
            crypto.createHash("sha256").update(request.password).digest("base64");

        if (suppliedPassword !== grid.password) {
            throw new Error ("The password does not match the one for the grid.");
        }
    }

    if (request.name !== request.grid.name) {
        const newGrid = await storageService.get(request.grid.name);
        if (newGrid) {
            throw new Error(`The grid name '${request.grid.name}' is already in use, please chose another name.`);
        }

        await storageService.remove(request.name);
    }

    if (request.grid.password) {
        if (request.grid.password.startsWith("base64:")) {
            request.grid.password = request.grid.password.substr(7);
        } else {
            request.grid.password = crypto.createHash("sha256").update(request.grid.password).digest("base64");
        }
    }

    await storageService.set(request.grid.name, request.grid);

    return {
        success: true,
        message: "The Grid was successfully updated.",
        password: request.grid.password ? `base64:${request.grid.password}` : undefined
    };
}
