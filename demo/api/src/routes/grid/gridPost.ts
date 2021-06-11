import crypto from "crypto";
import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import { IResponse } from "p2p-energy-common/dist/models/api/IResponse";
import { IStorageService } from "p2p-energy-common/dist/models/services/IStorageService";
import { ValidationHelper } from "p2p-energy-common/dist/utils/validationHelper";
import { IGrid } from "../../models/api/IGrid";
import { IGridPostRequest } from "../../models/api/IGridPostRequest";
import { IDemoApiConfiguration } from "../../models/IDemoApiConfiguration";

/**
 * Create a new grid.
 * @param config The service configuration.
 * @param request The request for the route.
 * @returns The route response.
 */
export async function gridPost(
    config: IDemoApiConfiguration,
    request: IGridPostRequest):
    Promise<IResponse> {

    ValidationHelper.object(request.grid, "grid");
    ValidationHelper.string(request.grid.name, "name", 5);

    const storageService = ServiceFactory.get<IStorageService<IGrid>>("storage");

    const grid = await storageService.get(request.grid.name);

    if (grid) {
        throw new Error(
            `The grid '${request.grid.name}' already exists.
Please choose a different name or load it instead.`
        );
    }

    if (request.grid.password) {
        request.grid.password = crypto.createHash("sha256").update(request.grid.password).digest("base64");
    }

    await storageService.set(request.grid.name, request.grid);

    return {
        success: true,
        message: "OK"
    };
}
