export interface IGridPasswordPutRequest {
    /**
     * The name of the grid.
     */
    name: string;

    /**
     * The password to match for the update of the grid.
     */
    password?: string;
}
