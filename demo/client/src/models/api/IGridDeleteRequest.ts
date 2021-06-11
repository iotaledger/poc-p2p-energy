export interface IGridDeleteRequest {
    /**
     * The name of the grid.
     */
    name: string;

    /**
     * The password to match for the delete of the grid.
     */
    password?: string;
}
