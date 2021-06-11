import { IAWSS3Configuration } from "../../models/config/IAWSS3Configuration";
import { IStorageService } from "../../models/services/IStorageService";
import { PagingHelper } from "../../utils/pagingHelper";
import { AmazonS3Service } from "./amazonS3Service";

/**
 * Service to handle the storage using the storage api.
 */
export class AmazonS3StorageService<T> implements IStorageService<T> {
    /**
     * The aws configuration.
     */
    private readonly _config: IAWSS3Configuration;

    /**
     * The amazon s3 bucket name.
     */
    private readonly _bucketName: string;

    /**
     * Create a new instance of AmazonS3StorageService
     * @param config The aws configuration.
     * @param bucketName The bucket name.
     */
    constructor(config: IAWSS3Configuration, bucketName: string) {
        this._config = config;
        this._bucketName = bucketName;
    }

    /**
     * Get the item.
     * @param id The id of the item.
     * @returns The object retrieved from the service.
     */
    public async get(id: string): Promise<T> {
        const amazonS3Service = new AmazonS3Service(this._config, this._bucketName);

        return amazonS3Service.getItem<T>(`${id}.json`);
    }

    /**
     * Store the item.
     * @param id The id of the item to set.
     * @param item The item to set.
     */
    public async set(id: string, item: T): Promise<void> {
        const amazonS3Service = new AmazonS3Service(this._config, this._bucketName);

        await amazonS3Service.putItem(`${id}.json`, item);
    }

    /**
     * Delete the item.
     * @param id The id of the item to delete.
     */
    public async remove(id: string): Promise<void> {
        const amazonS3Service = new AmazonS3Service(this._config, this._bucketName);

        await amazonS3Service.deleteItem(id.endsWith("/") ? id : `${id}.json`);
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
        const amazonS3Service = new AmazonS3Service(this._config, this._bucketName);

        const allKeys = await amazonS3Service.list(context);

        const { firstItem, lastItem, normalizedPageSize } = PagingHelper.normalizeRequest(page, pageSize);

        const pageKeys = allKeys.slice(firstItem, lastItem);

        return {
            ids: pageKeys.map(id => id.replace(context, "").replace(".json", "")),
            items: await amazonS3Service.getAll(pageKeys),
            totalItems: allKeys.length,
            totalPages: Math.ceil(allKeys.length / normalizedPageSize),
            pageSize: normalizedPageSize
        };
    }
}
