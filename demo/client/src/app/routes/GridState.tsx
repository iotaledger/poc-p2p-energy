import { IGrid } from "../../models/api/IGrid";

export interface GridState {
    /**
     * The grid name.
     */
    gridName: string;

    /**
     * The grid data.
     */
    grid?: IGrid;

    /**
     * Is the form data valid.
     */
    isValid?: boolean;

    /**
     * Is the form busy.
     */
    isBusy?: boolean;

    /**
     * Did any operations error.
     */
    isErrored?: boolean;

    /**
     * Status of form operations.
     */
    status: string;

    /**
     * The view to show when there is a grid.
     */
    view: string;
}
