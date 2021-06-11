import { ServiceFactory } from "../factories/serviceFactory";
import { IResponse } from "../models/api/IResponse";
import { IStorageDeleteRequest } from "../models/api/storage/IStorageDeleteRequest";
import { IStorageGetRequest } from "../models/api/storage/IStorageGetRequest";
import { IStorageGetResponse } from "../models/api/storage/IStorageGetResponse";
import { IStorageListRequest } from "../models/api/storage/IStorageListRequest";
import { IStorageListResponse } from "../models/api/storage/IStorageListResponse";
import { IStorageSetRequest } from "../models/api/storage/IStorageSetRequest";
import { ILoggingService } from "../models/services/ILoggingService";
import { IStorageService } from "../models/services/IStorageService";
import { IRegistration } from "../models/services/registration/IRegistration";
import { PathHelper } from "../utils/pathHelper";
import { ValidationHelper } from "../utils/validationHelper";

/**
 * Storage get command.
 * @param config The service configuration.
 * @param request The request for the route.
 * @returns The route response.
 */
export async function storageGet(config: any, request: IStorageGetRequest): Promise<IStorageGetResponse<any>> {
    const loggingService = ServiceFactory.get<ILoggingService>("logging");

    ValidationHelper.string(request.registrationId, "registrationId", 8);
    ValidationHelper.string(request.context, "context");
    ValidationHelper.string(request.id, "id");

    const registrationStorageService = ServiceFactory.get<IStorageService<IRegistration>>("registration-storage");
    const item = await registrationStorageService.get(request.registrationId);
    if (!item) {
        throw new Error(`Registration '${request.registrationId}' does not exist.`);
    }

    const storageService = ServiceFactory.get<IStorageService<any>>("storage");

    const path = PathHelper.join(request.registrationId, request.context, request.id);

    const data = await storageService.get(path);
    loggingService.log("storage", "Get", path, data);

    return {
        success: true,
        message: "OK",
        item: data
    };
}

/**
 * Storage set command.
 * @param config The service configuration.
 * @param request The request for the route.
 * @param body The body of the object to store.
 * @returns The route response.
 */
export async function storageSet(config: any, request: IStorageSetRequest, body: any): Promise<IResponse> {
    const loggingService = ServiceFactory.get<ILoggingService>("logging");

    ValidationHelper.string(request.registrationId, "registrationId", 8);
    ValidationHelper.string(request.context, "context");
    ValidationHelper.string(request.id, "id");

    const registrationStorageService = ServiceFactory.get<IStorageService<IRegistration>>("registration-storage");
    const item = await registrationStorageService.get(request.registrationId);
    if (!item) {
        throw new Error(`Registration '${request.registrationId}' does not exist.`);
    }

    const storageService = ServiceFactory.get<IStorageService<any>>("storage");
    const path = PathHelper.join(request.registrationId, request.context, request.id);

    loggingService.log("storage", "Set", path, body);
    await storageService.set(path, body);

    return {
        success: true,
        message: "OK"
    };
}

/**
 * Storage delete command.
 * @param config The service configuration.
 * @param request The request for the route.
 * @returns The route response.
 */
export async function storageDelete(config: any, request: IStorageDeleteRequest): Promise<IResponse> {
    const loggingService = ServiceFactory.get<ILoggingService>("logging");

    ValidationHelper.string(request.registrationId, "registrationId", 8);
    if (request.context) {
        ValidationHelper.string(request.context, "context");
    }
    if (request.id) {
        ValidationHelper.string(request.id, "id");
    }

    const registrationStorageService = ServiceFactory.get<IStorageService<IRegistration>>("registration-storage");
    const item = await registrationStorageService.get(request.registrationId);
    if (!item) {
        throw new Error(`Registration '${request.registrationId}' does not exist.`);
    }

    const storageService = ServiceFactory.get<IStorageService<any>>("storage");
    const path = PathHelper.join(request.registrationId, request.context, request.id);

    loggingService.log("storage", "Delete", path);
    await storageService.remove(path);

    return {
        success: true,
        message: "OK"
    };
}

/**
 * Storage list command.
 * @param config The service configuration.
 * @param request The request for the route.
 * @returns The route response.
 */
export async function storageList(config: any, request: IStorageListRequest): Promise<IStorageListResponse<any>> {
    const loggingService = ServiceFactory.get<ILoggingService>("logging");

    ValidationHelper.string(request.registrationId, "registrationId", 8);
    ValidationHelper.string(request.context, "context");

    const registrationStorageService = ServiceFactory.get<IStorageService<IRegistration>>("registration-storage");
    const item = await registrationStorageService.get(request.registrationId);
    if (!item) {
        throw new Error(`Registration '${request.registrationId}' does not exist.`);
    }

    const storageService = ServiceFactory.get<IStorageService<string>>("storage");

    const path = PathHelper.join(request.registrationId, request.context);
    const itemsAndIds = await storageService.page(path, request.page, request.pageSize);
    loggingService.log("storage", "List", path, itemsAndIds);

    return {
        success: true,
        message: "OK",
        ids: itemsAndIds.ids,
        items: itemsAndIds.items,
        totalItems: itemsAndIds.totalItems,
        totalPages: itemsAndIds.totalPages,
        pageSize: itemsAndIds.pageSize
    };
}
