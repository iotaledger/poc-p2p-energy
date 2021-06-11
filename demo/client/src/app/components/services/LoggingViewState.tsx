import { ILoggingEntry } from "p2p-energy-common/dist/models/services/ILoggingEntry";

export interface LoggingViewState {
    /**
     * Logging entries to display.
     */
    entries: ILoggingEntry[];

    /**
     * Is the view expanded.
     */
    isExpanded: boolean;
}
