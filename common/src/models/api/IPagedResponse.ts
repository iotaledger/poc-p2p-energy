export interface IPagedResponse<T> {
    /**
     * The items to return.
     */
    items?: T[];

    /**
     * The total number of pages.
     */
    totalPages?: number;

    /**
     * The total number of items.
     */
    totalItems?: number;

    /**
     * The size of the page used in paging.
     */
    pageSize?: number;
}
