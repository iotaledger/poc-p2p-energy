import { ServiceFactory } from "p2p-energy-common/dist/factories/serviceFactory";
import { IStorageService } from "p2p-energy-common/dist/models/services/IStorageService";
import { ValidationHelper } from "p2p-energy-common/dist/utils/validationHelper";
import { IGrid } from "../../models/api/IGrid";
import { IGridGetRequest } from "../../models/api/IGridGetRequest";
import { IGridGetResponse } from "../../models/api/IGridGetResponse";
import { IDemoApiConfiguration } from "../../models/IDemoApiConfiguration";

/**
 * Get the data for the grid.
 * @param config The service configuration.
 * @param request The request for the route.
 * @returns The route response.
 */
export async function gridGet(
    config: IDemoApiConfiguration,
    request: IGridGetRequest):
    Promise<IGridGetResponse> {

    ValidationHelper.string(request.name, "name", 5);

    const storageService = ServiceFactory.get<IStorageService<IGrid>>("storage");

    const grid = await storageService.get(request.name);

    if (!grid) {
        throw new Error(`The grid '${request.name}' does not exist.`);
    }

    if (grid.password) {
        grid.password = `base64:${grid.password}`;
    }

    return {
        success: true,
        message: "OK",
        grid
    };
}
