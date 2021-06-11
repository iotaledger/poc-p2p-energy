import { IStorageService } from "../../models/services/IStorageService";
import { StorageApiClient } from "../api/storageApiClient";

/**
 * Service to handle the storage using the storage api.
 */
export class ApiStorageService<T> implements IStorageService<T> {
    /**
     * The storage api endpoint.
     */
    private readonly _apiEndpoint: string;

    /**
     * The registration id.
     */
    private readonly _registrationId: string;

    /**
     * The name of the storage table.
     */
    private readonly _contextName: string;

    /**
     * Create a new instance of ApiStorageService
     * @param apiEndpoint The api configuration.
     * @param registrationId The registration id.
     * @param contextName The name of the context to store with.
     */
    constructor(apiEndpoint: string, registrationId: string, contextName: string) {
        this._apiEndpoint = apiEndpoint;
        this._registrationId = registrationId;
        this._contextName = contextName;
    }

    /**
     * Get the item.
     * @param id The id of the item.
     * @returns The item from the storage service.
     */
    public async get(id: string): Promise<T> {
        const storageApiClient = new StorageApiClient(this._apiEndpoint);

        const response = await storageApiClient.storageGet<T>({
            registrationId: this._registrationId,
            context: this._contextName,
            id
        });

        return response.item;
    }

    /**
     * Store the item.
     * @param id The id of the item to set.
     * @param item The item to set.
     */
    public async set(id: string, item: T): Promise<void> {
        const storageApiClient = new StorageApiClient(this._apiEndpoint);

        await storageApiClient.storageSet(
            {
                registrationId: this._registrationId,
                context: this._contextName,
                id: id
            },
            item);
    }

    /**
     * Delete the item.
     * @param id The id of the item to remove.
     */
    public async remove(id: string): Promise<void> {
        const storageApiClient = new StorageApiClient(this._apiEndpoint);

        await storageApiClient.storageDelete(
            {
                registrationId: this._registrationId,
                context: this._contextName,
                id
            });
    }

    /**
     * Get all the paged items.
     * @param context The context of the items to get.
     * @param page The page number to get.
     * @param pageSize The page size to get.
     * @returns All the items for the page in the storage.
     */
    public async page(context?: string, page?: number | string, pageSize?: number | string): Promise<{
        /**
         * The ids of the items retrieved.
         */
        ids: string[];
        /**
         * The items.
         */
        items: T[];
        /**
         * The total number of items.
         */
        totalItems: number;
        /**
         * The total number of pages.
         */
        totalPages: number;
        /**
         * The page size.
         */
        pageSize: number;
    }> {
        const storageApiClient = new StorageApiClient(this._apiEndpoint);

        const response = await storageApiClient.storageList<T>(
            {
                registrationId: this._registrationId,
                context: this._contextName,
                page,
                pageSize
            });

        return {
            ids: response.ids || [],
            items: response.items || [],
            totalItems: response.totalItems || 0,
            totalPages: response.totalPages || 0,
            pageSize: response.pageSize || 0
        };
    }
}
