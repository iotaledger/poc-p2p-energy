import { IGrid } from "../../../models/api/IGrid";

export interface GridConfigureProps {
    /**
     * The grid data.
     */
    grid: IGrid;

    /**
     * The grid was updated.
     */
    onChange(grid: IGrid): void;
}
