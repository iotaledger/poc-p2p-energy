import { IDemoGridState } from "../../../models/services/IDemoGridState";

export interface GridLiveContainerState {
    /**
     * Is the grid busy.
     */
    isBusy: boolean;

    /**
     * Is the grid errored.
     */
    isError: boolean;

    /**
     * The grid status.
     */
    status: string;

    /**
     * The grid state.
     */
    gridState?: IDemoGridState;
}
