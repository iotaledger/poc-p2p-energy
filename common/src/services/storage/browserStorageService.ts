import { IStorageService } from "../../models/services/IStorageService";

/**
 * Class to use local browser storage.
 */
export class BrowserStorageService<T> implements IStorageService<T> {
    /**
     * The root folder for the browser storage.
     */
    private readonly _rootFolder: string;

    /**
     * Create a new instance of BrowserStorageService
     * @param rootFolder The root folder for the browser storage.
     */
    constructor(rootFolder: string) {
        this._rootFolder = rootFolder;
    }

    /**
     * Load an item from local storage.
     * @param id The id of the item to load.
     * @returns The item loaded.
     */
    public async get(id: string): Promise<T> {
        let obj;
        if (window.localStorage) {
            try {
                const json = window.localStorage.getItem(`${this._rootFolder}/${id}`);

                if (json) {
                    obj = JSON.parse(json);
                }
            } catch (err) {
                // Nothing to do
            }
        }

        return obj;
    }

    /**
     * Save an item to local storage.
     * @param id The id of the item to store.
     * @param item The item to store.
     */
    public async set(id: string, item: T): Promise<void> {
        if (window.localStorage) {
            try {
                const json = JSON.stringify(item);
                window.localStorage.setItem(`${this._rootFolder}/${id}`, json);
            } catch (err) {
                // Nothing to do
            }
        }
    }

    /**
     * Remove an item from storage.
     * @param id The id of the item to store.
     */
    public async remove(id: string): Promise<void> {
        if (window.localStorage) {
            try {
                window.localStorage.removeItem(`${this._rootFolder}/${id}`);
            } catch (err) {
                // Nothing to do
            }
        }
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
        try {
            if (page === 0) {
                const items = [];
                const ids = [];
                const allKeys = window.localStorage.length;

                let keySep = `${this._rootFolder}/`;
                if (context) {
                    keySep += `${context}/`;
                }

                for (let i = 0; i < allKeys; i++) {
                    const key = window.localStorage.key(i);
                    if (key && key.startsWith(keySep)) {
                        ids.push(key.substr(keySep.length));
                        items.push(JSON.parse(window.localStorage.getItem(key)));
                    }
                }

                return {
                    ids,
                    items,
                    totalItems: items.length,
                    totalPages: 1,
                    pageSize: items.length
                };
            }
        } catch (err) {
        }
        return {
            ids: [],
            items: [],
            totalItems: 0,
            totalPages: 0,
            pageSize: 0
        };
    }
}
