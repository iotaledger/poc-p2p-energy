import { IGrid } from "./IGrid";

export interface IGridPutRequest {
    /**
     * The name of the grid.
     */
    name: string;

    /**
     * The password to match for the update of the grid.
     */
    password?: string;

    /**
     * The data for the grid to update.
     */
    grid: IGrid;
}
